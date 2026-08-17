import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Nota: a coluna `url_pagina` mencionada no código antigo (LeadEmailService)
// nunca chegou a ser criada de fato no banco (só existia um script manual
// pra rodar no SQL Editor do Supabase, nunca executado) — não incluída aqui
// de propósito, pra não fingir uma coluna que não existe.
@Entity('curso_conteudo')
export class CursoConteudo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_curso', unique: true })
  codigoCurso: number;

  @Column({ nullable: true })
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  duracao: string;

  @Column({
    name: 'preco_mensalidade',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precoMensalidade: string;

  @Column({ name: 'pdf_informativo_url', nullable: true })
  pdfInformativoUrl: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
