// apps/api/src/infrastructure/storage/local-storage.service.ts

import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { StoragePort, StoredObject } from '@domain/services/storage.port.js';

const UPLOAD_ROOT = '/workspace/.tmp/uploads';

@Injectable()
export class LocalStorageService implements StoragePort {
  private resolvePath(key: string): string {
    return join(UPLOAD_ROOT, key);
  }

  async upload(key: string, data: Buffer, _mimeType: string): Promise<StoredObject> {
    const filePath = this.resolvePath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return { key, url: this.getPublicUrl(key) };
  }

  getPublicUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await unlink(filePath);
    } catch {
      // ignore missing files during MVP cleanup
    }
  }
}
