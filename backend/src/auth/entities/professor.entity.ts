import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('professores')
export class Professor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'text', nullable: true })
  matricula: string | null;

  @Column({ type: 'text', nullable: true })
  telefone: string | null;

  @Column({ default: false })
  validado: boolean;

  @Column({ name: 'sophia_id', nullable: true, type: 'integer' })
  sophiaId: number | null;
}
