import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('clientes_cache')
export class ClienteCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  codigoSophia: number;

  @Index()
  @Column({ nullable: true })
  cpf: string;

  @Column()
  nomeAluno: string;

  @Column({ nullable: true })
  nomeResponsavel: string;

  @Column({ nullable: true })
  emailResponsavel: string;

  @Column({ nullable: true })
  telefoneResponsavel: string;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
