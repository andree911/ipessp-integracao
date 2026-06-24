import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('chamados')
export class Chamado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({ default: 'Outro' })
  categoria: string;

  @Column({ default: 'media' })
  prioridade: string;

  @Column({ default: 'aberto' })
  status: string;

  @Column({ name: 'criado_por_email' })
  criadoPorEmail: string;

  @Column({ name: 'criado_por_nome', type: 'text', nullable: true })
  criadoPorNome: string | null;

  @Column({ type: 'text', nullable: true })
  setor: string | null;

  @Column({ name: 'atribuido_para_email', type: 'text', nullable: true })
  atribuidoParaEmail: string | null;

  @Column({ name: 'atribuido_para_nome', type: 'text', nullable: true })
  atribuidoParaNome: string | null;

  @Column({ type: 'text', nullable: true })
  resolucao: string | null;

  @Column({ name: 'telefone_solicitante', type: 'text', nullable: true })
  telefoneSolicitante: string | null;

  @Column({ name: 'resolvido_em', type: 'timestamptz', nullable: true })
  resolvidoEm: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
