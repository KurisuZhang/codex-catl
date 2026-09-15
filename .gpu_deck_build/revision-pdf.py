from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader

root = Path('/Users/lin/Desktop/catl')
images = sorted((root / '.gpu_deck_build/revision-final-render').glob('*.png'))
assert len(images) == 14, len(images)
target = root / 'output/gpu_rental/GPU_NPU租赁与模型适配方案_预览.pdf'
c = canvas.Canvas(str(target), pagesize=(960, 540), pageCompression=1)
c.setTitle('GPU / NPU 租赁与大模型推理调研')
c.setAuthor('GPU / NPU 租赁调研')
c.setSubject('14 页演示文稿预览，表格与图形的可编辑版本见 PPTX')
for i, f in enumerate(images, 1):
    c.drawImage(str(f), 0, 0, width=960, height=540)
    c.showPage()
c.save()
reader = PdfReader(str(target))
assert len(reader.pages) == 14
assert all(float(page.mediabox.width)==960 and float(page.mediabox.height)==540 for page in reader.pages)
print(f'PDF ready: {target} ({target.stat().st_size:,} bytes), 14 pages')
