import { Column, Entity, PrimaryColumn } from 'typeorm';

// Linha única (id fixo = 1) que guarda o índice da próxima consultora a
// receber um lead. Travada via pessimistic_write em LeadsService para
// serializar o rodízio quando dois leads chegam ao mesmo tempo.
@Entity('lead_distribuicao_consultoras')
export class LeadDistribuicaoConsultoras {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ default: 0 })
  proximoIndice: number;
}
