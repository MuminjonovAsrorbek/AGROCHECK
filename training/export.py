"""
Export trained model to ONNX format for production inference.
ONNX runs on CPU without PyTorch installed (just onnxruntime).

Usage:
    python export.py --checkpoint ./output/best_model.pth
    # → output/plant_disease_model.onnx
    # → output/classes.json
"""

import argparse
import json
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--checkpoint", required=True, help="Path to best_model.pth")
    p.add_argument("--img_size",   type=int, default=224)
    return p.parse_args()


def load_model(checkpoint_path: str, device: torch.device):
    ckpt = torch.load(checkpoint_path, map_location=device)
    classes = ckpt["classes"]
    num_classes = len(classes)

    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.0, inplace=False),   # disable dropout for export
        nn.Linear(in_features, num_classes),
    )
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model.to(device), classes


def main():
    args = parse_args()
    ckpt_path = Path(args.checkpoint)
    output_dir = ckpt_path.parent
    device = torch.device("cpu")   # export on CPU for portability

    print(f"\nLoading checkpoint: {ckpt_path}")
    model, classes = load_model(str(ckpt_path), device)
    print(f"  {len(classes)} classes")

    # ── Export to ONNX ──
    dummy = torch.randn(1, 3, args.img_size, args.img_size)
    onnx_path = output_dir / "plant_disease_model.onnx"

    torch.onnx.export(
        model, dummy, str(onnx_path),
        opset_version=17,
        input_names=["image"],
        output_names=["logits"],
        dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
    )
    print(f"\n  ONNX model saved → {onnx_path}")
    print(f"  File size        : {onnx_path.stat().st_size / 1e6:.1f} MB")

    # ── Save classes alongside ──
    classes_path = output_dir / "classes.json"
    with open(classes_path, "w") as f:
        json.dump(classes, f, indent=2)
    print(f"  Classes saved    → {classes_path}")

    # ── Quick ONNX sanity check ──
    try:
        import onnxruntime as ort
        sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
        out = sess.run(None, {"image": dummy.numpy()})
        print(f"\n  ONNX sanity check passed (output shape: {out[0].shape})")
    except ImportError:
        print("\n  onnxruntime not installed — skipping sanity check")
        print("  Install with: pip install onnxruntime")

    print(f"\n  Next step: copy these two files to the model-worker:")
    print(f"    {onnx_path}")
    print(f"    {classes_path}")
    print()


if __name__ == "__main__":
    main()
