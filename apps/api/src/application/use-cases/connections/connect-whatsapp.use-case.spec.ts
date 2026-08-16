// apps/api/src/application/use-cases/connections/connect-whatsapp.use-case.spec.ts

import { describe, expect, it, vi } from 'vitest';
import { ConnectWhatsAppUseCase } from './connect-whatsapp.use-case';

describe('ConnectWhatsAppUseCase', () => {
  it('stores sanitized recipient in metadata', async () => {
    const companies = {
      findByIdForUser: vi.fn().mockResolvedValue({ id: 'co1' }),
    };
    const publish = {
      upsertConnection: vi.fn().mockResolvedValue({ id: 'conn1' }),
    };

    const useCase = new ConnectWhatsAppUseCase(companies as never, publish as never);
    await useCase.execute('u1', {
      companyId: 'co1',
      accessToken: 'token',
      phoneNumberId: 'pnid',
      defaultRecipient: '+52 155 1234 5678',
    });

    expect(publish.upsertConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        platform: 'WHATSAPP',
        metadata: expect.objectContaining({ defaultRecipient: '5215512345678' }),
      }),
    );
  });
});
