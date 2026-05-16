"""
AgroCheck — Plant Disease Classifier Training
Model  : EfficientNet-B0 (pretrained on ImageNet)
Dataset: PlantVillage  (38 classes, 43 455 train / 10 849 test)
GPU    : RTX 2050 4 GB  →  batch 64, mixed precision (FP16)

Usage:
    python train.py --data_dir ../dataset --output_dir ./output --epochs 25
"""

import argparse
import json
import os
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

from rich import box
from rich.columns import Columns
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    SpinnerColumn,
    TaskProgressColumn,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

console = Console()

# ──────────────────────────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--data_dir",   default="../dataset")
    p.add_argument("--output_dir", default="./output")
    p.add_argument("--img_size",   type=int,   default=224)
    p.add_argument("--batch_size", type=int,   default=64)
    p.add_argument("--epochs",     type=int,   default=25)
    p.add_argument("--workers",    type=int,   default=4)
    p.add_argument("--lr_head",    type=float, default=1e-3)
    p.add_argument("--lr_full",    type=float, default=3e-4)
    p.add_argument("--seed",       type=int,   default=42)
    return p.parse_args()


# ──────────────────────────────────────────────────────────────────────────────
# Rich helpers
# ──────────────────────────────────────────────────────────────────────────────

def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(spinner_name="dots", style="green"),
        TextColumn("[bold cyan]{task.description}"),
        BarColumn(bar_width=36, complete_style="green", finished_style="bright_green"),
        TaskProgressColumn(),
        MofNCompleteColumn(),
        TextColumn("·"),
        TimeElapsedColumn(),
        TextColumn("ETA"),
        TimeRemainingColumn(),
        TextColumn("·"),
        TextColumn("{task.fields[suffix]}", style="dim"),
        console=console,
        refresh_per_second=8,
    )


def gpu_mem() -> str:
    if not torch.cuda.is_available():
        return ""
    used  = torch.cuda.memory_reserved() / 1e9
    total = torch.cuda.get_device_properties(0).total_memory / 1e9
    return f"GPU {used:.1f}/{total:.1f}GB"


def color_acc(acc: float) -> str:
    pct = acc * 100
    if pct >= 97:
        return f"[bold bright_green]{pct:.2f}%[/]"
    if pct >= 93:
        return f"[bold green]{pct:.2f}%[/]"
    if pct >= 85:
        return f"[bold yellow]{pct:.2f}%[/]"
    return f"[bold red]{pct:.2f}%[/]"


def color_loss(loss: float) -> str:
    if loss < 0.15:
        return f"[bright_green]{loss:.4f}[/]"
    if loss < 0.35:
        return f"[green]{loss:.4f}[/]"
    if loss < 0.70:
        return f"[yellow]{loss:.4f}[/]"
    return f"[red]{loss:.4f}[/]"


def print_header(args, device: torch.device, num_classes: int, train_size: int, test_size: int):
    console.print()
    console.print(Rule("[bold green]  AgroCheck — Plant Disease Classifier  ", style="green"))
    console.print()

    # Two-column info panel
    left = Table.grid(padding=(0, 2))
    left.add_column(style="dim")
    left.add_column(style="bold white")
    left.add_row("Device",   str(device) + (f" ({torch.cuda.get_device_name()})" if device.type == "cuda" else ""))
    left.add_row("Model",    "EfficientNet-B0 (ImageNet pretrained)")
    left.add_row("Classes",  str(num_classes))
    left.add_row("Train",    f"{train_size:,} images")
    left.add_row("Test",     f"{test_size:,} images")

    right = Table.grid(padding=(0, 2))
    right.add_column(style="dim")
    right.add_column(style="bold white")
    right.add_row("Img size",   f"{args.img_size}×{args.img_size}")
    right.add_row("Batch",      str(args.batch_size))
    right.add_row("Epochs",     str(args.epochs))
    right.add_row("LR head",    str(args.lr_head))
    right.add_row("LR full",    str(args.lr_full))

    console.print(Panel(Columns([left, right], equal=True, expand=True),
                        title="[bold]Configuration", border_style="green", padding=(1, 2)))
    console.print()


