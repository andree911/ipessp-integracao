import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lead_historico')
export class LeadHistorico {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  leadId: number;

  @Column({ type: 'varchar', nullable: true })
  estagioAnterior: string | null;

  @Column()
  estagioNovo: string;

  @Column({ nullable: true, type: 'text' })
  observacao: string | null;

  @CreateDateColumn()
  criadoEm: Date;
}
