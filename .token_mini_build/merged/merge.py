from pathlib import Path
import zipfile,json,posixpath,xml.etree.ElementTree as E
R=Path('/Users/lin/Desktop/catl'); D=R/'output/token_mini/分主题审阅'; manifest=json.loads((D/'合并顺序.json').read_text()); out={}; overrides=[]; defaults={}; slide_targets=[]; master_targets=[]
P='http://schemas.openxmlformats.org/presentationml/2006/main'; RR='http://schemas.openxmlformats.org/officeDocument/2006/relationships'; REL='http://schemas.openxmlformats.org/package/2006/relationships'; CT='http://schemas.openxmlformats.org/package/2006/content-types'
E.register_namespace('p',P);E.register_namespace('r',RR)
for k,item in enumerate(manifest['order']):
 with zipfile.ZipFile(D/item['file']) as z:
  prefix='' if k==0 else f'ppt/source{k+1:02d}/'
  for n in z.namelist():
   if n.endswith('/') or n=='[Content_Types].xml' or (prefix and n=='_rels/.rels'):continue
   data=z.read(n)
   if prefix and n.endswith('.rels'):
    root=E.fromstring(data)
    for rel in root:
     if rel.get('TargetMode')!='External' and rel.get('Target','').startswith('/'):
      rel.set('Target','/'+prefix+rel.get('Target').lstrip('/'))
    data=E.tostring(root,encoding='utf-8',xml_declaration=True)
   out[prefix+n]=data
  for node in E.fromstring(z.read('[Content_Types].xml')):
   if node.tag.endswith('Default'):defaults[node.get('Extension')]=node.get('ContentType')
   else:overrides.append(( '/'+prefix+node.get('PartName').lstrip('/'),node.get('ContentType')))
  pres=E.fromstring(z.read('ppt/presentation.xml'));rels={x.get('Id'):x for x in E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
  for kind,targets in [('sldIdLst',slide_targets),('sldMasterIdLst',master_targets)]:
   parent=pres.find('{'+P+'}'+kind)
   if parent is not None:
    for node in parent:
     target=rels[node.get('{'+RR+'}id')].get('Target'); part=target.lstrip('/') if target.startswith('/') else posixpath.normpath('ppt/'+target)
     targets.append(prefix+part)
  print(item['file'],item['pageCount'])
pres=E.fromstring(out['ppt/presentation.xml']); rels=E.fromstring(out['ppt/_rels/presentation.xml.rels'])
for x in list(rels):
 if x.get('Type').endswith('/slide') or x.get('Type').endswith('/slideMaster'):rels.remove(x)
for kind,targets,typ,start in [('sldIdLst',slide_targets,'slide',256),('sldMasterIdLst',master_targets,'slideMaster',2147483648)]:
 parent=pres.find('{'+P+'}'+kind);parent.clear()
 for i,target in enumerate(targets):
  rid=f'merged_{typ}_{i+1}'
  E.SubElement(parent,'{'+P+'}'+('sldId' if typ=='slide' else 'sldMasterId'),{'id':str(start+i),'{'+RR+'}id':rid})
  E.SubElement(rels,'{'+REL+'}Relationship',{'Id':rid,'Type':RR+'/'+typ,'Target':posixpath.relpath(target,'ppt')})
out['ppt/presentation.xml']=E.tostring(pres,encoding='utf-8',xml_declaration=True);out['ppt/_rels/presentation.xml.rels']=E.tostring(rels,encoding='utf-8',xml_declaration=True)
E.register_namespace('',CT)
ct=E.Element('{'+CT+'}Types')
for ext,t in defaults.items():E.SubElement(ct,'{'+CT+'}Default',{'Extension':ext,'ContentType':t})
for part,t in overrides:E.SubElement(ct,'{'+CT+'}Override',{'PartName':part,'ContentType':t})
out['[Content_Types].xml']=E.tostring(ct,encoding='utf-8',xml_declaration=True)
# Normalize slide paths while preserving original slide contents.
mapping={old:f'ppt/slides/slide{i+1}.xml' for i,old in enumerate(slide_targets)}
for old,new in list(mapping.items()):
 mapping[posixpath.dirname(old)+'/_rels/'+posixpath.basename(old)+'.rels']=posixpath.dirname(new)+'/_rels/'+posixpath.basename(new)+'.rels'
normalized={}
for name,data in out.items():
 newname=mapping.get(name,name)
 if name.endswith('.rels'):
  root=E.fromstring(data)
  owner='' if name=='_rels/.rels' else posixpath.dirname(posixpath.dirname(name))+'/'+posixpath.basename(name)[:-5]
  newowner=mapping.get(owner,owner)
  for rel in root:
   if rel.get('TargetMode')=='External':continue
   t=rel.get('Target');target=t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
   rel.set('Target',posixpath.relpath(mapping.get(target,target),posixpath.dirname(newowner) or '.'))
  data=E.tostring(root,encoding='utf-8',xml_declaration=True)
 elif name=='[Content_Types].xml':
  root=E.fromstring(data)
  for node in root:
   if node.get('PartName'):node.set('PartName','/'+mapping.get(node.get('PartName').lstrip('/'),node.get('PartName').lstrip('/')))
  data=E.tostring(root,encoding='utf-8',xml_declaration=True)
 normalized[newname]=data
out=normalized
with zipfile.ZipFile(R/'.token_mini_build/merged/candidate.pptx','w',zipfile.ZIP_DEFLATED) as z:
 for n,b in out.items():z.writestr(n,b)
print('slides',len(slide_targets))
