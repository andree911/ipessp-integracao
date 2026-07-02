import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matriculas_cache')
export class MatriculaCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  externalReference: string;

  // Aluno
  @Column({ nullable: true })
  nomeAluno: string;

  @Column({ nullable: true })
  cpfAluno: string;

  @Column({ nullable: true })
  emailAluno: string;

  @Column({ nullable: true })
  telefoneAluno: string;

  @Column({ nullable: true })
  sexoAluno: string;

  @Column({ nullable: true })
  dataNascimentoAluno: string;

  // Responsável financeiro (opcional)
  @Column({ nullable: true })
  nomeResponsavel: string;

  @Column({ nullable: true })
  cpfResponsavel: string;

  @Column({ nullable: true })
  emailResponsavel: string;

  @Column({ nullable: true })
  telefoneResponsavel: string;

  // Curso
  @Column({ nullable: true })
  unidade: string;

  @Column({ nullable: true })
  curso: string;

  @Column({ nullable: true })
  turno: string;

  @Column({ nullable: true })
  periodoLetivo: string;

  @Column({ nullable: true })
  curriculo: string;

  // Plano de pagamento
  @Column({ nullable: true })
  numeroParcelas: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorParcela: number;

  @Column({ nullable: true })
  dataPrimeiraParcela: string;

  @Column({ nullable: true })
  desconto: string;

  // Pagamento
  @Column({ nullable: true })
  linkPagamento: string;

  @Column({ nullable: true })
  preferenceId: string;

  // Preenchidos quando o webhook do MP processa o pagamento aprovado.
  // `notificadoEm` também serve de trava de idempotência — o MP pode reentregar
  // o mesmo webhook mais de uma vez, e sem essa trava o cliente seria duplicado no Sophia.
  @Column({ nullable: true, type: 'integer' })
  codigoClienteSophia: number | null;

  @Column({ nullable: true, type: 'timestamp' })
  notificadoEm: Date | null;

  @CreateDateColumn()
  criadoEm: Date;
}
