/**
 * Detects if text should be displayed right-to-left (RTL) based on the first significant character
 * @param text - The text to analyze
 * @returns 'rtl' if the text starts with RTL characters (Hebrew/Arabic), 'ltr' otherwise
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';

  // Find the first significant character (skip whitespace, punctuation, symbols, and digits)
  const significantChar = text.match(/[^\s\p{P}\p{S}\p{N}]/u)?.[0];

  if (!significantChar) return 'ltr';

  const charCode = significantChar.charCodeAt(0);

  // Check for RTL scripts:
  // Hebrew: U+0590 to U+05FF
  // Arabic: U+0600 to U+06FF
  // Arabic Supplement: U+0750 to U+077F
  // Arabic Extended-A: U+08A0 to U+08FF
  // Arabic Presentation Forms-A: U+FB50 to U+FDFF
  // Arabic Presentation Forms-B: U+FE70 to U+FEFF
  const isRTL =
    (charCode >= 0x0590 && charCode <= 0x05ff) || // Hebrew
    (charCode >= 0x0600 && charCode <= 0x06ff) || // Arabic
    (charCode >= 0x0750 && charCode <= 0x077f) || // Arabic Supplement
    (charCode >= 0x08a0 && charCode <= 0x08ff) || // Arabic Extended-A
    (charCode >= 0xfb50 && charCode <= 0xfdff) || // Arabic Presentation Forms-A
    (charCode >= 0xfe70 && charCode <= 0xfeff); // Arabic Presentation Forms-B

  return isRTL ? 'rtl' : 'ltr';
}
