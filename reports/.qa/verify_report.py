from pathlib import Path
import json,hashlib,re
import pypdfium2 as pdfium
from pypdf import PdfReader
from PIL import Image,ImageDraw
from docx import Document
root=Path.cwd();q=root/'reports/.qa';out=q/'rendered';out.mkdir(exist_ok=True)
pdf=pdfium.PdfDocument(str(q/'report.pdf'));reader=PdfReader(q/'report.pdf')
pages=[]
for i,page in enumerate(pdf):
    im=page.render(scale=1.2).to_pil();im.save(out/f'page-{i+1}.png');pages.append(im)
for start in range(0,len(pages),12):
    sheet=Image.new('RGB',(1100,4*390),'#cccccc');d=ImageDraw.Draw(sheet)
    for j,im in enumerate(pages[start:start+12]):
        thumb=im.copy();thumb.thumbnail((355,360));x=(j%3)*366;y=(j//3)*390;sheet.paste(thumb,(x,y+20));d.text((x+8,y+3),str(start+j+1),fill='black')
    sheet.save(q/f'contact-{start//12+1}.png')
text='\n'.join(p.extract_text() or '' for p in reader.pages);(q/'report-text.txt').write_text(text,encoding='utf-8')
inv=json.loads((q/'source-inventory.json').read_text(encoding='utf-8-sig'));changed=[]
for name,meta in inv.items():
    path=root/name
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=meta['sha256']:changed.append(name)
report={'pages':len(pages),'unchangedSourceFiles':len(inv)-len(changed),'changedSourceFiles':changed,'figuresEmbedded':len(Document(root/'reports/OrganSync_V2_DBMS_Mini_Project_Report.docx').inline_shapes),'studentDetails':{s:text.count(s) for s in ['Sagar K','PES2UG24CS424','S Vinyas Gangadkar','PES2UG24CS418','Prof. Vinu J']},'emptyPages':[i+1 for i,p in enumerate(reader.pages) if len((p.extract_text() or '').strip())<15]}
(q/'verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
for i,page in enumerate(reader.pages):
    txt=page.extract_text() or '';print(i+1,len(txt),txt[:100].replace('\n',' / '))