def print_phase_banner(phase: int, epochs: int, description: str):
    emoji = "🔒" if phase == 1 else "🔓"
    console.print(Rule(
        f"{emoji}  [bold cyan]Phase {phase}[/] — {description} [dim]({epochs} epochs)[/dim]",
        style="cyan"
    ))
    console.print()


def build_epoch_table() -> Table:
    t = Table(
        box=box.ROUNDED,
        border_style="dim",
        show_header=True,
        header_style="bold cyan",
        padding=(0, 1),
    )
    t.add_column("Epoch",      justify="center", width=7)
    t.add_column("Phase",      justify="center", width=7)
    t.add_column("Train Loss", justify="right",  width=11)
    t.add_column("Train Acc",  justify="right",  width=11)
    t.add_column("Val Loss",   justify="right",  width=11)
    t.add_column("Val Acc",    justify="right",  width=11)
    t.add_column("LR",         justify="right",  width=10)
    t.add_column("Time",       justify="right",  width=8)
    t.add_column("",           justify="center", width=4)
    return t


# ──────────────────────────────────────────────────────────────────────────────
# Data
# ──────────────────────────────────────────────────────────────────────────────

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]


def get_transforms(img_size: int, is_train: bool):
    if is_train:
        return transforms.Compose([
            transforms.RandomResizedCrop(img_size, scale=(0.7, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(30),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
            transforms.RandomGrayscale(p=0.05),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            transforms.RandomErasing(p=0.2, scale=(0.02, 0.15)),
        ])
    return transforms.Compose([
        transforms.Resize(int(img_size * 1.14)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])


def build_loaders(data_dir: str, img_size: int, batch_size: int, workers: int):
    train_dir = Path(data_dir) / "train"
    test_dir  = Path(data_dir) / "test"
    assert train_dir.exists(), f"train/ not found in {data_dir}"
    assert test_dir.exists(),  f"test/  not found in {data_dir}"

    train_ds = datasets.ImageFolder(str(train_dir), transform=get_transforms(img_size, True))
    test_ds  = datasets.ImageFolder(str(test_dir),  transform=get_transforms(img_size, False))
    assert train_ds.classes == test_ds.classes, "Train/test class mismatch"

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=workers, pin_memory=True, persistent_workers=(workers > 0))
    test_loader  = DataLoader(test_ds,  batch_size=batch_size * 2, shuffle=False,
                              num_workers=workers, pin_memory=True, persistent_workers=(workers > 0))
    return train_loader, test_loader, train_ds.classes


# ──────────────────────────────────────────────────────────────────────────────
# Model
# ──────────────────────────────────────────────────────────────────────────────

def build_model(num_classes: int, device: torch.device) -> nn.Module:
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
    for p in model.parameters():
        p.requires_grad = False
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, num_classes),
    )
    return model.to(device)


def unfreeze_backbone(model: nn.Module, lr_full: float):
    for p in model.parameters():
        p.requires_grad = True
    return torch.optim.AdamW([
        {"params": model.features.parameters(),    "lr": lr_full * 0.1},
        {"params": model.classifier.parameters(),  "lr": lr_full},
    ], weight_decay=1e-4)


def current_lr(optimizer) -> float:
    return optimizer.param_groups[-1]["lr"]


# ──────────────────────────────────────────────────────────────────────────────
# Train / Eval
# ──────────────────────────────────────────────────────────────────────────────

def run_epoch(model, loader, optimizer, criterion, scaler, device,
              progress: Progress, task_id, is_train: bool):
    model.train(is_train)
    total_loss, correct, total = 0.0, 0, 0

    ctx = torch.enable_grad() if is_train else torch.no_grad()
    with ctx:
        for images, labels in loader:
            images = images.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            if is_train:
                optimizer.zero_grad(set_to_none=True)

            with autocast():
                out  = model(images)
                loss = criterion(out, labels)

            if is_train:
                scaler.scale(loss).backward()
                scaler.unscale_(optimizer)
                nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                scaler.step(optimizer)
                scaler.update()

            bs          = labels.size(0)
            total_loss += loss.item() * bs
            correct    += (out.argmax(1) == labels).sum().item()
            total      += bs

            acc_now  = correct / total
            loss_now = total_loss / total
            progress.update(task_id, advance=1,
                            suffix=f"loss={loss_now:.3f}  acc={acc_now*100:.1f}%  {gpu_mem()}")

    return total_loss / total, correct / total


