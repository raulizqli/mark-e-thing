// apps/api/src/infrastructure/storage/storage.factory.ts

import { hasS3Storage } from '../../config/env';
import type { StoragePort } from '@domain/services/storage.port';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

export function createStorageService(): StoragePort {
  return hasS3Storage ? new S3StorageService() : new LocalStorageService();
}
