from PIL import Image
import os

def is_image_valid(filepath):
    try:
        with Image.open(filepath) as img:
            img.verify()  # Memeriksa header
        # Perlu membuka ulang karena img.verify() menutup file
        with Image.open(filepath) as img:
            img.load()  # Memastikan seluruh data gambar dapat di-load
        return True
    except Exception as e:
        print(f"Error pada file {filepath}: {e}")
        return False

# Direktori dataset yang digunakan oleh train.py
dataset_dir = "train/dataset"
corrupted_files = []

# Hanya mengecek folder train dan val sesuai dengan yang ada di train.py
for split in ['train', 'val']:
    split_dir = os.path.join(dataset_dir, split)
    if not os.path.exists(split_dir):
        print(f"Folder tidak ditemukan: {split_dir}")
        continue
        
    for root, dirs, files in os.walk(split_dir):
        for file in files:
            # Hanya mengecek file gambar
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                path = os.path.join(root, file)
                if not is_image_valid(path):
                    corrupted_files.append(path)

print(f"\nTotal file corrupt ditemukan: {len(corrupted_files)}")
for f in corrupted_files:
    print(f"Menghapus: {f}")
    try:
        os.remove(f)
    except Exception as e:
        print(f"Gagal menghapus {f}: {e}")
