import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clientes_cache')
export class ClienteCache {
  @PrimaryGeneratedColumn()
  id: number;

  // Índice único parcial "clientes_cache_codigoSophia_unique" aplicado
  // manualmente no banco (synchronize: false) -- evita duplicata de
  // clientes_cache."codigoSophia" numa corrida (TOCTOU) do find-then-save
  // de FinanceiroService#upsertCliente.
  @Index({ unique: true, where: '"codigoSophia" IS NOT NULL' })
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

  @Index()
  @Column({ nullable: true, type: 'varchar' })
  ra: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
