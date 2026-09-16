from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader
root=Path('/Users/lin/Desktop/catl')
images=sorted((root/'.token_mini_build/hierarchy-final-render').glob('*.png'))
assert len(images)==18
target=root/'output/token_mini/token魔方Mini实验台_项目报告_标题层级优化版.pdf'
c=canvas.Canvas(str(target),pagesize=(960,540),pageCompression=1)
c.setTitle('token 魔方 Mini实验台')
c.setAuthor('张帅')
c.setSubject('18页方案报告预览，可编辑内容与演讲者备注见PPTX')
for f in images:
    c.drawImage(str(f),0,0,width=960,height=540)
    c.showPage()
c.save()
r=PdfReader(str(target))
assert len(r.pages)==18
assert all(float(p.mediabox.width)==960 and float(p.mediabox.height)==540 for p in r.pages)
print(target)
