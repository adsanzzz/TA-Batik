import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet_v2 import EfficientNetV2B0, preprocess_input
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
import numpy as np
import os
import json
import seaborn as sns
import pandas as pd
from PIL import Image, UnidentifiedImageError

from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ========================
# Parameter
# ========================
img_size = 224
batch_size = 16
epochs_phase1 = 20
epochs_phase2 = 30

dataset_dir = "train/dataset"
seed = 42

# ========================
# Pre-scan dataset to filter out unreadable/corrupt images and report them
def build_dataframe_for_split(dataset_dir, split):
    records = []
    corrupt = []

    split_path = os.path.join(dataset_dir, split)
    if not os.path.exists(split_path):
        print(f"Folder tidak ditemukan (skip): {split_path}")
        return pd.DataFrame(records), corrupt

    for class_name in sorted(os.listdir(split_path)):
        class_dir = os.path.join(split_path, class_name)
        if not os.path.isdir(class_dir):
            continue

        for fname in os.listdir(class_dir):
            if not fname.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                continue

            path = os.path.join(class_dir, fname)
            try:
                with Image.open(path) as img:
                    img.verify()
                # reopen to ensure full load
                with Image.open(path) as img:
                    img.load()
                records.append({"filename": path, "class": class_name})
            except Exception as e:
                corrupt.append((path, str(e)))

    df = pd.DataFrame(records)
    return df, corrupt

# ========================
# Data Generator
# ========================
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,

    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.15,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2],
    fill_mode="nearest"
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

# ========================
# Train Generator
# ========================
train_df, corrupt_train = build_dataframe_for_split(dataset_dir, 'train')
val_df, corrupt_val = build_dataframe_for_split(dataset_dir, 'val')
test_df, corrupt_test = build_dataframe_for_split(dataset_dir, 'test')

with open('corrupt_files.log', 'w', encoding='utf-8') as clog:
    total_corrupt = 0
    for split_name, corrupt_list in [('train', corrupt_train), ('val', corrupt_val), ('test', corrupt_test)]:
        if corrupt_list:
            clog.write(f'--- {split_name} ---\n')
            for p, err in corrupt_list:
                clog.write(f"{p}\t{err}\n")
            clog.write('\n')
            total_corrupt += len(corrupt_list)

    print(f"Total corrupt files detected during scanning: {total_corrupt}")

train_generator = train_datagen.flow_from_dataframe(
    dataframe=train_df,
    x_col='filename',
    y_col='class',
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True,
    seed=seed
)

if hasattr(train_generator, 'num_classes'):
    num_classes = train_generator.num_classes
else:
    num_classes = len(train_generator.class_indices)

val_generator = val_datagen.flow_from_dataframe(
    dataframe=val_df,
    x_col='filename',
    y_col='class',
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

test_generator = test_datagen.flow_from_dataframe(
    dataframe=test_df,
    x_col='filename',
    y_col='class',
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False
)

# ========================
# Class Weight
# ========================
class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(train_generator.classes),
    y=train_generator.classes
)

class_weights = dict(enumerate(class_weights))

print("\nClass Weights:")
print(class_weights)

# ========================
# Save Labels
# ========================
class_indices = train_generator.class_indices

with open("labels.json", "w") as f:
    json.dump(class_indices, f)

print("\nLabel berhasil disimpan!")
print(class_indices)

# ========================
# Model
# ========================
base_model = EfficientNetV2B0(
    input_shape=(img_size, img_size, 3),
    include_top=False,
    weights="imagenet",
    pooling='avg'
)

# Freeze awal
base_model.trainable = False

model = models.Sequential([
    base_model,

    layers.BatchNormalization(),

    layers.Dropout(0.3),

    layers.Dense(
        256,
        activation="relu",
        kernel_regularizer=tf.keras.regularizers.l2(0.01)
    ),

    layers.BatchNormalization(),

    layers.Dropout(0.4),

    layers.Dense(
        num_classes,
        activation="softmax"
    )
])

# ========================
# Compile Phase 1
# ========================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ========================
# Callbacks Phase 1
# ========================
callbacks_phase1 = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=7,
        restore_best_weights=True
    )
]

# ========================
# Training Phase 1
# ========================
print("\n=== Phase 1: Train Classifier Only ===")

history_phase1 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=epochs_phase1,
    class_weight=class_weights,
    callbacks=callbacks_phase1
)

# ========================
# Fine Tuning
# ========================
print("\n=== Phase 2: Fine Tuning ===")

base_model.trainable = True

fine_tune_at = len(base_model.layers) - 50

for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False


