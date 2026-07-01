import { Column, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('responsavel_cache')
@Unique(['cpf', 'codigoAluno'])
export class ResponsavelCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  cpf: string;

  @Column()
  codigoAluno: number;

  @Column()
  nomeAluno: string;

  @Column()
  codigoResponsavel: number;

  @Column()
  nomeResponsavel: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
