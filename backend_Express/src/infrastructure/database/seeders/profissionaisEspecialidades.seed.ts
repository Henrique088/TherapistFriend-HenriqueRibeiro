// src/infrastructure/database/seeders/profissionaisEspecialidades.seed.ts

import 'dotenv/config';
import db from '../index';

async function seedProfissionaisEspecialidades() {
    try {
        console.log('🌱 Vinculando profissionais às especialidades...');

        // Busca profissionais
        const profissionais = await db.Profissional.findAll({
            include: [
                {
                    model: db.Usuario,
                    as: 'usuario',
                    attributes: ['nome']
                }
            ],
            order: [['id', 'ASC']]
        });

        // Busca especialidades
        const especialidades = await db.Especialidade.findAll();

        // Mapa nome -> id
        const mapaEspecialidades = new Map<string, number>();

        especialidades.forEach((e: any) => {
            mapaEspecialidades.set(e.nome, e.id);
        });

        const relacoes: any[] = [];

        const adicionar = (indiceProfissional: number, nomesEspecialidades: string[]) => {
            const profissional = profissionais[indiceProfissional];

            if (!profissional) return;

            nomesEspecialidades.forEach(nome => {
                const especialidadeId = mapaEspecialidades.get(nome);

                if (!especialidadeId) {
                    console.warn(`Especialidade não encontrada: ${nome}`);
                    return;
                }

                relacoes.push({
                    profissional_id: profissional.id,
                    especialidade_id: especialidadeId
                });
            });
        };

        adicionar(0, [
            'Psicologia Clínica',
            'Terapia Cognitivo-Comportamental (TCC)',
            'Ansiedade',
            'Autoestima'
        ]);

        adicionar(1, [
            'Terapia de Casais',
            'Terapia Familiar',
            'Relacionamentos',
            'Orientação Parental'
        ]);

        adicionar(2, [
            'Psicologia Infantil',
            'Psicologia do Adolescente',
            'Transtorno do Espectro Autista (TEA)',
            'Transtorno de Déficit de Atenção e Hiperatividade (TDAH)'
        ]);

        adicionar(3, [
            'Depressão',
            'Luto',
            'Transtorno Bipolar',
            'Psicologia Clínica'
        ]);

        adicionar(4, [
            'Psicologia Organizacional',
            'Burnout',
            'Estresse',
            'Mindfulness'
        ]);

        adicionar(5, [
            'Psicanálise',
            'Desenvolvimento Pessoal',
            'Autoestima',
            'Psicologia Humanista'
        ]);

        adicionar(6, [
            'Neuropsicologia',
            'Psicopedagogia',
            'Transtorno do Espectro Autista (TEA)',
            'Transtorno de Déficit de Atenção e Hiperatividade (TDAH)'
        ]);

        adicionar(7, [
            'Dependência Química',
            'Transtornos Alimentares',
            'Ansiedade',
            'Depressão'
        ]);

        adicionar(8, [
            'Psiquiatria',
            'Ansiedade',
            'Transtorno Obsessivo-Compulsivo (TOC)',
            'Transtorno Bipolar'
        ]);

        adicionar(9, [
            'Psicologia Humanista',
            'Gestalt-terapia',
            'Relacionamentos',
            'Desenvolvimento Pessoal'
        ]);

        await db.ProfissionalEspecialidade.bulkCreate(relacoes, {
            ignoreDuplicates: true
        });

        console.log(`✅ ${relacoes.length} vínculos cadastrados com sucesso!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao rodar seed:', error);
        process.exit(1);
    }
}

seedProfissionaisEspecialidades();