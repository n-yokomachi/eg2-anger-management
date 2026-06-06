#!/usr/bin/env python3
"""Anger Management 用のグレースケールPNG生成。白(255)=点灯 / 黒(0)=透明。
- 数字 d0..d10 : 120x144（大判カウント表示）
- finisher 4種: 288x144（中央表示・ANGER MANAGED 文字を焼き込み）
- icon.png    : アプリアイコン
"""
import os, math
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
os.makedirs(OUT, exist_ok=True)
ICON = os.path.join(os.path.dirname(__file__), '..', 'public')

FONT_CANDIDATES = [
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
]
def font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default()

def text_center(d, box, s, f, fill=255):
    x0, y0, x1, y1 = box
    l, t, r, b = d.textbbox((0, 0), s, font=f)
    tw, th = r - l, b - t
    d.text((x0 + (x1 - x0 - tw) / 2 - l, y0 + (y1 - y0 - th) / 2 - t), s, font=f, fill=fill)

# ── 数字 d0..d10（120x144）──
DW, DH = 120, 144
fbig = font(150)
for n in range(0, 11):
    im = Image.new('L', (DW, DH), 0)
    d = ImageDraw.Draw(im)
    f = font(150) if n < 10 else font(108)  # "10" は2桁ぶん少し小さく
    text_center(d, (0, 0, DW, DH), str(n), f)
    im.save(os.path.join(OUT, f'd{n}.png'))

# ── フィニッシャー共通: ANGER MANAGED 文字（288x144に2行）──
FW, FH = 288, 144
def draw_managed_text(d, fill=255):
    f = font(46)
    text_center(d, (0, 8, FW, 76), 'ANGER', f, fill)
    text_center(d, (0, 72, FW, 140), 'MANAGED', f, fill)

# 1) 集中線
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
cx, cy = FW / 2, FH / 2
for a in range(0, 360, 6):
    rad = math.radians(a)
    d.line([(cx, cy), (cx + math.cos(rad) * 400, cy + math.sin(rad) * 400)], fill=120, width=2)
d.ellipse([cx - 96, cy - 56, cx + 96, cy + 56], fill=0)  # 中央を抜いて文字スペース
draw_managed_text(d)
im.save(os.path.join(OUT, 'speedlines.png'))

# 2) ハーフトーン網点
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
for yy in range(8, FH, 14):
    for xx in range(8, FW, 14):
        dist = math.hypot(xx - cx, yy - cy)
        r = max(1, 5 - dist / 40)
        d.ellipse([xx - r, yy - r, xx + r, yy + r], fill=150)
d.rectangle([cx - 104, cy - 50, cx + 104, cy + 50], fill=0)
draw_managed_text(d)
im.save(os.path.join(OUT, 'halftone.png'))

# 3) 衝撃波リング
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
for rr in range(20, 200, 22):
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=130, width=3)
d.rectangle([cx - 104, cy - 48, cx + 104, cy + 48], fill=0)
draw_managed_text(d)
im.save(os.path.join(OUT, 'shockwave.png'))

# 4) 角印スタンプ（斜め・かすれ無し）
stamp = Image.new('L', (FW, FH), 0); sd = ImageDraw.Draw(stamp)
# 正方向で角印を描いてから回転（斜め表示）
box = Image.new('L', (180, 180), 0); bd = ImageDraw.Draw(box)
bd.rectangle([6, 6, 173, 173], outline=255, width=6)
bd.rectangle([18, 18, 161, 161], outline=255, width=3)
bf = font(30)
text_center(bd, (18, 30, 161, 88), 'ANGER', bf)
text_center(bd, (18, 92, 161, 150), 'MANAGED', bf)
box = box.rotate(13, expand=True, resample=Image.BICUBIC)
stamp.paste(box, (int(cx - box.width / 2), int(cy - box.height / 2)))
stamp.save(os.path.join(OUT, 'stamp.png'))

# ── アイコン ──
ic = Image.new('L', (128, 128), 0); icd = ImageDraw.Draw(ic)
text_center(icd, (0, 0, 128, 128), '6', font(110))
ic.convert('RGB').save(os.path.join(ICON, 'icon.png'))

print('assets generated:', os.listdir(OUT))