# ──────────────────────────────────────────────────────────────────────────────
# Plots
# ──────────────────────────────────────────────────────────────────────────────

def save_plots(history: dict, output_dir: Path):
    epochs = range(1, len(history["train_acc"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].plot(epochs, history["train_loss"], label="Train loss", color="#0a3d2e", linewidth=2)
    axes[0].plot(epochs, history["val_loss"],   label="Val loss",   color="#d4a017", linewidth=2, linestyle="--")
    axes[0].set_title("Loss", fontsize=13); axes[0].legend(); axes[0].grid(alpha=0.3)
    axes[1].plot(epochs, [x*100 for x in history["train_acc"]], label="Train acc", color="#0a3d2e", linewidth=2)
    axes[1].plot(epochs, [x*100 for x in history["val_acc"]],   label="Val acc",   color="#d4a017", linewidth=2, linestyle="--")
    axes[1].set_title("Accuracy (%)", fontsize=13); axes[1].legend(); axes[1].set_ylim([0, 100])
    axes[1].grid(alpha=0.3)
    plt.suptitle("AgroCheck — EfficientNet-B0", fontsize=14)
    plt.tight_layout()
    path = output_dir / "training_curves.png"
    plt.savefig(path, dpi=120); plt.close()
    return path


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()
    torch.manual_seed(args.seed); np.random.seed(args.seed)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── Data ──
    with console.status("[bold green]Loading dataset…", spinner="dots"):
        train_loader, test_loader, classes = build_loaders(
            args.data_dir, args.img_size, args.batch_size, args.workers)
    num_classes = len(classes)

    # ── Header ──
    print_header(args, device, num_classes,
                 len(train_loader.dataset), len(test_loader.dataset))

    # Save class names
    with open(output_dir / "classes.json", "w") as f:
        json.dump(classes, f, indent=2)

    # ── Model ──
    with console.status("[bold green]Building model…", spinner="dots"):
        model = build_model(num_classes, device)
    console.print(f"[green]✓[/] EfficientNet-B0 loaded  "
                  f"[dim]({sum(p.numel() for p in model.parameters())/1e6:.1f}M params total, "
                  f"{sum(p.numel() for p in model.classifier.parameters())/1e3:.0f}K trainable)[/]\n")

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    scaler    = GradScaler()

    history  = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    best_acc = 0.0
    epoch_table = build_epoch_table()

    PHASE1 = min(5, args.epochs)
    PHASE2 = max(0, args.epochs - PHASE1)

    # ─────────────────────────────────────────────────────── Phase 1
    print_phase_banner(1, PHASE1, "Classifier head only  [dim](backbone frozen)[/dim]")

    optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=args.lr_head, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.OneCycleLR(
        optimizer, max_lr=args.lr_head,
        steps_per_epoch=len(train_loader), epochs=PHASE1)

    for epoch in range(1, PHASE1 + 1):
        t0 = time.time()

        with make_progress() as prog:
            train_task = prog.add_task(
                f"[cyan]Epoch {epoch:02d}/{args.epochs} train",
                total=len(train_loader), suffix="")
            train_loss, train_acc = run_epoch(
                model, train_loader, optimizer, criterion, scaler,
                device, prog, train_task, is_train=True)
            scheduler.step()

            val_task = prog.add_task(
                f"[blue]Epoch {epoch:02d}/{args.epochs} val  ",
                total=len(test_loader), suffix="")
            val_loss, val_acc = run_epoch(
                model, test_loader, None, criterion, scaler,
                device, prog, val_task, is_train=False)

        elapsed = time.time() - t0
        is_best = val_acc > best_acc
        if is_best:
            best_acc = val_acc
            torch.save({"epoch": epoch, "model_state": model.state_dict(),
                        "val_acc": val_acc, "classes": classes},
                       output_dir / "best_model.pth")

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        epoch_table.add_row(
            f"{epoch}/{args.epochs}",
            "[yellow]HEAD[/]",
            color_loss(train_loss), color_acc(train_acc),
            color_loss(val_loss),   color_acc(val_acc),
            f"{current_lr(optimizer):.2e}",
            f"{elapsed:.0f}s",
            "[bold green]★[/]" if is_best else "",
        )
        console.print(epoch_table)
        console.print()

    # ─────────────────────────────────────────────────────── Phase 2
    if PHASE2 > 0:
        print_phase_banner(2, PHASE2, "Full fine-tune  [dim](all layers unfrozen)[/dim]")

        optimizer = unfreeze_backbone(model, args.lr_full)
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        console.print(f"[green]✓[/] Backbone unfrozen  "
                      f"[dim]({trainable/1e6:.1f}M trainable params)[/]\n")

        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            optimizer, T_max=PHASE2, eta_min=1e-6)

        for epoch in range(1, PHASE2 + 1):
            t0 = time.time()
            total_ep = PHASE1 + epoch

            with make_progress() as prog:
                train_task = prog.add_task(
                    f"[cyan]Epoch {total_ep:02d}/{args.epochs} train",
                    total=len(train_loader), suffix="")
                train_loss, train_acc = run_epoch(
                    model, train_loader, optimizer, criterion, scaler,
                    device, prog, train_task, is_train=True)
                scheduler.step()

                val_task = prog.add_task(
                    f"[blue]Epoch {total_ep:02d}/{args.epochs} val  ",
                    total=len(test_loader), suffix="")
                val_loss, val_acc = run_epoch(
                    model, test_loader, None, criterion, scaler,
                    device, prog, val_task, is_train=False)

            elapsed = time.time() - t0
            is_best = val_acc > best_acc
            if is_best:
                best_acc = val_acc
                torch.save({"epoch": total_ep, "model_state": model.state_dict(),
                            "val_acc": val_acc, "classes": classes},
                           output_dir / "best_model.pth")

            history["train_loss"].append(train_loss)
            history["train_acc"].append(train_acc)
            history["val_loss"].append(val_loss)
            history["val_acc"].append(val_acc)

            epoch_table.add_row(
                f"{total_ep}/{args.epochs}",
                "[green]FULL[/]",
                color_loss(train_loss), color_acc(train_acc),
                color_loss(val_loss),   color_acc(val_acc),
                f"{current_lr(optimizer):.2e}",
                f"{elapsed:.0f}s",
                "[bold green]★[/]" if is_best else "",
            )
            console.print(epoch_table)
            console.print()

    # ── Save last + history ──
    torch.save({"epoch": args.epochs, "model_state": model.state_dict(),
                "val_acc": val_acc, "classes": classes},
               output_dir / "last_model.pth")
    with open(output_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    # ── Plots ──
    plot_path = save_plots(history, output_dir)

    # ── Final summary ──
    console.print()
    console.print(Rule("[bold green]  Training Complete  ", style="green"))

    summary = Table(box=box.SIMPLE_HEAVY, border_style="green", padding=(0, 2))
    summary.add_column("", style="dim", width=22)
    summary.add_column("", style="bold white")
    summary.add_row("Best val accuracy",  f"[bold bright_green]{best_acc*100:.2f}%[/]")
    summary.add_row("Best checkpoint",    str(output_dir / "best_model.pth"))
    summary.add_row("Training curves",   str(plot_path))
    summary.add_row("Classes saved",     str(output_dir / "classes.json"))
    summary.add_row("Next step",
        "[dim]python export.py --checkpoint " + str(output_dir / "best_model.pth") + "[/]")
    console.print(Panel(summary, border_style="green", padding=(1, 2)))
    console.print()


if __name__ == "__main__":
    main()
