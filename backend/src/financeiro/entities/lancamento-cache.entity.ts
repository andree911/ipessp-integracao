import { Column, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('lancamentos_cache')
@Unique(['codigoSophia', 'codigoCliente'])
export class LancamentoCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  codigoSophia: number | null;

  @Index()
  @Column()
  codigoCliente: number;

  @Column({ nullable: true })
  descricao: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  valorPrevisto: number;

  @Column()
  dataVencimento: string;

  @Column({
    type: 'int',
    default: 0,
    transformer: { to: (v: boolean) => (v ? 1 : 0), from: (v: number) => v === 1 },
  })
  recebido: boolean;

  @Column({ nullable: true })
  linhaDigitavel: string | null;

  @Column({ nullable: true })
  urlBoleto: string | null;

  @Column({ nullable: true })
  codigoPix: string | null;

  @Column({ nullable: true })
  competencia: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
