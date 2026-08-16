// apps/api/scripts/smoke-usage.ts
// Smoke test for Phase 1 USAGE flow against a running API.

const API_URL = process.env.API_URL ?? process.env.SMOKE_API_URL ?? 'http://localhost:3001';

type Envelope<T> = { success?: boolean; data?: T; message?: string; error?: { message?: string } };

async function request<T>(method: string, path: string, body?: unknown, isForm = false): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : isForm ? (body as BodyInit) : JSON.stringify(body),
  });

  const json = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok) {
    const message = json.error?.message ?? json.message ?? `HTTP ${response.status} ${path}`;
    throw new Error(message);
  }
  return (json.data ?? json) as T;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  console.log(`Smoke USAGE → ${API_URL}`);

  const health = await request<{ status?: string }>('GET', '/health');
  assert(health, 'health missing');
  console.log('✓ health');

  const company = await request<{ id: string; name: string }>('POST', '/companies', {
    name: `Smoke Co ${Date.now()}`,
    industry: 'SaaS',
    toneOfVoice: 'claro y cercano',
    preferredCtas: ['Empieza hoy'],
  });
  assert(company.id, 'company id missing');
  console.log(`✓ company ${company.id}`);

  const me = await request<{ id: string; usage?: { content: { quota: number } } }>('GET', '/me');
  assert(me.id, 'me missing');
  console.log('✓ me + quotas');

  const form = new FormData();
  form.append('title', 'Brand FAQ');
  form.append('type', 'FAQ');
  form.append(
    'file',
    new Blob(['MarkeThing ayuda a generar contenido de marketing con IA.'], {
      type: 'text/plain',
    }),
    'brand.txt',
  );

  const knowledge = await request<{ id: string; extractedText?: string | null }>(
    'POST',
    `/companies/${company.id}/knowledge`,
    form,
    true,
  );
  assert(knowledge.id, 'knowledge id missing');
  assert(
    knowledge.extractedText && knowledge.extractedText.includes('MarkeThing'),
    'TXT extraction failed',
  );
  console.log('✓ knowledge upload + TXT extract');

  const content = await request<{ id: string; title: string; copy: string }>(
    'POST',
    `/companies/${company.id}/content/generate`,
    { type: 'INSTAGRAM_POST', topic: 'lanzamiento smoke test' },
  );
  assert(content.id && content.title, 'content generate failed');
  console.log(`✓ generate content ${content.id}`);

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + 1);
  scheduledAt.setMinutes(0, 0, 0);

  const entry = await request<{ id: string; contentId: string }>(
    'POST',
    `/companies/${company.id}/calendar`,
    { contentId: content.id, scheduledAt: scheduledAt.toISOString() },
  );
  assert(entry.id, 'calendar schedule failed');
  console.log(`✓ schedule ${entry.id}`);

  const month = `${scheduledAt.getUTCFullYear()}-${String(scheduledAt.getUTCMonth() + 1).padStart(2, '0')}`;
  const entries = await request<Array<{ id: string }>>(
    'GET',
    `/companies/${company.id}/calendar?month=${month}`,
  );
  assert(entries.some((item) => item.id === entry.id), 'scheduled entry not listed');
  console.log('✓ calendar list');

  await request('DELETE', `/companies/${company.id}/calendar/${entry.id}`);
  console.log('✓ calendar delete');

  await request('DELETE', `/companies/${company.id}/knowledge/${knowledge.id}`);
  console.log('✓ knowledge delete');

  await request('DELETE', `/companies/${company.id}`);
  console.log('✓ company cleanup');

  console.log('Smoke USAGE passed');
}

main().catch((error: unknown) => {
  console.error('Smoke USAGE failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
