const COMBINING_MACRON = "\u0304";
const COMBINING_ACUTE = "\u0301";
const COMBINING_CARON = "\u030C";
const COMBINING_GRAVE = "\u0300";

const TONE_MARKS = new Set([
  COMBINING_MACRON,
  COMBINING_ACUTE,
  COMBINING_CARON,
  COMBINING_GRAVE,
]);

const PRECOMPOSED_TONES: Record<string, string> = {
  // a
  ā: "a" + COMBINING_MACRON,
  á: "a" + COMBINING_ACUTE,
  ǎ: "a" + COMBINING_CARON,
  à: "a" + COMBINING_GRAVE,
  Ā: "A" + COMBINING_MACRON,
  Á: "A" + COMBINING_ACUTE,
  Ǎ: "A" + COMBINING_CARON,
  À: "A" + COMBINING_GRAVE,

  // e
  ē: "e" + COMBINING_MACRON,
  é: "e" + COMBINING_ACUTE,
  ě: "e" + COMBINING_CARON,
  è: "e" + COMBINING_GRAVE,
  Ē: "E" + COMBINING_MACRON,
  É: "E" + COMBINING_ACUTE,
  Ě: "E" + COMBINING_CARON,
  È: "E" + COMBINING_GRAVE,

  // i
  ī: "i" + COMBINING_MACRON,
  í: "i" + COMBINING_ACUTE,
  ǐ: "i" + COMBINING_CARON,
  ì: "i" + COMBINING_GRAVE,
  Ī: "I" + COMBINING_MACRON,
  Í: "I" + COMBINING_ACUTE,
  Ǐ: "I" + COMBINING_CARON,
  Ì: "I" + COMBINING_GRAVE,

  // o
  ō: "o" + COMBINING_MACRON,
  ó: "o" + COMBINING_ACUTE,
  ǒ: "o" + COMBINING_CARON,
  ò: "o" + COMBINING_GRAVE,
  Ō: "O" + COMBINING_MACRON,
  Ó: "O" + COMBINING_ACUTE,
  Ǒ: "O" + COMBINING_CARON,
  Ò: "O" + COMBINING_GRAVE,

  // u
  ū: "u" + COMBINING_MACRON,
  ú: "u" + COMBINING_ACUTE,
  ǔ: "u" + COMBINING_CARON,
  ù: "u" + COMBINING_GRAVE,
  Ū: "U" + COMBINING_MACRON,
  Ú: "U" + COMBINING_ACUTE,
  Ǔ: "U" + COMBINING_CARON,
  Ù: "U" + COMBINING_GRAVE,

  // ü (common pinyin tone vowels)
  ǖ: "ü" + COMBINING_MACRON,
  ǘ: "ü" + COMBINING_ACUTE,
  ǚ: "ü" + COMBINING_CARON,
  ǜ: "ü" + COMBINING_GRAVE,
  Ǖ: "Ü" + COMBINING_MACRON,
  Ǘ: "Ü" + COMBINING_ACUTE,
  Ǚ: "Ü" + COMBINING_CARON,
  Ǜ: "Ü" + COMBINING_GRAVE,
};

function replacePrecomposedToneVowels(input: string): string {
  let out = "";
  for (const ch of input) {
    out += PRECOMPOSED_TONES[ch] ?? ch;
  }
  return out;
}

function replaceLatinAWithOpenA(input: string): string {
  const OPEN_A = "\u0251"; // ɑ
  const OPEN_A_UPPER = "\u2C6D"; // Ɑ (LATIN CAPITAL LETTER ALPHA)

  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === "a") {
      if (next && TONE_MARKS.has(next)) {
        out += OPEN_A;
      } else {
        out += OPEN_A;
      }
      continue;
    }

    if (ch === "A") {
      if (next && TONE_MARKS.has(next)) {
        out += OPEN_A_UPPER;
      } else {
        out += OPEN_A_UPPER;
      }
      continue;
    }

    out += ch;
  }
  return out;
}

// Converts pinyin into a deterministic Unicode sequence for rendering:
// - ā/á/ǎ/à => a + combining tone mark
// - a/A => ɑ/Ɑ
// - a + combining => ɑ + combining
export function normalizePinyinForDisplay(pinyin: string): string {
  if (!pinyin) return pinyin;

  const withCombining = replacePrecomposedToneVowels(pinyin);
  const withOpenA = replaceLatinAWithOpenA(withCombining);
  return withOpenA.normalize("NFD");
}
