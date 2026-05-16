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

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
from torch.cuda.amp import GradScaler, autocast
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm


# ──────────────────────────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--data_dir",   default="../dataset",  help="Root of dataset (has train/ and test/ subfolders)")
    p.add_argument("--output_dir", default="./output",    help="Where to save checkpoints and plots")
    p.add_argument("--img_size",   type=int, default=224, help="Input image size")
    p.add_argument("--batch_size", type=int, default=64,  help="Batch size (reduce to 32 if OOM)")
    p.add_argument("--epochs",     type=int, default=25,  help="Total epochs (phase1=5, phase2=rest)")
    p.add_argument("--workers",    type=int, default=4,   help="DataLoader workers")
    p.add_argument("--lr_head",    type=float, default=1e-3, help="LR for classifier head (phase 1)")
    p.add_argument("--lr_full",    type=float, default=3e-4, help="LR for full fine-tune (phase 2)")
    p.add_argument("--seed",       type=int, default=42)
    return p.parse_args()


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

    assert train_dir.exists(), f"train/ folder not found in {data_dir}"
    assert test_dir.exists(),  f"test/ folder not found in {data_dir}"

    train_ds = datasets.ImageFolder(str(train_dir), transform=get_transforms(img_size, is_train=True))
    test_ds  = datasets.ImageFolder(str(test_dir),  transform=get_transforms(img_size, is_train=False))

    # Sanity check: train and test must have same classes
    assert train_ds.classes == test_ds.classes, \
        "Train and test class lists differ — check your dataset folders"

    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=workers, pin_memory=True, persistent_workers=(workers > 0)
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size * 2, shuffle=False,
        num_workers=workers, pin_memory=True, persistent_workers=(workers > 0)
    )

    print(f"  Classes : {len(train_ds.classes)}")
    print(f"  Train   : {len(train_ds):,} images")
    print(f"  Test    : {len(test_ds):,} images")

    return train_loader, test_loader, train_ds.classes


# ──────────────────────────────────────────────────────────────────────────────
# Model
# ──────────────────────────────────────────────────────────────────────────────

def build_model(num_classes: int, device: torch.device) -> nn.Module:
    """EfficientNet-B0 pretrained on ImageNet, classifier replaced."""
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)

    # Freeze backbone
    for p in model.parameters():
        p.requires_grad = False

    # Replace classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, num_classes),
    )
    return model.to(device)


def unfreeze_backbone(model: nn.Module, lr_full: float, device: torch.device):
    """Unfreeze all layers and return a new optimizer for full fine-tuning."""
    for p in model.parameters():
        p.requires_grad = True

    # Lower LR for backbone, higher for head
    optimizer = torch.optim.AdamW([
        {"params": model.features.parameters(), "lr": lr_full * 0.1},
        {"params": model.classifier.parameters(), "lr": lr_full},
    ], weight_decay=1e-4)
    return optimizer


# ──────────────────────────────────────────────────────────────────────────────
# Train / Eval loops
# ──────────────────────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, optimizer, criterion, scaler, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    bar = tqdm(loader, desc="  train", leave=False, ncols=90)
    for images, labels in bar:
        images, labels = images.to(device, non_blocking=True), labels.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)
        with autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()

        bs = labels.size(0)
        total_loss += loss.item() * bs
        correct    += (outputs.argmax(1) == labels).sum().item()
        total      += bs
        bar.set_postfix(loss=f"{loss.item():.3f}", acc=f"{correct/total:.3f}")

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0

    for images, labels in tqdm(loader, desc="  eval ", leave=False, ncols=90):
        images, labels = images.to(device, non_blocking=True), labels.to(device, non_blocking=True)
        with autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        bs = labels.size(0)
        total_loss += loss.item() * bs
        correct    += (outputs.argmax(1) == labels).sum().item()
        total      += bs

    return total_loss / total, correct / total


# ──────────────────────────────────────────────────────────────────────────────
# Plotting
# ──────────────────────────────────────────────────────────────────────────────

