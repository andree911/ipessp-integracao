import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column()
  token: string;

  @Column({ name: 'expira_em' })
  expiraEm: Date;

  @Column({ default: false })
  usado: boolean;
}
