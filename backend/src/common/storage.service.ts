import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';

@Injectable()
export class StorageService {
  private readonly client: MinioClient;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.client = new MinioClient({
      endPoint: config.get<string>('minio.endpoint')!,
      port: config.get<number>('minio.port'),
      useSSL: config.get<boolean>('minio.useSsl'),
      accessKey: config.get<string>('minio.accessKey')!,
      secretKey: config.get<string>('minio.secretKey')!,
    });
    this.publicBaseUrl = config.get<string>('minio.publicBaseUrl') ?? '';
  }

  async upload(
    bucket: string,
    path: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    await this.client.putObject(bucket, path, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return `${this.publicBaseUrl}/${bucket}/${path}`;
  }
}
