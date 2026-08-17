import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Sem tabela de "conta" própria: a senha validada é sempre a real da Sophia
// (via ValidarLogin), então a sessão guarda direto os dados necessários pra
// reemitir o JWT no refresh, sem precisar de um FK pra outra tabela local.
@Entity('portal_aluno_refresh_token')
export class PortalAlunoRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ra: string;

  @Column({ name: 'codigo_sophia', type: 'integer' })
  codigoSophia: number;

  @Column()
  nome: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expira_em', type: 'timestamptz' })
  expiraEm: Date;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
