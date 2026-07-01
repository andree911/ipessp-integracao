import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('clientes_cache')
export class ClienteCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'integer' })
  codigoSophia: number | null;

  @Index()
  @Column({ nullable: true })
  cpf: string | null;

  @Column()
  nomeAluno: string;

  @Column({ nullable: true })
  nomeResponsavel: string | null;

  @Column({ nullable: true })
  emailResponsavel: string | null;

  @Column({ nullable: true })
  telefoneResponsavel: string | null;

  @Column({ nullable: true })
  ra: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
