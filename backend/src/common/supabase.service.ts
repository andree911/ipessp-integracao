import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('supabase.url');
    const key = this.config.get<string>('supabase.key');

    if (url && key) {
      this.client = createClient(url, key);
      this.logger.log('Supabase conectado');
    } else {
      this.logger.warn('SUPABASE_URL/SUPABASE_SERVICE_KEY não configurados — /avisos e /calendario retornarão []');
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }
}
