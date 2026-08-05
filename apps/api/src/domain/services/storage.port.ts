// apps/api/src/domain/services/storage.port.ts

export interface StoredObject {
  key: string;
  url: string;
}

export interface StoragePort {
  upload(
    key: string,
    data: Buffer,
    mimeType: string,
  ): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
