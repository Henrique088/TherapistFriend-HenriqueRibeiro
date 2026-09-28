// src/infrastructure/database/repositories/ValidacaoRepository.ts

import { ValidacaoCodigoModel } from '../models/validacao-codigo.model';
import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { Op } from 'sequelize';



export class ValidacaoRepository implements IValidacaoRepository {
    
    async salvarCodigo(usuarioId: number, codigo: string, tipo: 'SMS' | 'EMAIL', minutosValidade: number): Promise<void> {
        // Invalida códigos anteriores para evitar duplicidade
        await this.invalidarCodigos(usuarioId, tipo);

        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + minutosValidade);

        await ValidacaoCodigoModel.create({
            usuarioId,
            codigo,
            tipo,
            expiraEm
        });
    }

    async buscarCodigoValido(usuarioId: number, codigo: string, tipo: 'SMS' | 'EMAIL'): Promise<boolean> {
        const registro = await ValidacaoCodigoModel.findOne({
            where: {
                usuarioId,
                codigo,
                tipo,
                expiraEm: { [Op.gt]: new Date() } // Deve ser maior que agora
            }
        });

        return !!registro; // Retorna true se encontrar
    }

    async invalidarCodigos(usuarioId: number, tipo: 'SMS' | 'EMAIL'): Promise<void> {
        await ValidacaoCodigoModel.destroy({
            where: { usuarioId, tipo }
        });
    }
}