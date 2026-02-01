import { pinyin } from "pinyin-pro";
import { normalizePinyinForDisplay } from "./pinyinNormalize";

const CJK_RE = /[\u3400-\u9FFF]/;

export function isCjkString(text: string): boolean {
  return !!text && CJK_RE.test(text);
}

export function toPinyinDisplayFromHanzi(hanzi: string): string {
  if (!hanzi) return "";
  const raw = pinyin(hanzi, { toneType: "symbol" });
  return normalizePinyinForDisplay(raw);
}

export function formatTrilingualMultiline(hanzi: string, english: string): string {
  const zh = hanzi || "";
  const en = english || "";

  if (!zh && !en) return "";

  if (!zh) return en;
  if (!en) return `${toPinyinDisplayFromHanzi(zh)}\n${zh}`;

  return `${toPinyinDisplayFromHanzi(zh)}\n${zh}\n${en}`;
}

