import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expira_em' })
  expiraEm: Date;
}
