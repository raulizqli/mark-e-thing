// apps/api/src/infrastructure/parsers/text-extractor.ts

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerMime === 'text/plain' || lowerName.endsWith('.txt')) {
    return buffer.toString('utf8').trim();
  }

  const isPdf =
    lowerMime === 'application/pdf' ||
    lowerMime === 'application/x-pdf' ||
    lowerName.endsWith('.pdf');

  if (isPdf) {
    try {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        const text = (result.text ?? '').trim();
        if (text.length > 0) {
          return text;
        }
        return `[PDF without extractable text: ${fileName}]`;
      } finally {
        await parser.destroy();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      return `[PDF extraction failed: ${fileName} — ${message}]`;
    }
  }

  return `[Pending extraction: ${fileName}]`;
}
