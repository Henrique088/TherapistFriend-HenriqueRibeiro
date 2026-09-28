// src/domain/repositories/IValidacaoRepository.ts

export interface IValidacaoRepository {

    salvarCodigo(usuarioId: number, codigo: string, tipo: 'SMS' | 'EMAIL', minutosValidade: number): Promise<void>;

    buscarCodigoValido(usuarioId: number, codigo: string, tipo: 'SMS' | 'EMAIL'): Promise<boolean>;
    
    invalidarCodigos(usuarioId: number, tipo: 'SMS' | 'EMAIL'): Promise<void>;
}