"""
Detailed evaluation: per-class accuracy, confusion matrix, top-5 errors.

Usage:
    python evaluate.py --checkpoint ./output/best_model.pth --data_dir ../dataset
"""

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
from torch.cuda.amp import autocast
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm


IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--data_dir",   default="../dataset")
    p.add_argument("--img_size",   type=int, default=224)
    p.add_argument("--batch_size", type=int, default=128)
    p.add_argument("--workers",    type=int, default=4)
    return p.parse_args()


def load_model(checkpoint_path: str, device: torch.device):
    ckpt = torch.load(checkpoint_path, map_location=device)
    classes = ckpt["classes"]
    num_classes = len(classes)

    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    import torch.nn as nn
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, num_classes),
    )
    model.load_state_dict(ckpt["model_state"])
    model = model.to(device)
    model.eval()
    return model, classes


def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nDevice: {device}")

    # Load model
    print("Loading checkpoint...")
    model, classes = load_model(args.checkpoint, device)
    num_classes = len(classes)
    print(f"  {num_classes} classes loaded")

    # Load test data
    test_dir = Path(args.data_dir) / "test"
    transform = transforms.Compose([
        transforms.Resize(int(args.img_size * 1.14)),
        transforms.CenterCrop(args.img_size),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    test_ds = datasets.ImageFolder(str(test_dir), transform=transform)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False,
                             num_workers=args.workers, pin_memory=True)

    output_dir = Path(args.checkpoint).parent

    # ── Collect predictions ──
    all_preds, all_labels, all_probs = [], [], []

    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc="Evaluating", ncols=80):
            images = images.to(device, non_blocking=True)
            with autocast():
                logits = model(images)
            probs = torch.softmax(logits, dim=1).cpu()
            preds = probs.argmax(dim=1)

            all_preds.append(preds.numpy())
            all_labels.append(labels.numpy())
            all_probs.append(probs.numpy())

    all_preds  = np.concatenate(all_preds)
    all_labels = np.concatenate(all_labels)
    all_probs  = np.concatenate(all_probs)

    # ── Overall metrics ──
    top1_acc = (all_preds == all_labels).mean()
    top5_acc = np.mean([all_labels[i] in np.argsort(all_probs[i])[-5:] for i in range(len(all_labels))])

    print(f"\n{'='*55}")
    print(f"  Overall Top-1 Accuracy : {top1_acc*100:.2f}%")
    print(f"  Overall Top-5 Accuracy : {top5_acc*100:.2f}%")
    print(f"  Total test images      : {len(all_labels):,}")
    print(f"{'='*55}")

    # ── Per-class accuracy ──
    print("\nPer-class accuracy:")
    per_class = {}
    for i, cls in enumerate(classes):
        mask = all_labels == i
        if mask.sum() == 0:
            continue
        acc = (all_preds[mask] == i).mean()
        per_class[cls] = float(acc)
        label = cls.replace("___", " · ").replace("_", " ")
        bar = "█" * int(acc * 20) + "░" * (20 - int(acc * 20))
        print(f"  {label:<45} {bar} {acc*100:5.1f}%  ({mask.sum()} imgs)")

    # ── Confusion matrix (top-15 classes) ──
    print("\nGenerating confusion matrix...")
    # Only show classes with most errors to keep it readable
    class_errors = {i: (all_preds[all_labels == i] != i).sum() for i in range(num_classes)}
    top_error_classes = sorted(class_errors, key=lambda x: -class_errors[x])[:15]

    mask = np.isin(all_labels, top_error_classes)
    sub_preds  = all_preds[mask]
    sub_labels = all_labels[mask]

    # Remap to 0..N
    idx_map = {old: new for new, old in enumerate(top_error_classes)}
    sub_preds_r  = np.array([idx_map.get(p, -1) for p in sub_preds])
    sub_labels_r = np.array([idx_map[l] for l in sub_labels])
    valid = sub_preds_r >= 0
    sub_preds_r  = sub_preds_r[valid]
    sub_labels_r = sub_labels_r[valid]

    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(sub_labels_r, sub_preds_r, labels=list(range(len(top_error_classes))))
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True).clip(1)

    tick_labels = [classes[i].replace("___", "\n").replace("_", " ")[:20] for i in top_error_classes]

    fig, ax = plt.subplots(figsize=(14, 12))
    sns.heatmap(cm_norm, annot=False, fmt=".2f", cmap="Greens",
                xticklabels=tick_labels, yticklabels=tick_labels, ax=ax, linewidths=0.3)
    ax.set_title("Confusion Matrix — Top-15 error classes (normalized)", fontsize=13)
    ax.set_xlabel("Predicted"); ax.set_ylabel("True")
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    cm_path = output_dir / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=120)
    plt.close()
    print(f"  Saved → {cm_path}")

    # ── Save results ──
    results = {
        "top1_accuracy": round(top1_acc * 100, 2),
        "top5_accuracy": round(top5_acc * 100, 2),
        "total_images": int(len(all_labels)),
        "per_class_accuracy": {k: round(v * 100, 2) for k, v in per_class.items()},
    }
    out_path = output_dir / "evaluation_results.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"  Results saved → {out_path}")

    print(f"\n  Done. Top-1: {top1_acc*100:.2f}%\n")


if __name__ == "__main__":
    main()
