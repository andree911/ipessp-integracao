import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('clientes_cache')
export class ClienteCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'integer' })
  codigoSophia: number | null;

  @Index()
  @Column({ nullable: true, type: 'varchar' })
  cpf: string | null;

  @Column()
  nomeAluno: string;

  @Column({ nullable: true, type: 'varchar' })
  nomeResponsavel: string | null;

  @Column({ nullable: true, type: 'varchar' })
  emailResponsavel: string | null;

  @Column({ nullable: true, type: 'varchar' })
  telefoneResponsavel: string | null;

  @Column({ nullable: true, type: 'varchar' })
  ra: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
