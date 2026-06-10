import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type SyncEntityType = 'cliente' | 'contrato' | 'titulo' | 'baixa';
export type SyncStatus = 'pending' | 'sent' | 'confirmed' | 'error';

@Entity('sync_log')
export class SyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar' })
  entityType: SyncEntityType;

  @Index()
  @Column({ type: 'varchar' })
  sophiaId: string;        // ID do registro no SophiA

  @Column({ type: 'varchar', nullable: true })
  integId: string;         // integ_id enviado ao Receiv

  @Column({ type: 'varchar', default: 'pending' })
  status: SyncStatus;

  @Column({ type: 'varchar', nullable: true })
  batchId: string;         // batch_id retornado pelo Receiv

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
