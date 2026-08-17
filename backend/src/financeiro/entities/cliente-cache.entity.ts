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

  // Unicidade não é reforçada só pelo TypeORM (synchronize: false) -- ver
  // documentacao/sql/clientes_cache_add_unique_codigo_sophia.sql pra aplicar
  // a constraint de fato no banco.
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
