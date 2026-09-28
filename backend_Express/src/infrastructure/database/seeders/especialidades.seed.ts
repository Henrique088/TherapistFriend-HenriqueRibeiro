// src/infrastructure/database/seeders/especialidades.seed.ts

import 'dotenv/config';
import db from '../index';

async function seedEspecialidades() {
    const lista = [
    {
        nome: 'Psicologia Clínica',
        descricao: 'Atendimento psicoterapêutico individual.'
    },
    {
        nome: 'Terapia Cognitivo-Comportamental (TCC)',
        descricao: 'Tratamento focado na relação entre pensamentos, emoções e comportamentos.'
    },
    {
        nome: 'Psicanálise',
        descricao: 'Abordagem baseada na investigação do inconsciente.'
    },
    {
        nome: 'Psicologia Humanista',
        descricao: 'Foco no desenvolvimento pessoal e no potencial humano.'
    },
    {
        nome: 'Gestalt-terapia',
        descricao: 'Trabalha a consciência do presente e o autoconhecimento.'
    },
    {
        nome: 'Terapia Sistêmica',
        descricao: 'Abordagem voltada para relações familiares e interpessoais.'
    },
    {
        nome: 'Psicopedagogia',
        descricao: 'Avaliação e intervenção em dificuldades de aprendizagem.'
    },
    {
        nome: 'Neuropsicologia',
        descricao: 'Avaliação das funções cognitivas e comportamentais.'
    },
    {
        nome: 'Psiquiatria',
        descricao: 'Diagnóstico e tratamento médico dos transtornos mentais.'
    },
    {
        nome: 'Psiquiatria Infantil',
        descricao: 'Saúde mental de crianças e adolescentes.'
    },
    {
        nome: 'Psicologia Infantil',
        descricao: 'Atendimento psicológico voltado para crianças.'
    },
    {
        nome: 'Psicologia do Adolescente',
        descricao: 'Acompanhamento psicológico durante a adolescência.'
    },
    {
        nome: 'Psicologia do Adulto',
        descricao: 'Atendimento psicológico para adultos.'
    },
    {
        nome: 'Psicologia do Idoso',
        descricao: 'Promoção da saúde mental na terceira idade.'
    },
    {
        nome: 'Terapia de Casais',
        descricao: 'Mediação e fortalecimento dos relacionamentos afetivos.'
    },
    {
        nome: 'Terapia Familiar',
        descricao: 'Intervenção em conflitos e dinâmicas familiares.'
    },
    {
        nome: 'Orientação Parental',
        descricao: 'Apoio aos pais na educação e desenvolvimento dos filhos.'
    },
    {
        nome: 'Dependência Química',
        descricao: 'Tratamento para dependência de álcool e outras drogas.'
    },
    {
        nome: 'Ansiedade',
        descricao: 'Tratamento especializado para transtornos de ansiedade.'
    },
    {
        nome: 'Depressão',
        descricao: 'Acompanhamento psicológico e psiquiátrico para depressão.'
    },
    {
        nome: 'Transtorno Bipolar',
        descricao: 'Tratamento especializado para transtorno afetivo bipolar.'
    },
    {
        nome: 'Transtornos Alimentares',
        descricao: 'Atendimento para anorexia, bulimia e compulsão alimentar.'
    },
    {
        nome: 'Transtorno Obsessivo-Compulsivo (TOC)',
        descricao: 'Tratamento para pensamentos obsessivos e compulsões.'
    },
    {
        nome: 'Transtorno do Espectro Autista (TEA)',
        descricao: 'Acompanhamento especializado para pessoas com TEA.'
    },
    {
        nome: 'Transtorno de Déficit de Atenção e Hiperatividade (TDAH)',
        descricao: 'Avaliação e acompanhamento de crianças, adolescentes e adultos.'
    },
    {
        nome: 'Burnout',
        descricao: 'Tratamento para esgotamento físico e emocional relacionado ao trabalho.'
    },
    {
        nome: 'Estresse',
        descricao: 'Estratégias para controle do estresse e qualidade de vida.'
    },
    {
        nome: 'Luto',
        descricao: 'Acompanhamento psicológico em processos de perda.'
    },
    {
        nome: 'Autoestima',
        descricao: 'Desenvolvimento da autoconfiança e autoimagem.'
    },
    {
        nome: 'Relacionamentos',
        descricao: 'Apoio para dificuldades em relações afetivas e sociais.'
    },
    {
        nome: 'Sexualidade',
        descricao: 'Orientação e acompanhamento relacionados à sexualidade humana.'
    },
    {
        nome: 'Orientação Profissional',
        descricao: 'Auxílio na escolha e desenvolvimento da carreira.'
    },
    {
        nome: 'Psicologia Organizacional',
        descricao: 'Saúde mental e desenvolvimento no ambiente corporativo.'
    },
    {
        nome: 'Mindfulness',
        descricao: 'Técnicas de atenção plena para redução da ansiedade e do estresse.'
    },
    {
        nome: 'Desenvolvimento Pessoal',
        descricao: 'Promoção do autoconhecimento e crescimento pessoal.'
    }
];

    try {
        console.log("🌱 Populando especialidades...");
        
        // Usa bulkCreate para inserir todas de uma vez
        // ignoreDuplicates: true evita erro se rodar o script duas vezes
        await db.Especialidade.bulkCreate(lista, { ignoreDuplicates: true });

        console.log("✅ Especialidades cadastradas com sucesso!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erro ao rodar seed:", error);
        process.exit(1);
    }
}

seedEspecialidades();