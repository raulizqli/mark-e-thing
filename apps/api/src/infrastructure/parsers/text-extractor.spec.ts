// apps/api/src/infrastructure/parsers/text-extractor.spec.ts

import { describe, expect, it } from 'vitest';
import { extractText } from './text-extractor';

describe('extractText', () => {
  it('extracts plain text files', async () => {
    const text = await extractText(
      Buffer.from('Hola marca MarkeThing'),
      'text/plain',
      'brand.txt',
    );
    expect(text).toBe('Hola marca MarkeThing');
  });

  it('returns pending marker for unsupported formats', async () => {
    const text = await extractText(
      Buffer.from('fake'),
      'application/msword',
      'notes.doc',
    );
    expect(text).toBe('[Pending extraction: notes.doc]');
  });

  it('extracts text from a minimal PDF', async () => {
    // Minimal valid PDF with a single text stream ("Hello PDF")
    const pdf = `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 44 >>stream
BT /F1 24 Tf 100 100 Td (Hello PDF) Tj ET
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000361 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
441
%%EOF`;

    const text = await extractText(Buffer.from(pdf), 'application/pdf', 'hello.pdf');
    expect(text.toLowerCase()).toContain('hello pdf');
  });
});
