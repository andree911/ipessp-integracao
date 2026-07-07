import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('portal_aluno_reset_token')
export class PortalAlunoResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'conta_id', type: 'uuid' })
  contaId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expira_em', type: 'timestamptz' })
  expiraEm: Date;

  @Column({ name: 'usado_em', type: 'timestamptz', nullable: true })
  usadoEm: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