model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ========================
# Callbacks Phase 2
# ========================
callbacks_phase2 = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=3,
        min_lr=1e-7
    )
]

# ========================
# Training Phase 2
# ========================
history_phase2 = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=epochs_phase2,
    class_weight=class_weights,
    callbacks=callbacks_phase2
)

# ========================
# Plot Training History
# ========================
def plot_history(history_list, title):

    acc = []
    val_acc = []
    loss = []
    val_loss = []

    for hist in history_list:
        acc.extend(hist.history["accuracy"])
        val_acc.extend(hist.history["val_accuracy"])
        loss.extend(hist.history["loss"])
        val_loss.extend(hist.history["val_loss"])

    plt.figure(figsize=(12, 5))

    # Accuracy
    plt.subplot(1, 2, 1)

    plt.plot(acc, label="Train Accuracy")
    plt.plot(val_acc, label="Validation Accuracy")

    if len(history_list) > 1:
        plt.axvline(
            x=len(history_list[0].history['accuracy']) - 1,
            color='r',
            linestyle='--',
            label='Start Fine Tuning'
        )

    plt.title(f"Accuracy - {title}")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid()

    # Loss
    plt.subplot(1, 2, 2)

    plt.plot(loss, label="Train Loss")
    plt.plot(val_loss, label="Validation Loss")

    if len(history_list) > 1:
        plt.axvline(
            x=len(history_list[0].history['loss']) - 1,
            color='r',
            linestyle='--',
            label='Start Fine Tuning'
        )

    plt.title(f"Loss - {title}")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid()

    plt.savefig("training_history_2_mbv3.png")
    plt.show()

# Plot
plot_history(
    [history_phase1, history_phase2],
    "Batik Model Training (EfficientNetV2B0)"
)
# ========================
# Evaluate Test Set
# ========================
print("\n=== Testing Model ===")

test_loss, test_acc = model.evaluate(test_generator)

print(f"\nTest Accuracy : {test_acc:.4f}")
print(f"Test Loss     : {test_loss:.4f}")

# ========================
# Prediction
# ========================
print("\n=== Predict Test Data ===")

Y_pred = model.predict(test_generator)

y_pred = np.argmax(Y_pred, axis=1)
y_true = test_generator.classes

# ========================
# Evaluation Metrics
# ========================
print("\n=== Evaluation Metrics ===")

accuracy = accuracy_score(y_true, y_pred)

precision = precision_score(
    y_true,
    y_pred,
    average='weighted'
)

recall = recall_score(
    y_true,
    y_pred,
    average='weighted'
)

f1 = f1_score(
    y_true,
    y_pred,
    average='weighted'
)

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1-Score  : {f1:.4f}")

# ========================
# Save Metrics
# ========================
with open("evaluation_metrics.txt", "w") as f:
    f.write("=== Evaluation Metrics ===\n\n")
    f.write(f"Accuracy  : {accuracy:.4f}\n")
    f.write(f"Precision : {precision:.4f}\n")
    f.write(f"Recall    : {recall:.4f}\n")
    f.write(f"F1-Score  : {f1:.4f}\n")

print("\nEvaluation metrics berhasil disimpan!")

# ========================
# Confusion Matrix
# ========================
print("\n=== Confusion Matrix ===")

cm = confusion_matrix(
    y_true,
    y_pred
)

plt.figure(figsize=(12, 10))

sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=test_generator.class_indices.keys(),
    yticklabels=test_generator.class_indices.keys()
)

plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title("Confusion Matrix")

plt.tight_layout()

plt.savefig(
    "confusion_matrix.png",
    dpi=300,
    bbox_inches='tight'
)

plt.show()

print("Confusion Matrix berhasil disimpan!")

# ========================
# Classification Report
# ========================
print("\n=== Classification Report ===")

report = classification_report(
    y_true,
    y_pred,
    target_names=list(test_generator.class_indices.keys())
)

print(report)

with open("classification_report.txt", "w") as f:
    f.write(report)

print("\nClassification report berhasil disimpan!")

# ========================
# Summary Table
# ========================
print("\n===================================")
print("        MODEL PERFORMANCE")
print("===================================")
print(f"Accuracy  : {accuracy*100:.2f}%")
print(f"Precision : {precision*100:.2f}%")
print(f"Recall    : {recall*100:.2f}%")
print(f"F1-Score  : {f1*100:.2f}%")
print("===================================")

# ========================
# Save Final Model
# ========================
model.save("model_batik_final_mbv3.keras")

print("\nModel berhasil disimpan!")
print("Nama file: model_batik_final_mbv3.keras")