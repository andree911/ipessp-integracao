import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calendario')
export class CalendarioEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ name: 'data_evento', type: 'date' })
  dataEvento: string;

  @Column({ nullable: true })
  tipo: string;
}
