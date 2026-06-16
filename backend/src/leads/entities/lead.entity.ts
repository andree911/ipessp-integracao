import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type LeadStatus = 'novo' | 'contatado' | 'convertido' | 'perdido';
export type LeadOrigem = 'site' | 'chatbot' | 'whatsapp' | 'n8n' | 'manual';

@Entity('lead')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Index()
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  cursoInteresse: string;

  @Column({ default: 'site' })
  origem: LeadOrigem;

  @Column({ default: 'novo' })
  status: LeadStatus;

  @Column({ nullable: true, type: 'text' })
  observacao: string;

  @Column({ nullable: true })
  sophiaCodigo: string;

  @Column({ nullable: true, type: 'text' })
  sophiaErro: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
