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

  // Consentimento explícito para mensagens de WhatsApp marketing (nurturing) —
  // exigido pela Meta para templates categoria Marketing na Cloud API
  @Column({ default: false })
  whatsappOptin: boolean;

  @Column({ default: 'site' })
  origem: LeadOrigem;

  @Column({ default: 'novo' })
  status: LeadStatus;

  @Column({ nullable: true, type: 'text' })
  observacao: string;

  // Telefone (de ZAPI_TELEFONES_CONSULTORAS_MARKETING) da consultora escolhida
  // em rodízio para atender este lead — usado pela aba de leads do corporativo
  // pra saber de quem é o lead, já que a tabela é compartilhada
  @Column({ nullable: true, type: 'varchar' })
  consultoraResponsavel: string | null;

  // Quando a consultoraResponsavel atual foi definida (atribuição inicial ou
  // reatribuição) — usado pelo timeout automático pra saber há quanto tempo
  // o lead está parado sem sair do status "novo"
  @Column({ nullable: true, type: 'timestamptz' })
  atribuidoEm: Date | null;

  // Vinculação ao aluno no SophiA após conversão lead → matrícula (ID externo, sem FK)
  @Index()
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
