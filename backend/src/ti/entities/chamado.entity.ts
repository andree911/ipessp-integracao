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

  @Column({ name: 'criado_por_nome', nullable: true })
  criadoPorNome: string;

  @Column({ nullable: true })
  setor: string;

  @Column({ name: 'atribuido_para_email', nullable: true })
  atribuidoParaEmail: string;

  @Column({ name: 'atribuido_para_nome', nullable: true })
  atribuidoParaNome: string;

  @Column({ nullable: true })
  resolucao: string;

  @Column({ name: 'telefone_solicitante', nullable: true })
  telefoneSolicitante: string;

  @Column({ name: 'resolvido_em', type: 'timestamptz', nullable: true })
  resolvidoEm: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
