"""Make the transparent, tightly trimmed bottle cutouts the site shows.

Reads every wine image listed in shop-config.js and writes two sizes:
  img/bottles/small/<name>.png  640px tall - shop cards, homepage lineup
  img/bottles/large/<name>.png  900px tall - wine pages, trade quick look
(bottleImage() in shop-config.js picks between them.)
Re-run after adding or replacing a bottle photo:  python3 make-shelf-cutouts.py
Needs Pillow and numpy.
"""
import re, os, sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
cfg=open('shop-config.js',encoding='utf-8').read()
imgs=re.findall(r'image: "(img/catalog-2026/[^"]+)"',cfg)
for src in imgs:
    raw=Image.open(src)
    if raw.mode in ('RGBA','LA','P'):
        raw=raw.convert('RGBA'); white=Image.new('RGBA',raw.size,(255,255,255,255)); white.alpha_composite(raw); im=white.convert('RGB')
    else: im=raw.convert('RGB')
    a=np.asarray(im).astype(int); h,w,_=a.shape
    light=(a.min(axis=2)>=225)&((a.max(axis=2)-a.min(axis=2))<=22)
    bg=np.zeros((h,w),bool); q=deque()
    for x in range(w):
        for y in (0,h-1):
            if light[y,x] and not bg[y,x]: bg[y,x]=True; q.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if light[y,x] and not bg[y,x]: bg[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and light[ny,nx] and not bg[ny,nx]:
                bg[ny,nx]=True; q.append((ny,nx))
    am=Image.fromarray(np.where(bg,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    rgba=im.copy(); rgba.putalpha(am)
    ys,xs=np.where(~bg)
    cut=rgba.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    for size, tall in (('small', 640), ('large', 900)):
        out=cut.resize((round(cut.width*tall/cut.height),tall),Image.LANCZOS) if cut.height>tall else cut
        os.makedirs(f'img/bottles/{size}', exist_ok=True)
        dst=f'img/bottles/{size}/'+os.path.splitext(os.path.basename(src))[0]+'.png'
        out.save(dst,optimize=True)
        print(dst, out.size, f'{os.path.getsize(dst)//1024}KB')
