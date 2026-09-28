// tests/unit/mocks/UsuarioEntityMock.ts

// Interface básica para o mock, alinhada com a Entidade de domínio
interface IUsuario {
    id?: number;
    nome: string;
    email: string;
    senha_hash?: string;
    ativo: boolean;
    tipo_usuario?: 'paciente' | 'profissional' | 'admin';
    [key: string]: any; 
}

/**
 * Mock para a Entidade de Usuário, tipado para uso em testes TypeScript.
 * Resolve o erro 'Property is used before being assigned' inicializando campos.
 */
class UsuarioEntityMock implements IUsuario {
    // Inicialização na declaração para satisfazer o TS2565
    public id?: number;
    public nome: string = 'DEFAULT_NAME';      // Valor padrão
    public email: string = 'default@test.com'; // Valor padrão
    public senha_hash?: string;
    public ativo: boolean = true;              // Valor padrão
    public tipo_usuario?: 'paciente' | 'profissional' | 'admin';

    [key: string]: any; 

    constructor(data: Partial<IUsuario>) {
        
        // 1. Atribui todos os dados fornecidos no mock.
        // Isso sobrescreve os valores padrão definidos acima (DEFAULT_NAME, default@test.com, true)
        // se 'data' tiver esses campos.
        Object.assign(this, data);
        
        // 2. Lógica de Coalescência (Opcional, mas robusta): Garante que, se os campos
        // essenciais (que não são opcionais na interface) forem passados como 'null' ou 
        // 'undefined' no mock, eles recebam um valor de fallback.
        this.ativo = this.ativo ?? true;
        this.nome = this.nome ?? 'Mock User';
        this.email = this.email ?? 'mock@test.com';
        
        // Se a Entidade real for mais complexa, você pode precisar fazer mais verificações aqui.
    }

    /**
     * Simula a lógica de negócio para desativar o usuário.
     */
    public marcarInativo(): void {
        this.ativo = false;
    }

    /**
     * Simula o método de conversão para DTO, omitindo campos sensíveis.
     */
    public toJSON() {
        // Omite senha_hash e quaisquer outros campos sensíveis
        const { senha_hash, ...rest } = this;
        return rest;
    }
}

export default UsuarioEntityMock;