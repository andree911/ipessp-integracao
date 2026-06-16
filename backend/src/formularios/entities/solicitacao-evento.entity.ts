import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('solicitacao_evento')
export class SolicitacaoEvento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  organizacao: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ nullable: true })
  dataEvento: string;

  @CreateDateColumn()
  criadoEm: Date;
}
