import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('mensagem_contato')
export class MensagemContato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telefone: string;

  @Column({ nullable: true })
  assunto: string;

  @Column({ type: 'text' })
  mensagem: string;

  @CreateDateColumn()
  criadoEm: Date;
}
