// src/infrastructure/factories/EntidadeRelacionadaFactory.ts

import { IEntidadeRelacionadaFactory } from '../../application/factories/IEntidadeRelacionadaFactory';
import { UsuarioEntity } from '../../domain/entities/UsuarioEntity';
import { CriarPacienteUseCase } from '../../application/use-cases/paciente/CriarPacienteUseCase';
import { CriarProfissionalUseCase } from '../../application/use-cases/profissional/CriarProfissionalUseCase';



export class EntidadeRelacionadaFactory implements IEntidadeRelacionadaFactory {
    constructor(
        private pacienteUseCase: CriarPacienteUseCase, 
        private profissionalUseCase: CriarProfissionalUseCase
    ) { }

    async criarDetalhes(usuarioEntity: UsuarioEntity, transaction?: any) {
        
        const idUsuario = usuarioEntity.id as number;

        if (usuarioEntity.tipo_usuario === 'paciente') {
            
            return this.pacienteUseCase.execute({ idUsuario }, transaction);
        }
        
        if (usuarioEntity.tipo_usuario === 'profissional') {
            
             return this.profissionalUseCase.execute({ idUsuario }, transaction);
        }
        
        return null;
    }
}