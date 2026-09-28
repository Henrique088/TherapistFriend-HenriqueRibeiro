// tests/utils/factories/RelatoFactory.ts
import { RelatoEntity, RelatoProps } from '../../../src/domain/entities/RelatoEntity';

export class RelatoFactory {
    static create(overrides: Partial<RelatoProps> = {}): RelatoEntity {
        const defaultProps: RelatoProps = {
            id: 1,
            paciente_id: 1,
            profissional_id: null,
            titulo: 'Relato de Teste Padrão',
            texto: 'Este é um texto de relato com mais de dez caracteres para passar na validação.',
            categoria: 'Geral',
            anonimo: true,
            status: 'pendente',
            ids_profissionais_recusados: [],
            resultado_ia: 'Sugestão da IA',
            data_envio: new Date(),
            ...overrides // Os valores passados aqui substituem os padrões
        };

        return new RelatoEntity(defaultProps);
    }
}