def save_plots(history: dict, output_dir: Path):
    epochs = range(1, len(history["train_acc"]) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    axes[0].plot(epochs, history["train_loss"], label="Train loss", color="#0a3d2e")
    axes[0].plot(epochs, history["val_loss"],   label="Val loss",   color="#d4a017", linestyle="--")
    axes[0].set_title("Loss"); axes[0].legend(); axes[0].set_xlabel("Epoch")
    axes[0].grid(alpha=0.3)

    axes[1].plot(epochs, [x * 100 for x in history["train_acc"]], label="Train acc", color="#0a3d2e")
    axes[1].plot(epochs, [x * 100 for x in history["val_acc"]],   label="Val acc",   color="#d4a017", linestyle="--")
    axes[1].set_title("Accuracy (%)"); axes[1].legend(); axes[1].set_xlabel("Epoch")
    axes[1].grid(alpha=0.3)
    axes[1].set_ylim([0, 100])

    plt.suptitle("AgroCheck — EfficientNet-B0 Training", fontsize=13)
    plt.tight_layout()
    path = output_dir / "training_curves.png"
    plt.savefig(path, dpi=120)
    plt.close()
    print(f"\n  Plot saved → {path}")


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*60}")
    print(f"  AgroCheck — Plant Disease Classifier")
    print(f"  Device : {device}" + (f" ({torch.cuda.get_device_name()})" if device.type == "cuda" else ""))
    print(f"  Config : img={args.img_size}  batch={args.batch_size}  epochs={args.epochs}")
    print(f"{'='*60}\n")

    # ── Data ──
    print("[1/4] Loading dataset...")
    train_loader, test_loader, classes = build_loaders(
        args.data_dir, args.img_size, args.batch_size, args.workers
    )
    num_classes = len(classes)

    # Save class names for inference
    class_file = output_dir / "classes.json"
    with open(class_file, "w") as f:
        json.dump(classes, f, indent=2)
    print(f"  Classes saved → {class_file}")

    # ── Model ──
    print("\n[2/4] Building model...")
    model = build_model(num_classes, device)
    print(f"  EfficientNet-B0 loaded (backbone frozen)")

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    scaler    = GradScaler()

    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    best_acc = 0.0

    # ── Phase 1: Train head only ──
    PHASE1_EPOCHS = min(5, args.epochs)
    print(f"\n[3/4] Phase 1 — training classifier head ({PHASE1_EPOCHS} epochs, LR={args.lr_head})")

    optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=args.lr_head, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.OneCycleLR(
        optimizer, max_lr=args.lr_head,
        steps_per_epoch=len(train_loader), epochs=PHASE1_EPOCHS
    )

    for epoch in range(1, PHASE1_EPOCHS + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion, scaler, device)
        val_loss,   val_acc   = evaluate(model, test_loader, criterion, device)
        scheduler.step()

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        elapsed = time.time() - t0
        print(f"  Epoch {epoch:02d}/{PHASE1_EPOCHS} | "
              f"train_loss={train_loss:.4f}  train_acc={train_acc*100:.2f}%  |  "
              f"val_loss={val_loss:.4f}  val_acc={val_acc*100:.2f}%  | "
              f"{elapsed:.0f}s")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({"epoch": epoch, "model_state": model.state_dict(), "val_acc": val_acc, "classes": classes},
                       output_dir / "best_model.pth")
            print(f"    ✓ Best model saved (val_acc={val_acc*100:.2f}%)")

    # ── Phase 2: Full fine-tune ──
    PHASE2_EPOCHS = max(0, args.epochs - PHASE1_EPOCHS)
    if PHASE2_EPOCHS > 0:
        print(f"\n[4/4] Phase 2 — full fine-tuning ({PHASE2_EPOCHS} epochs, LR={args.lr_full})")
        optimizer = unfreeze_backbone(model, args.lr_full, device)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=PHASE2_EPOCHS, eta_min=1e-6)

        for epoch in range(1, PHASE2_EPOCHS + 1):
            t0 = time.time()
            train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion, scaler, device)
            val_loss,   val_acc   = evaluate(model, test_loader, criterion, device)
            scheduler.step()

            history["train_loss"].append(train_loss)
            history["train_acc"].append(train_acc)
            history["val_loss"].append(val_loss)
            history["val_acc"].append(val_acc)

            elapsed = time.time() - t0
            total_epoch = PHASE1_EPOCHS + epoch
            print(f"  Epoch {total_epoch:02d}/{args.epochs} | "
                  f"train_loss={train_loss:.4f}  train_acc={train_acc*100:.2f}%  |  "
                  f"val_loss={val_loss:.4f}  val_acc={val_acc*100:.2f}%  | "
                  f"{elapsed:.0f}s")

            if val_acc > best_acc:
                best_acc = val_acc
                torch.save({"epoch": total_epoch, "model_state": model.state_dict(), "val_acc": val_acc, "classes": classes},
                           output_dir / "best_model.pth")
                print(f"    ✓ Best model saved (val_acc={val_acc*100:.2f}%)")

    # ── Save last model ──
    torch.save({"epoch": args.epochs, "model_state": model.state_dict(), "val_acc": val_acc, "classes": classes},
               output_dir / "last_model.pth")

    # ── Save history ──
    with open(output_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    # ── Plot ──
    save_plots(history, output_dir)

    print(f"\n{'='*60}")
    print(f"  Training complete!")
    print(f"  Best val accuracy : {best_acc*100:.2f}%")
    print(f"  Checkpoint        : {output_dir / 'best_model.pth'}")
    print(f"  Next step         : python export.py --checkpoint {output_dir / 'best_model.pth'}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
