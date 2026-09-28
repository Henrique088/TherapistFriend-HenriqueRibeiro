import { Transaction } from 'sequelize';
import { ConversaEntity } from '../entities/ConversaEntity';

export interface IConversaRepository {
    
    criar(dados: { 
        relato_id_origem: number; 
        paciente_id: number; 
        profissional_id: number; 
        status: string 
    }, transaction?: Transaction): Promise<ConversaEntity>;
    
    buscarAtivaEntre(pacienteId: number, profissionalId: number): Promise<ConversaEntity | null>;

    buscarPorId(id: number): Promise<ConversaEntity | null>;

    buscarConversas(id: number): Promise<ConversaEntity[] | null>;
}