import os, json, hashlib, gzip, urllib.request

# URLs for the three legal norms (simplified example URLs)
LAWS = [
    {
        "name": "ley_1564_2012",
        "url": "http://www.secretariasenado.gov.co/senado/basedoc/ley_1564_2012.html",
        "filename": "ley_1564_2012.json",
    },
    {
        "name": "ley_0599_2000",
        "url": "http://www.secretariasenado.gov.co/senado/basedoc/ley_0599_2000.html",
        "filename": "ley_0599_2000.json",
    },
    {
        "name": "constitucion_1991",
        "url": "https://www.constitutionviewer.com/colombia/1991.html",
        "filename": "constitucion_1991.json",
    },
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dist")
os.makedirs(OUTPUT_DIR, exist_ok=True)

manifest = []

for law in LAWS:
    try:
        print(f"Downloading {law['name']}...")
        with urllib.request.urlopen(law["url"]) as resp:
            raw = resp.read().decode("utf-8", errors="ignore")
        # Very simple extraction: store the whole HTML as a string field
        data = {"source_url": law["url"], "content": raw}
        json_path = os.path.join(OUTPUT_DIR, law["filename"])
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        # Compress to .json.gz
        gz_path = json_path + ".gz"
        with open(json_path, "rb") as f_in, gzip.open(gz_path, "wb") as f_out:
            f_out.writelines(f_in)
        # Compute SHA‑256 of the gz file
        sha256 = hashlib.sha256()
        with open(gz_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)
        hash_hex = sha256.hexdigest()
        manifest.append({"archivo": os.path.basename(gz_path), "hash": hash_hex})
        print(f"Created {gz_path} (sha256={hash_hex})")
    except Exception as e:
        print(f"Error processing {law['name']}: {e}")

# Write manifest.json at project root
manifest_path = os.path.join(os.path.dirname(__file__), "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump({"normas": manifest}, f, ensure_ascii=False, indent=2)
print("Manifest written to", manifest_path)
