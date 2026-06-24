import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('telefone_cpf_cache')
export class TelefoneCpfCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  telefone: string;

  @Column()
  cpf: string;

  @Column({ nullable: true })
  nomeResponsavel: string;

  @Column({ nullable: true })
  tipo: string; // 'aluno' | 'professor' | 'funcionario'

  @UpdateDateColumn()
  atualizadoEm: Date;
}
