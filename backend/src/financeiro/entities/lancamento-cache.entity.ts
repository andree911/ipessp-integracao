import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lancamentos_cache')
@Unique(['codigoSophia', 'codigoCliente'])
export class LancamentoCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'integer' })
  codigoSophia: number | null;

  @Index()
  @Column()
  codigoCliente: number;

  @Column({ nullable: true, type: 'varchar' })
  descricao: string | null;

  // TypeORM devolve colunas `decimal` como string por padrão -- o transformer
  // garante que o valor chega como number em todo lugar que lê essa entidade,
  // sem depender de cada chamador lembrar de fazer `Number(...)`.
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string | number) => Number(v),
    },
  })
  valorPrevisto: number;

  @Column()
  dataVencimento: string;

  @Column({
    type: 'int',
    default: 0,
    transformer: {
      to: (v: boolean) => (v ? 1 : 0),
      from: (v: number) => v === 1,
    },
  })
  recebido: boolean;

  @Column({ nullable: true, type: 'varchar' })
  linhaDigitavel: string | null;

  @Column({ nullable: true, type: 'varchar' })
  urlBoleto: string | null;

  @Column({ nullable: true, type: 'varchar' })
  codigoPix: string | null;

  @Column({ nullable: true, type: 'integer' })
  codigoBoleto: number | null;

  @Column({ nullable: true, type: 'varchar' })
  competencia: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
