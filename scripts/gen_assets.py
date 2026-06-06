#!/usr/bin/env python3
"""Anger Management 用のグレースケールPNG生成。白(255)=点灯 / 黒(0)=透明。
- 数字 d0..d10 : 200x144（大判カウント表示・インク切り出しで厳密中央）
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

# 文字を実インクで切り出した画像を返す（字ごとのベアリング差を排除して厳密中央配置するため）。
def text_img(s, f, stroke=0):
    tmp = Image.new('L', (1600, 500), 0)
    ImageDraw.Draw(tmp).text((40, 40), s, font=f, fill=255, stroke_width=stroke, stroke_fill=0)
    bbox = tmp.getbbox()
    return tmp.crop(bbox)

# 箱の中央へ実インクを貼る（厳密中央。背景は黒＝透明なので装飾の無い場所向け）。
def paste_center(dst, glyph, box):
    x0, y0, x1, y1 = box
    dst.paste(glyph, (int(x0 + (x1 - x0 - glyph.width) / 2),
                      int(y0 + (y1 - y0 - glyph.height) / 2)))

# 装飾の上に直接描く中央寄せ（黒フチ stroke で下地を局所的に隠して可読化）。
def draw_center(d, box, s, f, fill=255, stroke=0):
    l, t, r, b = d.textbbox((0, 0), s, font=f, stroke_width=stroke)
    tw, th = r - l, b - t
    x0, y0, x1, y1 = box
    d.text((x0 + (x1 - x0 - tw) / 2 - l, y0 + (y1 - y0 - th) / 2 - t),
           s, font=f, fill=fill, stroke_width=stroke, stroke_fill=0)

# ── 数字 d0..d10（64x80・少し小さく＆1ビットで実機BLEを高速化。インク切り出しで厳密中央）──
DW, DH = 64, 80
for n in range(0, 11):
    f = font(76) if n < 10 else font(54)  # "10" は2桁ぶん小さく
    im = Image.new('L', (DW, DH), 0)
    paste_center(im, text_img(str(n), f), (0, 0, DW, DH))
    im.convert('1', dither=Image.NONE).save(os.path.join(OUT, f'd{n}.png'))  # 1ビット白黒

# ── フィニッシャー共通 ──
FW, FH = 288, 144
cx, cy = FW / 2, FH / 2
def managed_text(d, stroke=0):
    f = font(46)
    draw_center(d, (0, 8, FW, 76), 'ANGER', f, 255, stroke)
    draw_center(d, (0, 72, FW, 140), 'MANAGED', f, 255, stroke)

# 1) 集中線（中央を楕円で抜いて文字スペースを確保）
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
for a in range(0, 360, 6):
    rad = math.radians(a)
    d.line([(cx, cy), (cx + math.cos(rad) * 400, cy + math.sin(rad) * 400)], fill=120, width=2)
d.ellipse([cx - 96, cy - 56, cx + 96, cy + 56], fill=0)
managed_text(d)
im.save(os.path.join(OUT, 'speedlines.png'))

# 2) ハーフトーン網点（中央フレーム内に文字をきっちり収め、周囲を網点の縁取りに）
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
for yy in range(8, FH, 14):
    for xx in range(8, FW, 14):
        rr = max(1, 5 - math.hypot(xx - cx, yy - cy) / 40)
        d.ellipse([xx - rr, yy - rr, xx + rr, yy + rr], fill=150)
# 文字フレーム（この矩形内の網点を消し、ここに文字を収める）
FX0, FY0, FX1, FY1 = 34, 14, FW - 34, FH - 14   # x34..254, y14..130
d.rectangle([FX0, FY0, FX1, FY1], fill=0)
hf = font(40)
draw_center(d, (FX0, FY0 + 4, FX1, (FY0 + FY1) // 2), 'ANGER', hf)
draw_center(d, (FX0, (FY0 + FY1) // 2, FX1, FY1 - 4), 'MANAGED', hf)
im.save(os.path.join(OUT, 'halftone.png'))

# 3) 衝撃波リング（元の大きいサイズ。黒矩形でのくり抜きはせず、文字は黒フチ(stroke)で可読化
#    ＝リングは途切れず、文字周りだけ局所的に背景が抜ける）
im = Image.new('L', (FW, FH), 0); d = ImageDraw.Draw(im)
for rr in range(20, 200, 22):
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=150, width=3)
managed_text(d, stroke=7)
im.save(os.path.join(OUT, 'shockwave.png'))

# 4) 角印スタンプ（長方形・斜め・文字を枠内にきちんと収める）
SB_W, SB_H = 236, 104
box = Image.new('L', (SB_W, SB_H), 0); bd = ImageDraw.Draw(box)
bd.rectangle([5, 5, SB_W - 6, SB_H - 6], outline=255, width=5)       # 外枠
bd.rectangle([14, 14, SB_W - 15, SB_H - 15], outline=255, width=3)   # 内枠
sf = font(28)
paste_center(box, text_img('ANGER', sf), (16, 18, SB_W - 16, 54))
paste_center(box, text_img('MANAGED', sf), (16, 52, SB_W - 16, SB_H - 18))
box = box.rotate(8, expand=True, resample=Image.BICUBIC)
stamp = Image.new('L', (FW, FH), 0)
stamp.paste(box, (int(cx - box.width / 2), int(cy - box.height / 2)))
stamp.save(os.path.join(OUT, 'stamp.png'))

# ── アイコン ──
ic = Image.new('L', (128, 128), 0)
paste_center(ic, text_img('6', font(110)), (0, 0, 128, 128))
ic.convert('RGB').save(os.path.join(ICON, 'icon.png'))

print('assets generated:', sorted(os.listdir(OUT)))
