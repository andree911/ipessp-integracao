import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type EmailTipo = 'lembrete' | 'vencimento_hoje' | 'cobranca';

@Entity('email_log')
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar' })
  codigoLancamento: string;

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
