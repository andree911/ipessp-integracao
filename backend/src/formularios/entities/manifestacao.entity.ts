import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export type ManifestacaoTipo = 'reclamacao' | 'sugestao' | 'elogio' | 'outro';

@Entity('manifestacao')
export class Manifestacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: ManifestacaoTipo;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  mensagem: string;

  @CreateDateColumn()
  criadoEm: Date;
}
