import fitz
import re

pdf_path = "d:/PYTHON LOL/Hackathon Ideas/Legal.AI/backend/data/THE MOTOR VEHICLES ACT, 1988.pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text("text") + "\n"

# Try original pattern
split_pattern1 = r'(?=\b(?:Section|Article)\s+\d+[A-Z]?\b)'
chunks1 = re.split(split_pattern1, full_text, flags=re.IGNORECASE)

# Try new pattern: newline, optional spaces, numbers, dot, space, Capital letter
split_pattern2 = r'(?=\n\s*\d+[A-Z]?\.\s+[A-Z])'
chunks2 = re.split(split_pattern2, full_text)

print(f"Original pattern gave {len(chunks1)} chunks")
print(f"New pattern gave {len(chunks2)} chunks")

for c in chunks2:
    if "protective headgear" in c.lower():
        with open("chunk_output.txt", "w", encoding="utf-8") as f:
            f.write(c[:1000])
        print("Found protective headgear chunk! Saved to chunk_output.txt")
        break
