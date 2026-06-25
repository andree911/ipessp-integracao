import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type LeadStatus = 'novo' | 'contatado' | 'agendado' | 'inscrito' | 'matriculado' | 'perdido';
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

  @Index()
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

  // Vinculação ao aluno no SophiA após conversão lead → matrícula
  @Column({ nullable: true, type: 'integer' })
  sophiaAlunoId: number | null;

  // Nurturing
  @Column({ default: 0 })
  etapaNurturing: number;

  @Column({ nullable: true, type: 'timestamptz' })
  proximoContato: Date | null;

  @Column({ default: false })
  nurturingPausado: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  ultimaInteracaoBot: Date | null;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
