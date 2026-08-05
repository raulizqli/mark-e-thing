// apps/api/src/infrastructure/parsers/text-extractor.ts

export function extractText(buffer: Buffer, mimeType: string, fileName: string): string {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerMime === 'text/plain' || lowerName.endsWith('.txt')) {
    return buffer.toString('utf8');
  }

  return `[Pending extraction: ${fileName}]`;
}
