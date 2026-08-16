// apps/api/src/application/use-cases/connections/connect-whatsapp.use-case.ts

import type { CompanyRepository } from '../../../domain/repositories/company.repository';
import type { PublishRepository } from '../../../domain/repositories/publish.repository';
import type { SocialConnection } from '../../../domain/entities/publish.entity';
import { AppError } from '../../../shared/errors/app-error';

export interface ConnectWhatsAppInput {
  companyId: string;
  accessToken: string;
  phoneNumberId: string;
  displayName?: string;
  defaultRecipient: string;
}

export class ConnectWhatsAppUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly publishRepository: PublishRepository,
  ) {}

  async execute(userId: string, input: ConnectWhatsAppInput): Promise<SocialConnection> {
    const company = await this.companyRepository.findByIdForUser(input.companyId, userId);
    if (!company) {
      throw AppError.notFound('Company', input.companyId);
    }

    const recipient = input.defaultRecipient.replace(/[^\d]/g, '');
    if (recipient.length < 8) {
      throw new AppError(
        400,
        'WHATSAPP_RECIPIENT_INVALID',
        'defaultRecipient must be an E.164 phone number (digits only, with country code)',
      );
    }

    if (!input.accessToken.trim() || !input.phoneNumberId.trim()) {
      throw new AppError(
        400,
        'WHATSAPP_CREDENTIALS_REQUIRED',
        'accessToken and phoneNumberId are required',
      );
    }

    return this.publishRepository.upsertConnection({
      companyId: input.companyId,
      platform: 'WHATSAPP',
      accessToken: input.accessToken.trim(),
      externalId: input.phoneNumberId.trim(),
      displayName: input.displayName?.trim() || `WhatsApp ${input.phoneNumberId.trim()}`,
      connectedAt: new Date(),
      metadata: {
        defaultRecipient: recipient,
        mode: 'cloud_api_message',
      },
    });
  }
}
