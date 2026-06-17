import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column()
  tipo: string; // 'aluno' | 'professor'

  @Column()
  nome: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'sophia_aluno_id', nullable: true, type: 'integer' })
  sophiaAlunoId: number | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
