import { Column, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('lancamentos_cache')
@Unique(['codigoSophia', 'codigoCliente'])
export class LancamentoCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  codigoSophia: number;

  @Index()
  @Column()
  codigoCliente: number;

  @Column({ nullable: true })
  descricao: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorPrevisto: number;

  @Column()
  dataVencimento: string;

  @Column({ default: 0 })
  recebido: number;

  @Column({ nullable: true })
  linhaDigitavel: string;

  @Column({ nullable: true })
  urlBoleto: string;

  @Column({ nullable: true })
  codigoPix: string;

  @Column({ nullable: true })
  competencia: string;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
