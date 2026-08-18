import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('candidatura')
export class Candidatura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  area: string;

  @Column({ type: 'text', nullable: true })
  mensagem: string;

  @Column({ nullable: true })
  curriculoUrl: string;

  @Column({ nullable: true })
  curriculoNome: string;

  @CreateDateColumn()
  criadoEm: Date;
}
