#!/usr/bin/env python3
"""build_deck_lite.py — 構成JSONから提案書の .pptx を生成する（依存ライブラリなし）。

    python3 build_deck_lite.py deck.json -o 結婚のご提案.pptx
    python3 build_deck_lite.py deck.json --check   # 文字量の警告だけ出す

proposal-deck スキルの build_deck.py（python-pptx 版）から、このデッキで使う
レイアウトだけを標準ライブラリ（zipfile）で書き出せるように移植したもの。
グリッド・級数・色は元スクリプトの実測値に合わせている。
図形に影・角丸はつけない。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape


def Inches(v: float) -> int:
    return int(v * 914400)


def Pt(v: float) -> int:
    return int(v * 12700)


# ------------------------------------------------ グリッド（実測値）
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)
MARGIN = Inches(0.92)
CONTENT_W = Inches(11.50)
LABEL_Y = Inches(0.13)
LEAD_Y = Inches(0.62)
LEAD_H = Inches(1.10)
BODY_Y = Inches(1.89)
BODY_END = Inches(6.62)
FOOT_Y = Inches(6.95)
BAR_Y = Inches(7.45)
BAR_H = Inches(0.05)

SZ = {"cover_title": 30, "cover_client": 17, "cover_meta": 11.5, "label": 12, "lead": 20,
      "statement": 44, "b_body": 11.5, "body": 12, "small": 10.5}

THEMES = {
    "navy": {"accent": "1B4FD8", "accent_soft": "EDF2FE", "dark": "0E1B3D"},
    "black": {"accent": "333333", "accent_soft": "F0F0F0", "dark": "1A1A1A"},
    "warm": {"accent": "E97132", "accent_soft": "FDF1E8", "dark": "3A2415"},
    "wine": {"accent": "B5025D", "accent_soft": "FBE9F2", "dark": "3D0320"},
    "teal": {"accent": "1D6160", "accent_soft": "E6F0F0", "dark": "0E2B2B"},
    "citrus": {"accent": "00C4B3", "accent_soft": "E0F7F5", "dark": "14141A"},
    # ポップ：クリーム地・角丸・色を4つ回す。提案書の作法から外れる用
    "pop": {"accent": "FF6B6B", "accent_soft": "FFE3E0", "dark": "2B2D42", "pop": True,
            "paper": "FFF9F2", "ink": "2B2D42", "muted": "6E7080", "line": "EBE4DA",
            "line_dark": "B8B2A8", "quote_bg": "F6EFE6", "marker": "FFE066",
            "hues": ["FF6B6B", "FFB703", "2EC4B6", "4D96FF"],
            "tints": ["FFE3E0", "FFF1C9", "D9F5F1", "DCE8FF"]},
    # ハッキリ：白地・墨文字・ミント/黄/コーラルの3色を強く。参考「待つのが、おいしい。」の版面
    "bold": {"accent": "00C4B3", "accent_soft": "E6F7F5", "dark": "14141A", "bold": True,
             "paper": "FFFFFF", "ink": "14141A", "muted": "6B6B76", "line": "E7E7EE",
             "line_dark": "A3A3AE", "quote_bg": "F2F2F6", "marker": "FFD93D",
             "hues": ["00C4B3", "FFD93D", "FF5C77", "6C5CE7"],
             "tints": ["E6F7F5", "FFF6CC", "FFE3E8", "E8E5FB"]},
}
ROUNDED = False          # pop テーマのとき True。rect() が角丸になる
TOTAL = 0                # 総ページ数（フッターの「3 / 10」用）
BASE = {"font": "Yu Gothic", "font_medium": "Yu Gothic Medium",
        "paper": "FFFFFF", "ink": "14141A", "muted": "6B6B76", "line": "E7E7EE",
        "line_dark": "A3A3AE", "quote_bg": "F2F2F2", "marker": "FFD93D", "neg": "FF5C77"}

WARNINGS: list[str] = []


def warn(no: int, msg: str) -> None:
    WARNINGS.append(f"  p.{no}  {msg}")


def plain(text) -> str:
    return re.sub(r"\*\*|==|%%|\n", "", str(text or ""))


def fit(text, base, floor, budget):
    n = len(plain(text))
    return base if n <= budget else max(floor, round(base * budget / n, 1))


# ------------------------------------------------ OOXML の最小単位
class Slide:
    def __init__(self, th):
        self.th = th
        self.shapes: list[str] = []
        self.bg_color = th["paper"]
        self.notes = ""
        self._id = 1

    def nid(self) -> int:
        self._id += 1
        return self._id


def _run(text, th, size, bold=False, color=None, font=None, hl=None, spc=None, medium=False):
    return {"text": str(text), "size": size, "bold": bool(bold and not medium),
            "color": color or th["ink"],
            "font": font or (th["font_medium"] if medium else th["font"]),
            "hl": hl, "spc": spc}


def paragraphs(lines, th, *, size, bold=False, color=None, align="l", ls=1.45, after=0,
               font=None, em=None, medium=False, spc=None):
    """文字列 or 文字列リスト → 段落の列。**太字** ==マーカー== %%色%% に対応。"""
    if isinstance(lines, str):
        lines = lines.split("\n")
    out = []
    for text in lines:
        runs = []
        for part in re.split(r"(\*\*.+?\*\*|==.+?==|%%.+?%%)", str(text)):
            if not part:
                continue
            if len(part) > 4 and part[:2] == part[-2:] and part[:2] in ("**", "==", "%%"):
                mark, body = part[:2], part[2:-2]
                if mark == "**":
                    runs.append(_run(body, th, size, True, color, font, spc=spc))
                elif mark == "==":
                    runs.append(_run(body, th, size, bold, color, font, hl=th["marker"],
                                     spc=spc, medium=medium))
                else:
                    runs.append(_run(body, th, size, True, em or th["accent"], font, spc=spc))
            else:
                runs.append(_run(part, th, size, bold, color, font, spc=spc, medium=medium))
        out.append({"align": align, "ls": ls, "after": after, "size": size, "runs": runs})
    return out


ANCHOR = {"top": "t", "middle": "ctr", "bottom": "b"}


def text(slide: Slide, x, y, w, h, paras, *, anchor="top") -> None:
    slide.shapes.append({"kind": "text", "x": int(x), "y": int(y), "w": int(w), "h": int(h),
                         "paras": paras, "anchor": anchor})


def shape(slide: Slide, x, y, w, h, *, fill=None, line=None, lw=1.0, dash=None,
          prst="rect", flipH=False, adj=None, paras=None, anchor="middle") -> None:
    """塗り／枠線つきの図形。影なし・角丸なし。"""
    slide.shapes.append({"kind": "shape", "x": int(x), "y": int(y), "w": int(w), "h": int(h),
                         "fill": fill, "line": line, "lw": lw, "dash": dash, "prst": prst,
                         "flipH": flipH, "adj": adj or {}, "paras": paras or [],
                         "anchor": anchor})


def rect(slide, x, y, w, h, fill=None, line=None, lw=1.0, paras=None, anchor="middle", dash=None,
         square=False):
    prst, adj = "rect", None
    if ROUNDED and not square and min(w, h) >= Inches(0.22):
        prst = "roundRect"
        adj = {"adj": int(min(50000, Inches(0.14) / min(w, h) * 100000))}
    shape(slide, x, y, w, h, fill=fill, line=line, lw=lw, paras=paras, anchor=anchor, dash=dash,
          prst=prst, adj=adj)


def hue(th, i):
    return th["hues"][i % len(th["hues"])] if th.get("hues") else th["accent"]


def tint(th, i):
    return th["tints"][i % len(th["tints"])] if th.get("tints") else th["accent_soft"]


def bg(slide: Slide, color: str) -> None:
    slide.bg_color = color


# ------------------------------------------------ 共通パーツ
def header(slide, spec, th, no):
    label = spec.get("label")
    if th.get("bold"):
        if label:
            p = paragraphs(label, th, size=13, bold=True, spc=1.5)
            if spec.get("label_sub"):
                p[0]["runs"].append(_run("　" + spec["label_sub"], th, 13, False, th["muted"],
                                         spc=0.5))
            text(slide, MARGIN, LABEL_Y + Inches(0.04), CONTENT_W, Inches(0.36), p)
        lead = spec.get("lead") or spec.get("headline")
        if lead:
            n = len(plain(lead))
            if n > 70:
                warn(no, f"リード文が{n}字。2行に収まる60字前後まで削る。")
            text(slide, MARGIN, LEAD_Y + Inches(0.02), CONTENT_W, LEAD_H,
                 paragraphs(lead, th, size=fit(lead, 22, 16, 56), medium=True, ls=1.4))
        return
    if label and th.get("pop"):
        pw = Inches(0.22) * len(label) + Inches(0.6)
        rect(slide, MARGIN, LABEL_Y + Inches(0.02), pw, Inches(0.42), fill=th["accent"],
             paras=paragraphs(label, th, size=13, bold=True, color="FFFFFF", align="ctr"))
        if spec.get("label_sub"):
            text(slide, MARGIN + pw + Inches(0.2), LABEL_Y + Inches(0.02), CONTENT_W - pw,
                 Inches(0.42), paragraphs(spec["label_sub"], th, size=14, color=th["muted"]),
                 anchor="middle")
        lead = spec.get("lead") or spec.get("headline")
        if lead:
            n = len(plain(lead))
            if n > 60:
                warn(no, f"リード文が{n}字。ポップ版は大きい文字なので45字前後まで削る。")
            text(slide, MARGIN, LEAD_Y + Inches(0.08), CONTENT_W, LEAD_H,
                 paragraphs(lead, th, size=fit(lead, 27, 19, 44), bold=True, ls=1.5))
        return
    if label:
        p = paragraphs(label, th, size=SZ["label"], bold=True, spc=1.2)
        if spec.get("label_sub"):
            # ラベル行の右に薄い補足を並べる（同じ段落に run を足す）
            p[0]["runs"].append(_run("　" + spec["label_sub"], th, SZ["label"], False,
                                     th["muted"], spc=0.6))
        text(slide, MARGIN, LABEL_Y, CONTENT_W, Inches(0.34), p)
    lead = spec.get("lead") or spec.get("headline")
    if lead:
        n = len(plain(lead))
        if n > 78:
            warn(no, f"リード文が{n}字。2行に収まる70字前後まで削る。")
        text(slide, MARGIN, LEAD_Y, CONTENT_W, LEAD_H,
             paragraphs(lead, th, size=fit(lead, SZ["lead"], 15, 60), medium=True, ls=1.72))


def chrome(slide, th, no, label):
    if th.get("bold"):
        if label:
            text(slide, MARGIN, FOOT_Y + Inches(0.04), Inches(6.0), Inches(0.3),
                 paragraphs(label, th, size=10, color=th["line_dark"], spc=0.5))
        text(slide, SLIDE_W - MARGIN - Inches(1.0), FOOT_Y + Inches(0.02), Inches(1.0),
             Inches(0.3), paragraphs(str(no), th, size=12, bold=True, color=th["line_dark"],
                                     align="r", spc=0.5))
        return
    if th.get("pop"):
        if label:
            text(slide, MARGIN, FOOT_Y + Inches(0.05), Inches(6.0), Inches(0.3),
                 paragraphs(label, th, size=10, color=th["line_dark"]))
        rect(slide, SLIDE_W - MARGIN - Inches(0.95), FOOT_Y - Inches(0.02), Inches(0.95),
             Inches(0.34), fill=th["accent_soft"],
             paras=paragraphs(f"{no} / {TOTAL}", th, size=9.5, bold=True, color=th["accent"],
                              align="ctr"))
        return
    if label:
        text(slide, MARGIN, FOOT_Y, Inches(6.0), Inches(0.3),
             paragraphs(label, th, size=9, color=th["line_dark"]))
    text(slide, SLIDE_W - MARGIN - Inches(1.0), FOOT_Y, Inches(1.0), Inches(0.3),
         paragraphs(str(no), th, size=11, color=th["line_dark"], align="r", spc=0.5))
    rect(slide, 0, BAR_Y, SLIDE_W, BAR_H, fill=th["accent"], square=True)


def body_top(spec):
    return BODY_Y if (spec.get("lead") or spec.get("headline")) else Inches(1.15)


def body_end(spec):
    return BODY_END - (Inches(1.15) if spec.get("close") else 0)


def centered(spec, h):
    top = body_top(spec)
    return int(top + max(0, (body_end(spec) - top - h) / 2))


def close_line(slide, spec, th):
    """ページ下の言い切り。参考資料の「下に一文」を再現する。"""
    t = spec.get("close")
    if not t:
        return
    text(slide, MARGIN, BODY_END - Inches(1.0), CONTENT_W, Inches(1.0),
         paragraphs(t, th, size=fit(t, 28, 20, 30), bold=True, ls=1.25), anchor="bottom")


# ------------------------------------------------ レイアウト
def l_cover(slide, spec, th, no):
    if th.get("bold"):
        bg(slide, th["hues"][1])
        if spec.get("client"):
            text(slide, MARGIN, Inches(0.7), CONTENT_W, Inches(0.4),
                 paragraphs(spec["client"], th, size=14, bold=True, spc=1.5))
        title = spec.get("title", "")
        text(slide, MARGIN, Inches(1.5), CONTENT_W, Inches(4.3),
             paragraphs(title, th, size=fit(title, 80, 44, 12), bold=True, ls=1.05),
             anchor="middle")
        if spec.get("sub"):
            text(slide, MARGIN, Inches(5.7), CONTENT_W, Inches(0.5),
                 paragraphs(spec["sub"], th, size=18, medium=True))
        meta = " ／ ".join(v for v in (spec.get("date"), spec.get("company")) if v)
        if meta:
            text(slide, MARGIN, Inches(6.5), CONTENT_W, Inches(0.4),
                 paragraphs(meta, th, size=13, bold=True, spc=1.2))
        return
    if th.get("pop"):
        bg(slide, th["accent"])
        # 飾りの丸（右下に大きく黄、右上に小さくミント）
        shape(slide, SLIDE_W - Inches(2.4), SLIDE_H - Inches(2.6), Inches(4.2), Inches(4.2),
              fill=th["hues"][1], prst="ellipse")
        shape(slide, SLIDE_W - Inches(2.3), Inches(0.9), Inches(1.1), Inches(1.1),
              fill=th["hues"][2], prst="ellipse")
        if spec.get("client"):
            cw = Inches(0.22) * len(spec["client"]) + Inches(0.6)
            rect(slide, MARGIN, Inches(2.0), cw, Inches(0.46), line="FFFFFF", lw=1.5,
                 paras=paragraphs(spec["client"], th, size=14, bold=True, color="FFFFFF",
                                  align="ctr"))
        title = spec.get("title", "")
        text(slide, MARGIN, Inches(2.6), Inches(9.5), Inches(2.3),
             paragraphs(title, th, size=fit(title, 54, 34, 12), bold=True, color="FFFFFF",
                        ls=1.25), anchor="middle")
        if spec.get("sub"):
            text(slide, MARGIN, Inches(5.05), Inches(9.5), Inches(0.6),
                 paragraphs(spec["sub"], th, size=18, bold=True, color="FFFFFF"))
        meta = " ／ ".join(v for v in (spec.get("company"), spec.get("date")) if v)
        if meta:
            text(slide, MARGIN, Inches(6.35), Inches(9.0), Inches(0.4),
                 paragraphs(meta, th, size=12, bold=True, color="FFFFFF", spc=0.8))
        return
    rect(slide, 0, 0, Inches(0.16), SLIDE_H, fill=th["accent"])
    if spec.get("client"):
        text(slide, MARGIN, Inches(2.55), CONTENT_W, Inches(0.5),
             paragraphs(spec["client"], th, size=SZ["cover_client"], bold=True))
    title = spec.get("title", "")
    text(slide, MARGIN, Inches(3.25), CONTENT_W, Inches(1.7),
         paragraphs(title, th, size=fit(title, SZ["cover_title"], 22, 34), bold=True, ls=1.4))
    meta = [v for v in (spec.get("company"), spec.get("date")) if v]
    if meta:
        text(slide, MARGIN, Inches(6.15), CONTENT_W, Inches(0.8),
             paragraphs(meta, th, size=SZ["cover_meta"], color=th["muted"], ls=1.6))
    rect(slide, 0, BAR_Y, SLIDE_W, BAR_H, fill=th["accent"])


def l_index(slide, spec, th, no):
    text(slide, MARGIN, LABEL_Y, CONTENT_W, Inches(0.34),
         paragraphs(spec.get("label", "INDEX"), th, size=SZ["label"], bold=True,
                    color=th["accent"]))
    items = spec.get("items", [])
    n = max(len(items), 1)
    step = min(Inches(1.05), Inches(5.0) / n)
    y = int(Inches(1.5) + max(0, (Inches(5.0) - step * n) / 2))
    for i, it in enumerate(items, 1):
        title = it if isinstance(it, str) else it.get("title", "")
        note = "" if isinstance(it, str) else it.get("body", "")
        text(slide, MARGIN, y, Inches(0.8), Inches(0.5),
             paragraphs(f"{i:02d}", th, size=18, bold=True, color=th["accent"]))
        text(slide, MARGIN + Inches(0.95), y - Inches(0.04), Inches(9.6), Inches(0.5),
             paragraphs(title, th, size=20, bold=True))
        if note:
            text(slide, MARGIN + Inches(0.95), y + Inches(0.42), Inches(9.6), Inches(0.35),
                 paragraphs(note, th, size=SZ["b_body"], color=th["muted"]))
        y += step


def l_statement(slide, spec, th, no):
    header(slide, {"label": spec.get("label"), "label_sub": spec.get("label_sub")}, th, no)
    t = spec.get("text") or spec.get("headline", "")
    n = len(plain(t))
    if n > 120:
        warn(no, f"言い切りが{n}字。3行・90字までに削るか、2枚に割る。")
    sub = spec.get("sub")
    th_ = Inches(2.2)
    block = th_ + (Inches(1.1) if sub else 0)
    y = centered(spec, block)
    text(slide, MARGIN, y, CONTENT_W, th_,
         paragraphs(t, th, size=fit(t, SZ["statement"], 26, 30), bold=True, ls=1.3),
         anchor="middle")
    if sub:
        text(slide, MARGIN, y + th_ + Inches(0.15), Inches(10.5), Inches(1.0),
             paragraphs(sub, th, size=fit(sub, 20, 14, 60), medium=True, ls=1.72))


def l_bullets(slide, spec, th, no):
    header(slide, spec, th, no)
    items = spec.get("bullets", [])
    if len(items) > 6:
        warn(no, f"箇条書きが{len(items)}項目。6を超えると読まれない。")
    n = max(len(items), 1)
    if spec.get("numbered"):
        if th.get("bold"):
            top = body_top(spec) + Inches(0.1)
            step = min(Inches(1.25), int((body_end(spec) - top) / n))
            y = centered(spec, int(step * (n - 1) + Inches(0.9)))
            for i, it in enumerate(items, 1):
                t = it if isinstance(it, str) else it.get("title", "")
                text(slide, MARGIN, y + Inches(0.1), Inches(0.7), Inches(0.4),
                     paragraphs(f"{i:02d}", th, size=15, bold=True, color=th["accent"],
                                spc=1.0))
                text(slide, MARGIN + Inches(0.75), y, Inches(10.7), Inches(1.0),
                     paragraphs(t, th, size=fit(t, 20, 15, 40), ls=1.45))
                y += step
            close_line(slide, spec, th)
            return
        step = min(Inches(1.2) if th.get("pop") else Inches(1.05), (BODY_END - body_top(spec)) / n)
        y = centered(spec, int(step * (n - 1) + Inches(0.7)))
        for i, it in enumerate(items, 1):
            t = it if isinstance(it, str) else it.get("title", "")
            if th.get("pop"):
                shape(slide, MARGIN, y + Inches(0.02), Inches(0.6), Inches(0.6),
                      fill=hue(th, i - 1), prst="ellipse",
                      paras=paragraphs(str(i), th, size=18, bold=True, color="FFFFFF",
                                       align="ctr"))
                text(slide, MARGIN + Inches(0.9), y, Inches(10.5), Inches(1.0),
                     paragraphs(t, th, size=fit(t, 22, 15, 36), ls=1.6))
            else:
                text(slide, MARGIN, y + Inches(0.06), Inches(0.7), Inches(0.4),
                     paragraphs(f"{i:02d}", th, size=14, bold=True, color=th["accent"], spc=0.8))
                text(slide, MARGIN + Inches(0.8), y, Inches(10.6), Inches(0.9),
                     paragraphs(t, th, size=fit(t, 18, 13, 44), ls=1.7))
            y += step
        return
    step = min(Inches(1.4), (BODY_END - body_top(spec)) / n)
    y = centered(spec, int(step * (n - 1) + Inches(0.95)))
    for it in items:
        title, body = (it, "") if isinstance(it, str) else (it.get("title", ""), it.get("body", ""))
        rect(slide, MARGIN, y + Inches(0.16), Inches(0.13), Inches(0.13), fill=th["accent"])
        text(slide, MARGIN + Inches(0.42), y, Inches(10.9), Inches(0.46),
             paragraphs(title, th, size=16, bold=bool(body)))
        if body:
            text(slide, MARGIN + Inches(0.42), y + Inches(0.42), Inches(10.6), Inches(0.6),
                 paragraphs(body, th, size=SZ["body"], color=th["muted"], ls=1.75))
        y += step


def l_cards(slide, spec, th, no):
    header(slide, spec, th, no)
    cards = spec.get("cards", [])
    n = len(cards)
    if not n:
        return
    if n > 4:
        warn(no, f"カードが{n}枚。横並びは4枚までが限界。")
    gap = Inches(0.28)
    if th.get("bold"):
        gap = Inches(0.45)
        w = int((CONTENT_W - gap * (n - 1)) / n)
        top = body_top(spec) + Inches(0.05)
        h = body_end(spec) - top
        for i, c in enumerate(cards):
            x = MARGIN + i * (w + gap)
            rect(slide, x, top, w, Pt(3), fill=hue(th, i), square=True)
            cy = top + Inches(0.25)
            if c.get("label"):
                text(slide, x, cy, w, Inches(0.35),
                     paragraphs(c["label"], th, size=12, bold=True,
                                color=th["ink"] if hue(th, i) == th["hues"][1] else hue(th, i),
                                spc=1.2))
                cy += Inches(0.45)
            t = c.get("title", "")
            text(slide, x, cy, w, Inches(1.1),
                 paragraphs(t, th, size=fit(t, 22, 15, 16), bold=True, ls=1.25))
            if c.get("body"):
                text(slide, x, cy + Inches(1.2), w, int(top + h - cy - Inches(1.25)),
                     paragraphs(c["body"], th, size=15 if n <= 3 else 14, ls=1.55))
                if len(plain(c["body"])) > (90 if n <= 3 else 70):
                    warn(no, f"カード{i + 1}の本文が{len(plain(c['body']))}字。削る。")
        close_line(slide, spec, th)
        return
    w = int((CONTENT_W - gap * (n - 1)) / n)
    h = min(Inches(4.3), BODY_END - body_top(spec))
    y = centered(spec, h)
    for i, c in enumerate(cards):
        x = MARGIN + i * (w + gap)
        if th.get("pop"):
            rect(slide, x, y, w, h, fill=tint(th, i))
        else:
            rect(slide, x, y, w, h, fill=th["paper"], line=th["line"])
        ix, iw = x + Inches(0.32), w - Inches(0.64)
        cy = y + Inches(0.4)
        if c.get("label"):
            pop = th.get("pop")
            lw_ = max(Inches(1.25), Inches(0.22 if pop else 0.2) * len(c["label"]) + Inches(0.55))
            rect(slide, ix, cy, lw_, Inches(0.36) if pop else Inches(0.32), fill=hue(th, i),
                 paras=paragraphs(c["label"], th, size=12 if pop else 10.5, bold=True,
                                  color="FFFFFF", align="ctr"))
            cy += Inches(0.6) if pop else Inches(0.55)
        t = c.get("title", "")
        pop = th.get("pop")
        text(slide, ix, cy, iw, Inches(1.2 if pop else 1.1),
             paragraphs(t, th, size=fit(t, 22 if pop else 19, 14, 18 if pop else 22), bold=True,
                        ls=1.35))
        if c.get("body"):
            bsz = (15 if n <= 3 else 13.5) if pop else SZ["body"]
            text(slide, ix, cy + Inches(1.25 if pop else 1.15), iw,
                 int(y + h - cy - Inches(1.5)),
                 paragraphs(c["body"], th, size=bsz,
                            color=th["ink"] if pop else th["muted"], ls=1.7))
            if pop and len(plain(c["body"])) > (75 if n <= 3 else 60):
                warn(no, f"カード{i + 1}の本文が{len(plain(c['body']))}字。ポップ版は"
                         f"{'75' if n <= 3 else '60'}字までに削る。")
            if len(c["body"]) > 110:
                warn(no, f"カード{i + 1}の本文が{len(c['body'])}字。80字前後まで削る。")


def l_brief(slide, spec, th, no):
    header(slide, spec, th, no)
    items = spec.get("items", [])
    if not items:
        return
    lw = Inches(1.85)
    bx = MARGIN + lw + Inches(0.25)
    bw = SLIDE_W - MARGIN - bx
    gap = Inches(0.18)
    weights = [max(1, len(it.get("points", []))) for it in items]
    total_h = BODY_END - body_top(spec) - gap * (len(items) - 1)
    y = body_top(spec)
    for it, wgt in zip(items, weights):
        h = int(total_h * wgt / sum(weights))
        rect(slide, MARGIN, y, lw, h, fill=th["accent"],
             paras=paragraphs(it.get("label", ""), th, size=14, bold=True, color="FFFFFF",
                              align="ctr"))
        rect(slide, bx, y, bw, h, line=th["accent"], lw=1.5)
        text(slide, bx + Inches(0.3), y, bw - Inches(0.6), h,
             paragraphs([f"・{t}" for t in it.get("points", [])], th, size=12, ls=1.65,
                        after=4), anchor="middle")
        y += h + gap


def l_orient(slide, spec, th, no):
    header(slide, spec, th, no)
    y = body_top(spec) - Inches(0.1)
    quote = spec.get("quote")
    if quote:
        lines = quote if isinstance(quote, list) else [quote]
        qh = int(Inches(0.29) * len(lines) + Inches(0.46))
        panel_h = int(qh + Inches(1.0))
        px, pw = MARGIN + Inches(2.2), CONTENT_W - Inches(4.4)
        rect(slide, px, y, pw, panel_h, fill=th["quote_bg"])
        wy = int(y + Inches(0.35))
        rect(slide, px + Inches(0.6), wy, pw - Inches(1.2), qh, fill=th["paper"])
        text(slide, px + Inches(0.9), wy, pw - Inches(1.8), qh,
             paragraphs(lines, th, size=11, ls=1.65), anchor="middle")
        text(slide, px, wy + qh + Inches(0.1), pw - Inches(0.4), Inches(0.3),
             paragraphs(spec.get("source", "オリエン資料より"), th, size=10.5,
                        color=th["muted"], align="r"))
        y += panel_h + Inches(0.5)
    t = spec.get("text")
    if t:
        lines = t if isinstance(t, list) else [t]
        text(slide, MARGIN + Inches(2.2), y, CONTENT_W - Inches(2.4), BODY_END - y,
             paragraphs(lines, th, size=fit("".join(lines), 17, 12, 130), ls=1.75))


def l_journey(slide, spec, th, no):
    header(slide, spec, th, no)
    phases = spec.get("phases", [])
    n = len(phases)
    if not n:
        return
    if n > 6:
        warn(no, f"フェーズが{n}個。横一列は6つまで。")
    y = body_top(spec)
    band_top, band_bottom = y + Inches(0.15), Inches(6.35)
    cy = int(band_top + Inches(1.55))
    # 背景の斜めの帯（右上がり）
    shape(slide, MARGIN, cy + Inches(0.2), CONTENT_W, band_bottom - cy - Inches(0.2),
          fill=th["accent_soft"], prst="rtTriangle", flipH=True)
    w = int(CONTENT_W / n)
    d = Inches(0.62)
    for i, ph in enumerate(phases):
        x = MARGIN + i * w
        cx = int(x + w / 2)
        name = ph.get("name", "") if isinstance(ph, dict) else str(ph)
        text(slide, x, band_top + Inches(0.35), w, Inches(0.5),
             paragraphs(name, th, size=fit(name, 22, 14, 8), bold=True, align="ctr"))
        mark = ph.get("mark") if isinstance(ph, dict) else None
        shape(slide, cx - d / 2, cy - d / 2, d, d, fill=th["accent"], prst="ellipse",
              paras=paragraphs(mark, th, size=14, bold=True, color="FFFFFF", align="ctr")
              if mark else None)
        if i < n - 1:
            shape(slide, cx + d / 2 + Inches(0.16), cy - Inches(0.055),
                  w - d - Inches(0.32), Inches(0.11), fill=th["accent"], prst="rightArrow",
                  adj={"adj1": 55000, "adj2": 50000})
        if isinstance(ph, dict) and ph.get("voice"):
            text(slide, x + Inches(0.14), cy + Inches(0.6), w - Inches(0.28), Inches(1.3),
                 paragraphs(ph["voice"], th, size=9.5, ls=1.55, align="ctr"))
        if isinstance(ph, dict) and ph.get("aim"):
            rect(slide, x + Inches(0.12), band_bottom - Inches(0.52), w - Inches(0.24),
                 Inches(0.5), line=th["accent"], lw=1.25,
                 paras=paragraphs(ph["aim"], th, size=fit(ph["aim"], 11.5, 9, 10), bold=True,
                                  color=th["accent"], align="ctr"))
    if spec.get("note"):
        text(slide, MARGIN, Inches(6.45), CONTENT_W, Inches(0.4),
             paragraphs(spec["note"], th, size=9.5, color=th["muted"]))


def l_cols(slide, spec, th, no):
    header(slide, spec, th, no)
    cols = spec.get("cols", [])
    n = len(cols)
    if not n:
        return
    gap = Inches(0.8)
    w = int((CONTENT_W - gap * (n - 1)) / n)
    y = body_top(spec) + Inches(0.15)
    for c in cols:
        x = MARGIN + cols.index(c) * (w + gap)
        cy = y
        neg = c.get("tone") == "neg"
        if c.get("big"):
            text(slide, x, cy, w, Inches(1.3),
                 paragraphs(c["big"], th, size=fit(c["big"], 72, 40, 4), bold=True,
                            color=th["neg"] if neg else th["ink"], ls=1.0))
            cy += Inches(1.45)
        if c.get("head"):
            text(slide, x, cy, w, Inches(0.3),
                 paragraphs(c["head"], th, size=11, bold=True,
                            color=th["neg"] if neg else th["accent"], spc=1.0))
            cy += Inches(0.42)
        if c.get("text"):
            text(slide, x, cy, w, BODY_END - cy, paragraphs(c["text"], th, size=15, ls=1.8))
        if c.get("src"):
            text(slide, x, BODY_END - Inches(0.3), w, Inches(0.3),
                 paragraphs(c["src"], th, size=8.5, color=th["line_dark"]))


def l_keymessage(slide, spec, th, no):
    on_accent = spec.get("fill") == "accent"
    bg(slide, th["accent"] if on_accent else th["accent_soft"])
    ink = "FFFFFF" if on_accent else th["ink"]
    text(slide, MARGIN, LABEL_Y, CONTENT_W, Inches(0.34),
         paragraphs(spec.get("label", "キーメッセージ"), th, size=SZ["label"], bold=True,
                    color=ink if on_accent else th["accent"]))
    msg = spec.get("message", "")
    if len(plain(msg)) > 22:
        warn(no, f"キーメッセージが{len(plain(msg))}字。18字までに。")
    text(slide, MARGIN, Inches(2.45), CONTENT_W, Inches(1.2),
         paragraphs(msg, th, size=fit(msg, 38, 26, 16), bold=True,
                    color="FFFFFF" if on_accent else th["accent"], align="ctr"),
         anchor="middle")
    if spec.get("text"):
        text(slide, MARGIN + Inches(1.0), Inches(3.95), CONTENT_W - Inches(2.0), Inches(1.6),
             paragraphs(spec["text"], th, size=12, color=ink, ls=1.85, align="ctr",
                        em="FFFFFF" if on_accent else None))
    if not on_accent:
        rect(slide, 0, BAR_Y, SLIDE_W, BAR_H, fill=th["accent"])


def l_idea(slide, spec, th, no):
    bg(slide, th["quote_bg"])
    cy = Inches(2.35)
    if spec.get("tag") or spec.get("when"):
        tag, when = spec.get("tag", ""), spec.get("when", "")
        tw = Inches(0.26) * max(len(tag), 2) + Inches(0.3)
        ww = Inches(0.26) * len(when) + Inches(0.2) if when else 0
        x0 = int(SLIDE_W / 2 - (tw + ww) / 2)
        rect(slide, x0, cy, tw, Inches(0.42), fill=th["ink"],
             paras=paragraphs(tag, th, size=15, bold=True, color="FFFFFF", align="ctr"))
        if when:
            text(slide, x0 + tw + Inches(0.1), cy, ww, Inches(0.42),
                 paragraphs(when, th, size=17, bold=True, color=th["accent"]),
                 anchor="middle")
        cy += Inches(0.55)
    title = spec.get("title", "")
    if len(plain(title)) > 22:
        warn(no, f"企画名が{len(plain(title))}字。案の名前は20字以内。")
    text(slide, MARGIN, cy, CONTENT_W, Inches(1.1),
         paragraphs(title, th, size=fit(title, 44, 28, 16), bold=True, align="ctr"),
         anchor="middle")
    cy += Inches(1.25)
    if spec.get("desc"):
        n = len(plain(spec["desc"]))
        if n > 90:
            warn(no, f"案の説明が{n}字。2行・70字までに削る。")
        text(slide, MARGIN + Inches(1.0), cy, CONTENT_W - Inches(2.0), Inches(1.0),
             paragraphs(spec["desc"], th, size=12, ls=1.8, align="ctr"))
    tags = spec.get("tags", [])
    if tags:
        cw = Inches(1.75)
        gap = Inches(0.15)
        total = cw * len(tags) + gap * (len(tags) - 1)
        x = int(SLIDE_W / 2 - total / 2)
        for t in tags:
            tt = t.get("text", "") if isinstance(t, dict) else str(t)
            on = bool(t.get("on")) if isinstance(t, dict) else False
            rect(slide, x, Inches(6.35), cw, Inches(0.34),
                 fill=th["ink"] if on else th["line_dark"],
                 paras=paragraphs(tt, th, size=8.5, bold=on, color="FFFFFF", align="ctr"))
            x += cw + gap


def l_plan(slide, spec, th, no):
    x = MARGIN
    y = LABEL_Y + Inches(0.05)
    if spec.get("pill"):
        pw = Inches(0.17) * len(spec["pill"]) + Inches(0.45)
        rect(slide, x, y, pw, Inches(0.38), fill=th["accent"],
             paras=paragraphs(spec["pill"], th, size=12, bold=True, color="FFFFFF",
                              align="ctr", spc=1.2))
        x += pw + Inches(0.3)
    if spec.get("title"):
        text(slide, x, y - Inches(0.04), SLIDE_W - MARGIN - x, Inches(0.5),
             paragraphs(spec["title"], th, size=24, bold=True))
    y += Inches(0.7)
    if spec.get("lead"):
        text(slide, MARGIN, y, CONTENT_W, Inches(1.1),
             paragraphs(spec["lead"], th, size=fit(spec["lead"], 20, 15, 60), medium=True,
                        ls=1.72))
        y += Inches(1.25)
    items = spec.get("spec", [])
    if items:
        rowh = min(Inches(0.72), int((BODY_END - y - Inches(0.2)) / len(items)))
        y = int(y + max(0, (BODY_END - y - rowh * len(items)) / 2))
        kw = Inches(1.4)
        for k, v in items:
            text(slide, MARGIN, y + Inches(0.05), kw, Inches(0.35),
                 paragraphs(k, th, size=11, bold=True, color=th["muted"], spc=0.8))
            text(slide, MARGIN + kw, y, CONTENT_W - kw, rowh,
                 paragraphs(v, th, size=15, ls=1.6))
            y += rowh


def l_kpi(slide, spec, th, no):
    header(slide, spec, th, no)
    items = spec.get("items", [])
    n = len(items)
    if not n:
        return
    gap = Inches(0.5)
    w = int((CONTENT_W - gap * (n - 1)) / n)
    bh = Inches(2.3)
    boxed = spec.get("boxed") or th.get("pop")
    if th.get("bold"):
        bh = Inches(2.5)
    y = centered(spec, bh + (Inches(0.6) if spec.get("note") else 0))
    for i, it in enumerate(items):
        x = MARGIN + i * (w + gap)
        if boxed:
            rect(slide, x, y, w, bh, fill=tint(th, i))
        ix, iw = (x + Inches(0.34), w - Inches(0.68)) if boxed else (x, w)
        text(slide, ix, y + Inches(0.2), iw, Inches(0.35),
             paragraphs(it.get("label", ""), th,
                        size=13.5 if (th.get("pop") or th.get("bold")) else 11, bold=True,
                        color=th["ink"] if th.get("pop") else th["muted"], spc=1.0))
        v = str(it.get("value", ""))
        vsize = fit(v + str(it.get("to", "")), 66 if th.get("bold") else 54, 26,
                    7 if it.get("to") else 5)
        runs = [_run(v, th, vsize, True, hue(th, i) if (boxed and not it.get("to")) else th["ink"])]
        if it.get("to"):
            runs.append(_run(" → ", th, vsize * 0.5, False, th["line_dark"]))
            tone = {"down": th["neg"], "up": th["accent"]}.get(it.get("trend"), th["ink"])
            runs.append(_run(str(it["to"]), th, vsize, True, tone))
        if it.get("unit"):
            runs.append(_run(it["unit"], th, vsize * 0.4, True, th["ink"]))
        text(slide, ix, y + Inches(0.6), iw, Inches(1.0),
             [{"align": "l", "ls": 1.0, "after": 0, "size": vsize, "runs": runs}])
        if it.get("sub"):
            text(slide, ix, y + (Inches(1.85) if th.get("bold") else Inches(1.7)), iw,
                 Inches(0.5),
                 paragraphs(it["sub"], th, size=13 if (th.get("pop") or th.get("bold")) else 11,
                            color=th["muted"], ls=1.35))
    if spec.get("note"):
        text(slide, MARGIN, y + bh + Inches(0.2), CONTENT_W, Inches(0.4),
             paragraphs(spec["note"], th, size=11.5 if (th.get("pop") or th.get("bold")) else 9,
                        color=th["muted"] if (th.get("pop") or th.get("bold")) else th["line_dark"]))
    close_line(slide, spec, th)


def l_table(slide, spec, th, no):
    """表。見出しの下だけ2ptの墨の線、行の間は薄い線、外枠なし。図形で組む。"""
    header(slide, spec, th, no)
    cols, rows = spec.get("columns", []), spec.get("rows", [])
    if not cols:
        return
    if len(cols) > 6:
        warn(no, f"列が{len(cols)}本。6列までに絞る。")
    avail = body_end(spec) - body_top(spec) - (Inches(0.6) if spec.get("note") else 0)
    rowh = max(Inches(0.5), min(Inches(0.82), int(avail / (len(rows) + 1))))
    h = int(rowh * (len(rows) + 1))
    y = centered(spec, h + (Inches(0.6) if spec.get("note") else 0))
    widths = spec.get("widths") or [1] * len(cols)
    total = sum(widths)
    xs, x = [], MARGIN
    for ww in widths:
        xs.append(x)
        x += int(CONTENT_W * ww / total)
    cws = [int(CONTENT_W * ww / total) for ww in widths]
    hi = spec.get("highlight")
    for j, col in enumerate(cols):
        text(slide, xs[j] + (Inches(0.1) if th.get("pop") else 0), y, cws[j] - Inches(0.14), rowh,
             paragraphs(str(col), th, size=12.5 if (th.get("pop") or th.get("bold")) else 11,
                        bold=True, color=th["accent"] if th.get("pop") else th["muted"],
                        spc=1.0),
             anchor="middle")
    rect(slide, MARGIN, y + rowh - Pt(1), CONTENT_W, Pt(2),
         fill=th["accent"] if th.get("pop") else th["ink"], square=True)
    ry = y + rowh
    for i, row in enumerate(rows):
        me = (hi is not None and i == hi)
        if me:
            rect(slide, MARGIN, ry, CONTENT_W, rowh, fill=th["marker"])
        for j in range(len(cols)):
            text(slide, xs[j] + (Inches(0.1) if me else 0), ry,
                 cws[j] - Inches(0.14) - (Inches(0.1) if me else 0), rowh,
                 paragraphs(str(row[j]) if j < len(row) else "", th,
                            size=15 if (th.get("pop") or th.get("bold")) else 13, bold=me,
                            ls=1.3), anchor="middle")
        if i < len(rows) - 1:
            rect(slide, MARGIN, ry + rowh - Pt(0.4), CONTENT_W, Pt(0.75), fill=th["line"],
                 square=True)
        ry += rowh
    if spec.get("note"):
        text(slide, MARGIN, y + h + Inches(0.2), CONTENT_W, Inches(0.5),
             paragraphs(spec["note"], th, size=11.5 if (th.get("pop") or th.get("bold")) else 9.5,
                        color=th["muted"]))
    close_line(slide, spec, th)


def l_timeline(slide, spec, th, no):
    header(slide, spec, th, no)
    months = spec.get("months", [])
    groups = spec.get("groups", [])
    note = spec.get("note")
    gx0, gw0 = Inches(0.30), Inches(0.70)
    x0 = Inches(1.05)
    x1 = SLIDE_W - Inches(0.30)
    cells = sum(int(m.get("weeks", 4)) for m in months)
    if not cells:
        return
    cw = int((x1 - x0) / cells)
    y = body_top(spec)
    mh, wh = Inches(0.34), Inches(0.34)
    col = 0
    for m in months:
        k = int(m.get("weeks", 4))
        rect(slide, x0 + col * cw, y, cw * k, mh,
             fill=th["quote_bg"] if th.get("bold") else th["accent_soft"], square=True,
             paras=paragraphs(m.get("name", ""), th,
                              size=15 if (th.get("pop") or th.get("bold")) else 13, bold=True,
                              color=th["ink"] if th.get("bold") else th["accent"], align="ctr"))
        for j in range(k):
            lab = m.get("labels", ["1W", "2W", "3W", "4W", "5W"])[j] if j < 5 else f"{j + 1}W"
            rect(slide, x0 + (col + j) * cw, y + mh, cw, wh, line=th["line"], lw=0.75,
                 paras=paragraphs(lab, th, size=11 if th.get("pop") else 10, color=th["muted"],
                                  align="ctr"), square=True)
        col += k
    top = y + mh + wh
    bottom = Inches(6.30) if note else Inches(6.55)
    for c in range(cells + 1):
        rect(slide, x0 + c * cw, top, Pt(0.75), bottom - top, fill=th["line"], square=True)
    ms_h = Inches(0.66) if spec.get("milestones") else 0
    nrows = sum(len(g.get("rows", [])) for g in groups)
    rh = min(Inches(0.62), int((bottom - top - ms_h - Inches(0.1)) / max(nrows, 1)))
    ry = top + ms_h + Inches(0.08)
    for gi, g in enumerate(groups):
        rows = g.get("rows", [])
        gh = int(rh * len(rows))
        rect(slide, gx0, ry, gw0, gh,
             fill=th["quote_bg"] if th.get("bold") else tint(th, gi),
             paras=paragraphs(g.get("label", ""), th,
                              size=12 if (th.get("pop") or th.get("bold")) else 10, bold=True,
                              color=th["ink"] if th.get("bold") else hue(th, gi), align="ctr"))
        for r in rows:
            for b in r.get("bars", []):
                st, sp = int(b.get("start", 0)), max(1, int(b.get("span", 1)))
                bh = min(Inches(0.42), int(rh - Inches(0.12)))
                col = b.get("color") or hue(th, gi)
                tc = th["ink"] if (th.get("hues") and col == th["hues"][1]) else "FFFFFF"
                rect(slide, x0 + st * cw + Inches(0.03), ry + rh / 2 - bh / 2,
                     cw * sp - Inches(0.06), bh, fill=col,
                     paras=paragraphs(b.get("text", ""), th,
                                      size=fit(b.get("text", ""),
                                               12 if (th.get("pop") or th.get("bold")) else 10.5,
                                               8, int(2.4 * sp) or 2),
                                      bold=True, color=tc, align="ctr"))
            ry += rh
    for ms in spec.get("milestones", []):
        mx = int(x0 + (int(ms.get("at", 0)) + 0.5) * cw)
        text(slide, mx - Inches(0.25), top + Inches(0.04), Inches(0.5), Inches(0.32),
             paragraphs("★", th, size=15, color=th["accent"], align="ctr"))
        if ms.get("text"):
            text(slide, mx - Inches(0.95), top + Inches(0.36), Inches(1.9), Inches(0.3),
                 paragraphs(ms["text"], th, size=9.5 if th.get("pop") else 8, color=th["muted"],
                            ls=1.25, align="ctr"))
    if note:
        text(slide, gx0, Inches(6.45), CONTENT_W, Inches(0.4),
             paragraphs(note, th, size=11 if th.get("pop") else 9.5, color=th["muted"]))


def l_quote(slide, spec, th, no):
    header(slide, spec, th, no)
    h = Inches(2.4)
    y = centered(spec, h + Inches(0.55))
    rect(slide, MARGIN, y, Inches(0.06), h, fill=th["accent"])
    t = spec.get("text", "")
    text(slide, MARGIN + Inches(0.5), y, Inches(10.6), h,
         paragraphs(f"「{t}」", th, size=fit(t, 26, 16, 50), ls=1.75), anchor="middle")
    if spec.get("source"):
        text(slide, MARGIN + Inches(0.5), y + h + Inches(0.2), Inches(9.0), Inches(0.4),
             paragraphs(f"— {spec['source']}", th, size=SZ["body"], color=th["muted"]))


def l_orgchart(slide, spec, th, no):
    header(slide, spec, th, no)
    y = body_top(spec)
    cx = int(SLIDE_W / 2)
    note = spec.get("note")
    if spec.get("company"):
        text(slide, MARGIN, y, CONTENT_W, Inches(0.4),
             paragraphs(spec["company"], th, size=15, bold=True, align="ctr"))
        y += Inches(0.62)
    members = spec.get("members", [])
    if members:
        gap = Inches(0.3)
        w = min(Inches(3.2), int((CONTENT_W - gap * (len(members) - 1)) / len(members)))
        total = w * len(members) + gap * (len(members) - 1)
        x0 = cx - int(total / 2)
        h = Inches(1.3)
        for i, m in enumerate(members):
            x = x0 + i * (w + gap)
            rect(slide, x, y, w, h, fill=th["paper"], line=th["accent"], lw=1.25)
            text(slide, x, y + Inches(0.2), w, Inches(0.4),
                 paragraphs(m.get("name", ""), th, size=15, align="ctr"))
            rect(slide, x + w * 0.18, y + Inches(0.66), w * 0.64, Pt(0.75), fill=th["line"])
            text(slide, x, y + Inches(0.76), w, Inches(0.5),
                 paragraphs(m.get("roles", []), th, size=9.5, color=th["muted"], ls=1.35,
                            align="ctr"))
        y += h + Inches(0.45)
    opt = spec.get("optional", [])
    if opt:
        gap = Inches(0.3)
        w = min(Inches(2.9), int((Inches(8.0) - gap * (len(opt) - 1)) / len(opt)))
        total = w * len(opt) + gap * (len(opt) - 1)
        x0 = cx - int(total / 2)
        h = Inches(0.85)
        rect(slide, x0 - Inches(0.28), y - Inches(0.22), total + Inches(0.56), h + Inches(0.44),
             line=th["accent"], lw=1.0, dash="dash")
        for i, m in enumerate(opt):
            x = x0 + i * (w + gap)
            rect(slide, x, y, w, h, fill=th["paper"], line=th["accent"], lw=1.25,
                 paras=paragraphs(m.get("name", "") if isinstance(m, dict) else str(m), th,
                                  size=12, align="ctr"))
        y += h + Inches(0.42)
    if note:
        text(slide, MARGIN, min(y, Inches(6.45)), CONTENT_W, Inches(0.4),
             paragraphs(note, th, size=SZ["small"], color=th["muted"], align="ctr"))


def _tweet(slide, x, y, w, h, post, th, big):
    rect(slide, x, y, w, h, fill=th["paper"])
    av = Inches(0.5) if big else Inches(0.38)
    shape(slide, x + Inches(0.22), y + Inches(0.2), av, av, fill=th["line_dark"], prst="ellipse")
    nx = x + Inches(0.22) + av + Inches(0.14)
    text(slide, nx, y + Inches(0.17), w - (nx - x) - Inches(0.2), Inches(0.3),
         paragraphs(post.get("name", ""), th, size=11 if big else 10, bold=True))
    text(slide, nx, y + Inches(0.42), w - (nx - x) - Inches(0.2), Inches(0.25),
         paragraphs(f"{post.get('handle', '')} ・ {post.get('time', '1時間')}", th, size=8.5,
                    color=th["muted"]))
    ty = y + Inches(0.2) + av + Inches(0.14)
    t = post.get("text", "")
    too_long = len(plain(t)) > 70
    th_ = Inches(0.62) if big else Inches(0.6)
    text(slide, nx, ty, w - (nx - x) - Inches(0.25), th_,
         paragraphs(t, th, size=11 if big else 9.5, ls=1.55))
    ty += th_ + Inches(0.08)
    if big:
        ih = h - (ty - y) - Inches(0.55)
        rect(slide, nx, ty, w - (nx - x) - Inches(0.25), ih, fill=th["accent_soft"])
        ty += ih + Inches(0.12)
    stats = post.get("stats") or ["13", "125", "348", "1435"]
    marks = ["💬", "🔁", "♡", "📊"]
    text(slide, nx, ty, w - (nx - x) - Inches(0.25), Inches(0.25),
         paragraphs("    ".join(f"{m} {v}" for m, v in zip(marks, stats)), th, size=8,
                    color=th["muted"]))
    return too_long


def l_tweets(slide, spec, th, no):
    bg(slide, th["quote_bg"])
    text(slide, MARGIN, LABEL_Y, CONTENT_W, Inches(0.3),
         paragraphs(spec.get("label", "SNSの露出イメージ"), th, size=11, bold=True))
    posts = spec.get("posts", [])
    if not posts:
        return
    top = Inches(0.75)
    bottom = Inches(6.7)
    bw = Inches(5.3)
    if _tweet(slide, MARGIN + Inches(0.4), top, bw, bottom - top, posts[0], th, True):
        warn(no, "投稿1が70字超。ツイートは一息で読める長さに。")
    rest = posts[1:4]
    rx = MARGIN + Inches(0.4) + bw + Inches(0.35)
    rw = SLIDE_W - MARGIN - Inches(0.4) - rx
    gap = Inches(0.22)
    rh = int((bottom - top - gap * (len(rest) - 1)) / len(rest))
    for k, pst in enumerate(rest):
        if _tweet(slide, rx, top + k * (rh + gap), rw, rh, pst, th, False):
            warn(no, f"投稿{k + 2}が70字超。ツイートは一息で読める長さに。")


def l_solo(slide, spec, th, no):
    """1ページに1項目だけ、大きく出す。番号＋一言＋補足。

    fill を渡すとページ全面が色になる（章扉として使う）。
    番号の色は no の数字で hues を回す。
    """
    fill = spec.get("fill")
    flood = {"accent": th["accent"], "marker": th["marker"],
             "ink": th["ink"]}.get(fill) or (hue(th, int(fill)) if str(fill).isdigit() else None)
    on_light = flood in (th["marker"], th.get("hues", [None, None])[1] if th.get("hues") else None)
    ink = th["ink"] if (flood is None or on_light) else "FFFFFF"
    if flood:
        bg(slide, flood)
    if spec.get("label"):
        text(slide, MARGIN, LABEL_Y + Inches(0.04), CONTENT_W, Inches(0.36),
             paragraphs(spec["label"], th, size=13, bold=True, color=ink, spc=1.5))

    n = str(spec.get("no", ""))
    title = spec.get("title", "")
    body = spec.get("body")
    nw = Inches(2.3) if n else 0
    tx = MARGIN + nw
    tw = SLIDE_W - MARGIN - tx
    block = Inches(2.6)
    y = int(Inches(1.5) + max(0, (Inches(5.1) - block) / 2))

    if n:
        # 白地では黄色の数字が沈むので、番号の色は黄を外して回す
        seq = [c for c in (th.get("hues") or [th["accent"]]) if c != th["marker"]]
        nc = ink if flood else seq[((int(n) - 1) if n.isdigit() else 0) % len(seq)]
        text(slide, MARGIN, y, int(nw), int(block),
             paragraphs(n, th, size=132, bold=True, color=nc, ls=1.0), anchor="middle")
    text(slide, int(tx), y, int(tw), int(block * 0.62),
         paragraphs(title, th, size=fit(title, 80, 40, 8), bold=True, color=ink, ls=1.15),
         anchor="bottom")
    if body:
        text(slide, int(tx), int(y + block * 0.68), int(tw), int(block * 0.34),
             paragraphs(body, th, size=fit(body, 18, 14, 46), color=ink, ls=1.55))


def l_closing(slide, spec, th, no):
    if th.get("bold"):
        bg(slide, th["hues"][1])
        if spec.get("label"):
            text(slide, MARGIN, Inches(0.7), CONTENT_W, Inches(0.4),
                 paragraphs(spec["label"], th, size=14, bold=True, spc=1.5))
        t = spec.get("text") or spec.get("headline", "")
        text(slide, MARGIN, Inches(2.0), CONTENT_W, Inches(3.0),
             paragraphs(t, th, size=fit(t, 60, 32, 16), bold=True, ls=1.12), anchor="middle")
        if spec.get("sub"):
            text(slide, MARGIN, Inches(5.2), CONTENT_W, Inches(1.0),
                 paragraphs(spec["sub"], th, size=18, medium=True, ls=1.45))
        return
    if th.get("pop"):
        bg(slide, th["accent"])
        shape(slide, -Inches(1.6), SLIDE_H - Inches(2.4), Inches(3.6), Inches(3.6),
              fill=th["hues"][1], prst="ellipse")
        shape(slide, SLIDE_W - Inches(1.9), Inches(0.6), Inches(1.4), Inches(1.4),
              fill=th["hues"][2], prst="ellipse")
        t = spec.get("text") or spec.get("headline", "")
        text(slide, MARGIN, Inches(2.7), CONTENT_W, Inches(1.8),
             paragraphs(t, th, size=fit(t, 48, 24, 20), bold=True, color="FFFFFF", ls=1.4,
                        align="ctr"), anchor="middle")
        if spec.get("sub"):
            text(slide, MARGIN, Inches(4.6), CONTENT_W, Inches(0.8),
                 paragraphs(spec["sub"], th, size=15, bold=True, color="FFFFFF", ls=1.6,
                            align="ctr"))
        return
    bg(slide, th["accent_soft"])
    t = spec.get("text") or spec.get("headline", "")
    text(slide, MARGIN, Inches(3.0), CONTENT_W, Inches(1.6),
         paragraphs(t, th, size=fit(t, SZ["statement"], 20, 34), bold=True, ls=1.5, align="ctr"),
         anchor="middle")
    if spec.get("sub"):
        text(slide, MARGIN, Inches(4.7), CONTENT_W, Inches(0.8),
             paragraphs(spec["sub"], th, size=SZ["body"], color=th["muted"], ls=1.6, align="ctr"))
    rect(slide, 0, BAR_Y, SLIDE_W, BAR_H, fill=th["accent"])


LAYOUTS = {
    "cover": l_cover, "index": l_index, "agenda": l_index, "statement": l_statement,
    "bullets": l_bullets, "cards": l_cards, "brief": l_brief, "orient": l_orient,
    "journey": l_journey, "cols": l_cols, "keymessage": l_keymessage, "idea": l_idea,
    "plan": l_plan, "kpi": l_kpi, "table": l_table, "timeline": l_timeline,
    "quote": l_quote, "orgchart": l_orgchart, "tweets": l_tweets, "solo": l_solo,
    "closing": l_closing,
}
NO_CHROME = {"cover", "closing", "idea", "keymessage"}

_SKIP_KEYS = {"layout", "path", "logo", "color", "theme", "fill", "mode", "on", "start",
              "span", "at", "weeks", "widths", "highlight", "dim", "ribbon", "notes",
              "placeholder", "stats", "handle", "time", "gray", "bar"}


def spec_chars(spec) -> int:
    if isinstance(spec, dict):
        return sum(spec_chars(v) for k, v in spec.items() if k not in _SKIP_KEYS)
    if isinstance(spec, list):
        return sum(spec_chars(v) for v in spec)
    if isinstance(spec, str):
        return len(plain(spec))
    return 0


# ------------------------------------------------ パッケージ（.pptx = zip）
NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')
XMLH = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def rels(items) -> str:
    body = "".join(
        f'<Relationship Id="{rid}" Type="{R_NS}/{typ}" Target="{tgt}"/>' for rid, typ, tgt in items)
    return f'{XMLH}<Relationships xmlns="{PKG_NS}">{body}</Relationships>'


def theme_xml(name: str, font: str) -> str:
    fs = (f'<a:latin typeface="{font}"/><a:ea typeface="{font}"/><a:cs typeface="{font}"/>'
          f'<a:font script="Jpan" typeface="{font}"/>')
    return f"""{XMLH}<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="{name}"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="14141A"/></a:dk2><a:lt2><a:srgbClr val="E7E7EE"/></a:lt2><a:accent1><a:srgbClr val="B5025D"/></a:accent1><a:accent2><a:srgbClr val="6B6B76"/></a:accent2><a:accent3><a:srgbClr val="FFD93D"/></a:accent3><a:accent4><a:srgbClr val="FF5C77"/></a:accent4><a:accent5><a:srgbClr val="A3A3AE"/></a:accent5><a:accent6><a:srgbClr val="FBE9F2"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont>{fs}</a:majorFont><a:minorFont>{fs}</a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>"""


EMPTY_TREE = ('<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
              '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
              '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>')
CLRMAP = ('<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" '
          'accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" '
          'accent6="accent6" hlink="hlink" folHlink="folHlink"/>')
TXSTYLES = ('<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr sz="4400"/></a:lvl1pPr></p:titleStyle>'
            '<p:bodyStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:bodyStyle>'
            '<p:otherStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:otherStyle></p:txStyles>')


def slide_master_xml() -> str:
    return (f'{XMLH}<p:sldMaster {NS}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/>'
            f"</p:bgRef></p:bg><p:spTree>{EMPTY_TREE}</p:spTree></p:cSld>{CLRMAP}"
            f'<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
            f"{TXSTYLES}</p:sldMaster>")


def slide_layout_xml() -> str:
    return (f'{XMLH}<p:sldLayout {NS} type="blank" preserve="1"><p:cSld name="Blank">'
            f"<p:spTree>{EMPTY_TREE}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/>"
            f"</p:clrMapOvr></p:sldLayout>")


def notes_master_xml() -> str:
    return (f'{XMLH}<p:notesMaster {NS}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/>'
            f"</p:bgRef></p:bg><p:spTree>{EMPTY_TREE}"
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr>'
            '<a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr>'
            '<p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="1143000" y="685800"/>'
            '<a:ext cx="4572000" cy="3429000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
            '<a:noFill/><a:ln w="12700"><a:solidFill><a:prstClr val="black"/></a:solidFill></a:ln></p:spPr></p:sp>'
            '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr>'
            '<a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" sz="quarter" idx="3"/></p:nvPr>'
            '</p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="4343400"/><a:ext cx="5486400" cy="4114800"/>'
            '</a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr/>'
            '<a:lstStyle/><a:p><a:endParaRPr lang="ja-JP"/></a:p></p:txBody></p:sp>'
            f"</p:spTree></p:cSld>{CLRMAP}<p:notesStyle><a:lvl1pPr><a:defRPr sz=\"1200\"/></a:lvl1pPr>"
            "</p:notesStyle></p:notesMaster>")


def notes_slide_xml(notes: str) -> str:
    paras = "".join(
        f'<a:p><a:r><a:rPr lang="ja-JP" altLang="en-US" sz="1200"/><a:t>{escape(line)}</a:t></a:r></a:p>'
        for line in notes.split("\n")) or "<a:p/>"
    return (f'{XMLH}<p:notes {NS}><p:cSld><p:spTree>{EMPTY_TREE}'
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr>'
            '<a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr>'
            '<p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp>'
            '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr>'
            '<a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>'
            f'<p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>{paras}</p:txBody></p:sp>'
            "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>")


ANCHOR = {"top": "t", "middle": "ctr", "bottom": "b"}


def _run_xml(r: dict) -> str:
    attrs = (f' lang="ja-JP" altLang="en-US" sz="{int(round(r["size"] * 100))}"'
             f' b="{1 if r["bold"] else 0}"')
    if r.get("spc"):
        attrs += f' spc="{int(r["spc"] * 100)}"'
    x = f'<a:r><a:rPr{attrs}><a:solidFill><a:srgbClr val="{r["color"]}"/></a:solidFill>'
    if r.get("hl"):
        x += f'<a:highlight><a:srgbClr val="{r["hl"]}"/></a:highlight>'
    f = r["font"]
    x += (f'<a:latin typeface="{f}"/><a:ea typeface="{f}"/><a:cs typeface="{f}"/>'
          f'</a:rPr><a:t>{escape(r["text"])}</a:t></a:r>')
    return x


def _para_xml(p: dict) -> str:
    ppr = f'<a:pPr algn="{p["align"]}"><a:lnSpc><a:spcPct val="{int(p["ls"] * 100000)}"/></a:lnSpc>'
    if p.get("after"):
        ppr += f'<a:spcAft><a:spcPts val="{int(p["after"] * 100)}"/></a:spcAft>'
    ppr += "</a:pPr>"
    runs = "".join(_run_xml(r) for r in p["runs"])
    if not runs:
        runs = f'<a:endParaRPr lang="ja-JP" sz="{int(p["size"] * 100)}"/>'
    return f"<a:p>{ppr}{runs}</a:p>"


def _txbody_xml(paras, anchor) -> str:
    body = "".join(_para_xml(p) for p in paras) or "<a:p/>"
    return (f'<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" '
            f'anchor="{ANCHOR[anchor]}" rtlCol="0"/><a:lstStyle/>{body}</p:txBody>')


def _shape_xml(sh: dict, i: int) -> str:
    if sh["kind"] == "text":
        return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="TextBox {i}"/><p:cNvSpPr txBox="1"/>'
                f'<p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="{sh["x"]}" y="{sh["y"]}"/>'
                f'<a:ext cx="{sh["w"]}" cy="{sh["h"]}"/></a:xfrm><a:prstGeom prst="rect">'
                f'<a:avLst/></a:prstGeom><a:noFill/></p:spPr>'
                f'{_txbody_xml(sh["paras"], sh["anchor"])}</p:sp>')
    flip = ' flipH="1"' if sh["flipH"] else ""
    av = "".join(f'<a:gd name="{k}" fmla="val {int(v)}"/>' for k, v in sh["adj"].items())
    sppr = (f'<a:xfrm{flip}><a:off x="{sh["x"]}" y="{sh["y"]}"/>'
            f'<a:ext cx="{sh["w"]}" cy="{sh["h"]}"/></a:xfrm>'
            f'<a:prstGeom prst="{sh["prst"]}"><a:avLst>{av}</a:avLst></a:prstGeom>')
    sppr += (f'<a:solidFill><a:srgbClr val="{sh["fill"]}"/></a:solidFill>' if sh["fill"]
             else "<a:noFill/>")
    if sh["line"]:
        sppr += f'<a:ln w="{Pt(sh["lw"])}"><a:solidFill><a:srgbClr val="{sh["line"]}"/></a:solidFill>'
        if sh["dash"]:
            sppr += f'<a:prstDash val="{sh["dash"]}"/>'
        sppr += "</a:ln>"
    else:
        sppr += "<a:ln><a:noFill/></a:ln>"
    return (f'<p:sp><p:nvSpPr><p:cNvPr id="{i}" name="Shape {i}"/><p:cNvSpPr/><p:nvPr/>'
            f'</p:nvSpPr><p:spPr>{sppr}</p:spPr>{_txbody_xml(sh["paras"], sh["anchor"])}</p:sp>')


def slide_xml(slide: Slide) -> str:
    bgx = (f'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="{slide.bg_color}"/></a:solidFill>'
           "<a:effectLst/></p:bgPr></p:bg>")
    shapes = "".join(_shape_xml(sh, i) for i, sh in enumerate(slide.shapes, start=2))
    return (f"{XMLH}<p:sld {NS}><p:cSld>{bgx}<p:spTree>{EMPTY_TREE}{shapes}"
            "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>")


# ------------------------------------------------ HTML プレビュー（同じ図形データから）
PX = 96 / 914400          # EMU → px（96dpi）


def _px(v) -> str:
    return f"{v * PX:.2f}px"


def _run_html(r: dict) -> str:
    st = (f'font-size:{r["size"] * 96 / 72:.2f}px;color:#{r["color"]};'
          f'font-weight:{700 if r["bold"] else (500 if "Medium" in r["font"] else 400)};')
    if r.get("spc"):
        st += f'letter-spacing:{r["spc"] * 96 / 72:.2f}px;'
    if r.get("hl"):
        st += f'background:#{r["hl"]};'
    return f'<span style="{st}">{escape(r["text"])}</span>'


def _para_html(p: dict) -> str:
    al = {"l": "left", "ctr": "center", "r": "right"}[p["align"]]
    st = (f'text-align:{al};line-height:{p["ls"] * 1.3:.2f};'
          f'margin:0 0 {p.get("after", 0) * 96 / 72:.2f}px 0;font-size:{p["size"] * 96 / 72:.2f}px;')
    inner = "".join(_run_html(r) for r in p["runs"]) or "&nbsp;"
    return f'<p style="{st}">{inner}</p>'


def _shape_html(sh: dict) -> str:
    jc = {"top": "flex-start", "middle": "center", "bottom": "flex-end"}[sh["anchor"]]
    st = (f'left:{_px(sh["x"])};top:{_px(sh["y"])};width:{_px(sh["w"])};height:{_px(sh["h"])};'
          f'justify-content:{jc};')
    if sh["kind"] == "shape":
        if sh["fill"]:
            st += f'background:#{sh["fill"]};'
        if sh["line"]:
            st += (f'box-shadow:inset 0 0 0 {sh["lw"] * 96 / 72:.2f}px #{sh["line"]};'
                   if not sh["dash"] else
                   f'outline:{sh["lw"] * 96 / 72:.2f}px dashed #{sh["line"]};outline-offset:-1px;')
        if sh["prst"] == "ellipse":
            st += "border-radius:50%;"
        elif sh["prst"] == "roundRect":
            r = sh["adj"].get("adj", 16667) / 100000 * min(sh["w"], sh["h"]) * PX
            st += f"border-radius:{r:.2f}px;"
        elif sh["prst"] == "rtTriangle":
            st += ("clip-path:polygon(100% 0,100% 100%,0 100%);" if sh["flipH"]
                   else "clip-path:polygon(0 0,100% 100%,0 100%);")
        elif sh["prst"] == "rightArrow":
            st += "clip-path:polygon(0 25%,80% 25%,80% 0,100% 50%,80% 100%,80% 75%,0 75%);"
    body = "".join(_para_html(p) for p in sh["paras"])
    return f'<div class="s" style="{st}">{body}</div>'


def deck_html(slides: list, th: dict, title: str) -> str:
    css = f"""<meta charset="utf-8"><title>{escape(title)}</title><style>
    @page {{ size: 13.333in 7.5in; margin: 0; }}
    html, body {{ margin: 0; background: #DDD; }}
    body {{ font-family: "Yu Gothic Medium", "Yu Gothic", "YuGothic", "Hiragino Sans",
           "Noto Sans JP", "IPAPGothic", sans-serif; }}
    .slide {{ position: relative; width: 1280px; height: 720px; overflow: hidden;
             margin: 24px auto; background: #fff; page-break-after: always; break-after: page; }}
    @media print {{ html, body {{ background: #fff; }} .slide {{ margin: 0; }} }}
    .s {{ position: absolute; display: flex; flex-direction: column; box-sizing: border-box;
         overflow: visible; }}
    .s p {{ word-break: break-all; overflow-wrap: anywhere; white-space: pre-wrap; }}
    </style>"""
    pages = []
    for s in slides:
        pages.append(f'<div class="slide" style="background:#{s.bg_color}">'
                     + "".join(_shape_html(sh) for sh in s.shapes) + "</div>")
    return "<!doctype html><html lang=\"ja\"><head>" + css + "</head><body>" + "".join(pages) + "</body></html>"


def presentation_xml(n: int, font: str) -> str:
    ids = "".join(f'<p:sldId id="{256 + i}" r:id="rId{3 + i}"/>' for i in range(n))
    return (f'{XMLH}<p:presentation {NS} saveSubsetFonts="1">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
            '<p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst>'
            f"<p:sldIdLst>{ids}</p:sldIdLst>"
            f'<p:sldSz cx="{SLIDE_W}" cy="{SLIDE_H}"/><p:notesSz cx="6858000" cy="9144000"/>'
            '<p:defaultTextStyle><a:defPPr><a:defRPr lang="ja-JP"/></a:defPPr>'
            f'<a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">'
            f'<a:defRPr sz="1800" kern="1200"><a:solidFill><a:schemeClr val="tx1"/></a:solidFill>'
            f'<a:latin typeface="{font}"/><a:ea typeface="{font}"/><a:cs typeface="{font}"/></a:defRPr>'
            "</a:lvl1pPr></p:defaultTextStyle></p:presentation>")


def content_types(n: int) -> str:
    ct = "http://schemas.openxmlformats.org/"
    ov = [("/ppt/presentation.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/slideMasters/slideMaster1.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/slideLayouts/slideLayout1.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/notesMasters/notesMaster1.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/theme/theme1.xml", f"{ct}drawingml/2006/main"),
          ("/ppt/theme/theme2.xml", f"{ct}drawingml/2006/main"),
          ("/ppt/presProps.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/viewProps.xml", f"{ct}presentationml/2006/main"),
          ("/ppt/tableStyles.xml", f"{ct}presentationml/2006/main"),
          ("/docProps/core.xml", "application/vnd.openxmlformats-package.core-properties+xml"),
          ("/docProps/app.xml", f"{ct}officeDocument/2006/extended-properties+xml")]
    kinds = {"/ppt/presentation.xml": "presentation", "/ppt/slideMasters/slideMaster1.xml": "slideMaster",
             "/ppt/slideLayouts/slideLayout1.xml": "slideLayout",
             "/ppt/notesMasters/notesMaster1.xml": "notesMaster", "/ppt/theme/theme1.xml": "theme",
             "/ppt/theme/theme2.xml": "theme", "/ppt/presProps.xml": "presProps",
             "/ppt/viewProps.xml": "viewProps", "/ppt/tableStyles.xml": "tableStyles"}
    out = [f'{XMLH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
           '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
           '<Default Extension="xml" ContentType="application/xml"/>']
    for part, base in ov:
        k = kinds.get(part)
        typ = f"application/vnd.openxmlformats-officedocument.{'presentationml.' + k if k not in ('theme',) else 'theme'}+xml" if k else base
        if part.startswith("/docProps"):
            typ = base
        out.append(f'<Override PartName="{part}" ContentType="{typ}"/>')
    for i in range(1, n + 1):
        out.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
        out.append(f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>')
    out.append("</Types>")
    return "".join(out)


def save(slides: list[Slide], out: Path, font: str, title: str) -> None:
    n = len(slides)
    z = zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED)
    z.writestr("[Content_Types].xml", content_types(n))
    z.writestr("_rels/.rels", (
        f'{XMLH}<Relationships xmlns="{PKG_NS}">'
        f'<Relationship Id="rId1" Type="{R_NS}/officeDocument" Target="ppt/presentation.xml"/>'
        f'<Relationship Id="rId2" Type="{PKG_NS}/metadata/core-properties" Target="docProps/core.xml"/>'
        f'<Relationship Id="rId3" Type="{R_NS}/extended-properties" Target="docProps/app.xml"/>'
        "</Relationships>"))
    z.writestr("ppt/presentation.xml", presentation_xml(n, font))
    z.writestr("ppt/_rels/presentation.xml.rels", rels(
        [("rId1", "slideMaster", "slideMasters/slideMaster1.xml"),
         ("rId2", "notesMaster", "notesMasters/notesMaster1.xml")]
        + [(f"rId{3 + i}", "slide", f"slides/slide{i + 1}.xml") for i in range(n)]
        + [(f"rId{3 + n}", "presProps", "presProps.xml"),
           (f"rId{4 + n}", "viewProps", "viewProps.xml"),
           (f"rId{5 + n}", "theme", "theme/theme1.xml"),
           (f"rId{6 + n}", "tableStyles", "tableStyles.xml")]))
    z.writestr("ppt/slideMasters/slideMaster1.xml", slide_master_xml())
    z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", rels(
        [("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"),
         ("rId2", "theme", "../theme/theme1.xml")]))
    z.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout_xml())
    z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", rels(
        [("rId1", "slideMaster", "../slideMasters/slideMaster1.xml")]))
    z.writestr("ppt/notesMasters/notesMaster1.xml", notes_master_xml())
    z.writestr("ppt/notesMasters/_rels/notesMaster1.xml.rels", rels(
        [("rId1", "theme", "../theme/theme2.xml")]))
    z.writestr("ppt/theme/theme1.xml", theme_xml("Deck", font))
    z.writestr("ppt/theme/theme2.xml", theme_xml("Notes", font))
    z.writestr("ppt/presProps.xml", f"{XMLH}<p:presentationPr {NS}/>")
    z.writestr("ppt/viewProps.xml", f'{XMLH}<p:viewPr {NS}><p:gridSpacing cx="76200" cy="76200"/></p:viewPr>')
    z.writestr("ppt/tableStyles.xml", f'{XMLH}<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}}"/>')
    for i, s in enumerate(slides, start=1):
        z.writestr(f"ppt/slides/slide{i}.xml", slide_xml(s))
        z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", rels(
            [("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"),
             ("rId2", "notesSlide", f"../notesSlides/notesSlide{i}.xml")]))
        z.writestr(f"ppt/notesSlides/notesSlide{i}.xml", notes_slide_xml(s.notes))
        z.writestr(f"ppt/notesSlides/_rels/notesSlide{i}.xml.rels", rels(
            [("rId1", "notesMaster", "../notesMasters/notesMaster1.xml"),
             ("rId2", "slide", f"../slides/slide{i}.xml")]))
    z.writestr("docProps/core.xml", (
        f'{XMLH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
        'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        f"<dc:title>{escape(title)}</dc:title><dc:creator>大隅絢加</dc:creator></cp:coreProperties>"))
    z.writestr("docProps/app.xml", (
        f'{XMLH}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
        'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        f"<Application>Microsoft Office PowerPoint</Application><Slides>{n}</Slides></Properties>"))
    z.close()


def build(deck: dict, out: Path, html_out: Path | None = None) -> None:
    meta = deck.get("meta", {})
    th = dict(BASE)
    th.update(THEMES.get(meta.get("theme", "navy"), THEMES["navy"]))
    th.update(meta.get("colors", {}))
    if meta.get("font"):
        th["font"] = meta["font"]
    foot = meta.get("footer", "")
    global ROUNDED, TOTAL
    ROUNDED = bool(th.get("pop"))
    TOTAL = len(deck.get("slides", []))
    slides: list[Slide] = []
    char_total: list[int] = []
    for i, spec in enumerate(deck.get("slides", []), start=1):
        kind = spec.get("layout", "bullets")
        fn = LAYOUTS.get(kind)
        if fn is None:
            raise SystemExit(f"p.{i}: 未知の layout '{kind}'。使えるのは: {', '.join(sorted(LAYOUTS))}")
        s = Slide(th)
        fn(s, spec, th, i)
        if kind not in NO_CHROME:
            chrome(s, th, i, foot)
        n_chars = spec_chars(spec)
        char_total.append(n_chars)
        if n_chars > 300 and kind not in ("brief", "table", "orgchart"):
            warn(i, f"文字が{n_chars}字。説明のページでも200字が上限。")
        s.notes = spec.get("notes", "")
        slides.append(s)
    if char_total and sum(char_total) / len(char_total) > 170:
        warn(0, f"1枚あたり平均{sum(char_total) // len(char_total)}字。全体に削る。")
    out.parent.mkdir(parents=True, exist_ok=True)
    title = next((s.get("title", "") for s in deck.get("slides", []) if s.get("layout") == "cover"), "")
    save(slides, out, th["font"], title)
    if html_out:
        html_out.write_text(deck_html(slides, th, title), encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser(description="構成JSONから提案書pptxを生成する（依存なし）")
    ap.add_argument("spec")
    ap.add_argument("-o", "--out")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--html", help="同じ内容のHTMLプレビューも書き出す")
    a = ap.parse_args()
    deck = json.loads(Path(a.spec).read_text(encoding="utf-8"))
    out = Path(a.out) if a.out else Path(a.spec).with_suffix(".pptx")
    build(deck, out if not a.check else Path("/tmp/_deck_check.pptx"),
          Path(a.html) if a.html else None)
    n = len(deck.get("slides", []))
    if WARNINGS:
        print(f"⚠ 詰め込みすぎの疑い（{len(WARNINGS)}件）:", file=sys.stderr)
        print("\n".join(WARNINGS), file=sys.stderr)
    print(f"{n}枚をチェックした。警告 {len(WARNINGS)}件。" if a.check else f"✓ {out}（{n}枚）")


if __name__ == "__main__":
    main()
