// apps/api/src/infrastructure/publishing/publish-adapter.registry.ts

import { Injectable } from '@nestjs/common';
import type { PublishPlatform } from '@domain/types/enums.js';
import type {
  PublishAdapter,
  PublishAdapterRegistry,
} from '@domain/services/publish-adapter.port.js';
import { FacebookAdapter } from './adapters/facebook.adapter.js';
import { InstagramAdapter } from './adapters/instagram.adapter.js';
import { LinkedinAdapter } from './adapters/linkedin.adapter.js';
import { WhatsappAdapter } from './adapters/whatsapp.adapter.js';
import { XAdapter } from './adapters/x.adapter.js';

@Injectable()
export class PublishAdapterRegistryService implements PublishAdapterRegistry {
  private readonly adapters: Map<PublishPlatform, PublishAdapter>;

  constructor(
    facebook: FacebookAdapter,
    instagram: InstagramAdapter,
    whatsapp: WhatsappAdapter,
    linkedin: LinkedinAdapter,
    x: XAdapter,
  ) {
    const adapters: PublishAdapter[] = [
      facebook,
      instagram,
      whatsapp,
      linkedin,
      x,
    ];
    this.adapters = new Map(adapters.map((adapter) => [adapter.platform, adapter]));
  }

  getAdapter(platform: PublishPlatform): PublishAdapter | null {
    return this.adapters.get(platform) ?? null;
  }
}
