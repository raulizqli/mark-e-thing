// apps/api/src/infrastructure/publishing/publish-adapter.registry.ts

import { Injectable } from '@nestjs/common';
import type { PublishPlatform } from '@domain/types/enums';
import type {
  PublishAdapter,
  PublishAdapterRegistry,
} from '@domain/services/publish-adapter.port';
import { FacebookAdapter } from './adapters/facebook.adapter';
import { InstagramAdapter } from './adapters/instagram.adapter';
import { LinkedinAdapter } from './adapters/linkedin.adapter';
import { WhatsappAdapter } from './adapters/whatsapp.adapter';
import { XAdapter } from './adapters/x.adapter';

@Injectable()
export class PublishAdapterRegistryService implements PublishAdapterRegistry {
  private readonly adapters: Map<PublishPlatform, PublishAdapter>;

  constructor() {
    const list: PublishAdapter[] = [
      new FacebookAdapter(),
      new InstagramAdapter(),
      new WhatsappAdapter(),
      new LinkedinAdapter(),
      new XAdapter(),
    ];
    this.adapters = new Map(list.map((adapter) => [adapter.platform, adapter]));
  }

  getAdapter(platform: PublishPlatform): PublishAdapter | null {
    return this.adapters.get(platform) ?? null;
  }
}
