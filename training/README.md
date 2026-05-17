# AgroCheck — Model Training

## Dataset
- **Source**: PlantVillage (Kaggle)
- **Classes**: 38 (o'simlik + kasallik kombinatsiyasi)
- **Train**: 43,455 rasm
- **Test**: 10,849 rasm

## Model
- **Arxitektura**: EfficientNet-B0 (ImageNet pretrained)
- **Input**: 224×224 RGB
- **Output**: 38 class logits
- **Params**: ~5.3M
- **GPU**: RTX 2050 4GB → batch 64, FP16 mixed precision

## O'qitish bosqichlari

```
Phase 1 (5 epoch)  — Backbone muzlatilgan, faqat classifier head o'qitiladi
Phase 2 (20 epoch) — Barcha layer o'qitiladi (backbone x0.1 LR, head x1.0 LR)
```

---

## 1. PyTorch o'rnatish (CUDA 12.x uchun)

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

## 2. Model o'qitish

```bash
cd training

python train.py \
  --data_dir ../dataset \
  --output_dir ./output \
  --epochs 25 \
  --batch_size 64 \
  --workers 4
```

**Taxminiy vaqt**: ~2-3 soat (RTX 2050)
**Taxminiy aniqlik**: 95-98% Top-1

### Agar GPU memory yetmasa:
```bash
python train.py --batch_size 32
```

## 3. Batafsil baholash

```bash
python evaluate.py \
  --checkpoint ./output/best_model.pth \
  --data_dir ../dataset
```

Chiqadi:
- `output/evaluation_results.json` — har bir klass uchun aniqlik
- `output/confusion_matrix.png`   — xato matritsa

## 4. ONNX ga eksport (production uchun)

```bash
python export.py --checkpoint ./output/best_model.pth
```

Yaratadi:
- `output/plant_disease_model.onnx` (~20 MB)
- `output/classes.json`

## 5. Model-worker'ga ulash

```bash
# Model fayllarini ko'chirish
mkdir -p ../backend/model-worker/app/models
cp output/plant_disease_model.onnx ../backend/model-worker/app/models/
cp output/classes.json              ../backend/model-worker/app/models/

# Yangi predictor'ni ko'chirish
cp predictor_onnx.py ../backend/model-worker/app/predictor.py
```

model-worker `requirements.txt` ga qo'shish:
```
onnxruntime==1.18.0
numpy==1.26.4
```

Keyin Docker'da rebuild:
```bash
cd .. && docker compose build model-worker && docker compose up -d model-worker
```

---

## Output fayllari

```
output/
  best_model.pth          ← eng yaxshi checkpoint (PyTorch)
  last_model.pth          ← oxirgi epoch checkpoint
  classes.json            ← 38 ta klass nomlari
  history.json            ← epoch bo'yicha loss/acc
  training_curves.png     ← grafik
  plant_disease_model.onnx← export (production)
  evaluation_results.json ← batafsil natijalar
  confusion_matrix.png    ← xato matritsa
```

## Augmentatsiyalar

| Augmentatsiya          | Parametr            |
|------------------------|---------------------|
| RandomResizedCrop      | scale 0.7–1.0       |
| RandomHorizontalFlip   | p=0.5               |
| RandomVerticalFlip     | p=0.5               |
| RandomRotation         | ±30°                |
| ColorJitter            | b/c/s=0.3, h=0.05   |
| RandomGrayscale        | p=0.05              |
| RandomErasing          | p=0.2, scale 2–15%  |
| Label Smoothing        | 0.1                 |
