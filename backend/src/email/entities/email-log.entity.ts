import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type EmailTipo =
  | 'lembrete'
  | 'vencimento_hoje'
  | 'cobranca'
  | 'lead_boas_vindas'
  | 'lead_followup'
  | 'lead_cta'
  | 'wpp_lembrete'
  | 'wpp_vencimento_hoje'
  | 'wpp_cobranca';

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
