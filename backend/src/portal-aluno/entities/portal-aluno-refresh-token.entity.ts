import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('portal_aluno_refresh_token')
export class PortalAlunoRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'conta_id', type: 'uuid' })
  contaId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expira_em', type: 'timestamptz' })
  expiraEm: Date;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
