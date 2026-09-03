import fitz

pdf_path = "d:/PYTHON LOL/Hackathon Ideas/Legal.AI/backend/data/THE MOTOR VEHICLES ACT, 1988.pdf"
doc = fitz.open(pdf_path)

for i, page in enumerate(doc):
    text = page.get_text("text")
    if "129" in text and "headgear" in text.lower():
        lines = text.split('\n')
        for idx, line in enumerate(lines):
            if "headgear" in line.lower() or "129" in line:
                start = max(0, idx - 2)
                end = min(len(lines), idx + 10)
                print(f"--- PAGE {i+1} ---")
                print('\n'.join(lines[start:end]))
                break
