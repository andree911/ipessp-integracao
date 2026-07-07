import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('portal_aluno_conta')
export class PortalAlunoConta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  ra: string;

  @Column({ name: 'codigo_sophia', type: 'integer' })
  codigoSophia: number;

  @Column()
  nome: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
