import os
import shutil
import random

source_dir = 'D:\\SEMESTER 6\\KHUSUS TA\\Datasetbatik'  # folder awal kamu yang sekarang
target_dir = 'train\\dataset'       # folder baru yang akan dipakai untuk training

split_ratio = (0.8, 0.1, 0.1)  # train, val, test

for label in os.listdir(source_dir):
    class_dir = os.path.join(source_dir, label)
    if not os.path.isdir(class_dir):
        continue

    images = os.listdir(class_dir)
    random.shuffle(images)

    total = len(images)
    train_end = int(split_ratio[0] * total)
    val_end = train_end + int(split_ratio[1] * total)

    splits = {
        'train': images[:train_end],
        'val': images[train_end:val_end],
        'test': images[val_end:]
    }

    for split in ['train', 'val', 'test']:
        split_dir = os.path.join(target_dir, split, label)
        os.makedirs(split_dir, exist_ok=True)
        for img in splits[split]:
            src_path = os.path.join(class_dir, img)
            dst_path = os.path.join(split_dir, img)
            shutil.copy2(src_path, dst_path)

print("Dataset berhasil dipisah!")
