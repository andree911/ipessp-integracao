import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type EmailTipo =
  // ── Email — genérico (mantido para logs antigos e previews) ──────────────────
  | 'lembrete'
  | 'vencimento_hoje'
  | 'cobranca'
  // ── Email — por dia específico ────────────────────────────────────────────────
  | 'lembrete_7' | 'lembrete_5' | 'lembrete_3' | 'lembrete_1'
  | 'cobranca_1'  | 'cobranca_2'  | 'cobranca_3'  | 'cobranca_7'
  | 'cobranca_8'  | 'cobranca_9'  | 'cobranca_10' | 'cobranca_12'
  | 'cobranca_15' | 'cobranca_20' | 'cobranca_25' | 'cobranca_30'
  // ── Leads ────────────────────────────────────────────────────────────────────
  | 'lead_boas_vindas'
  | 'lead_followup'
  | 'lead_cta'
  // ── WhatsApp — genérico (mantido para logs antigos) ───────────────────────────
  | 'wpp_lembrete'
  | 'wpp_vencimento_hoje'
  | 'wpp_cobranca'
  // ── WhatsApp — por dia específico ─────────────────────────────────────────────
  | 'wpp_antes_7' | 'wpp_antes_5' | 'wpp_antes_3' | 'wpp_antes_1'
  | 'wpp_apos_1'  | 'wpp_apos_2'  | 'wpp_apos_3'  | 'wpp_apos_7'
  | 'wpp_apos_8'  | 'wpp_apos_9'  | 'wpp_apos_10' | 'wpp_apos_12'
  | 'wpp_apos_15' | 'wpp_apos_20';

@Entity('email_log')
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', default: '' })
  codigoLancamento: string;

  @Index()
  @Column({ type: 'integer', nullable: true })
  leadId: number | null;

  @Column({ type: 'varchar' })
  tipo: EmailTipo;

  @Column({ type: 'varchar' })
  destinatario: string;

  @Column({ type: 'varchar', nullable: true })
  erro: string;

  @Column({ type: 'boolean', default: false })
  enviado: boolean;

  @CreateDateColumn()
  enviadoEm: Date;
}
