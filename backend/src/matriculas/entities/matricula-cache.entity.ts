import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matriculas_cache')
export class MatriculaCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  externalReference: string;

  @Column()
  codigoAluno: number;

  @Column({ nullable: true })
  nomeAluno: string;

  @Column({ nullable: true })
  emailAluno: string;

  @Column({ nullable: true })
  telefoneAluno: string;

  @Column({ nullable: true })
  nomeResponsavel: string;

  @Column({ nullable: true })
  emailResponsavel: string;

  @Column({ nullable: true })
  telefoneResponsavel: string;

  @Column()
  curso: string;

  @Column({ nullable: true })
  unidade: string;

  @Column()
  numeroParcelas: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorParcela: number;

  @Column({ nullable: true })
  linkPagamento: string;

  @CreateDateColumn()
  criadoEm: Date;
}
