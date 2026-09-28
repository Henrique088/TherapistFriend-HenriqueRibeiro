// src/infrastructure/database/seeders/profissionais.seed.ts

import 'dotenv/config';
import db from '../index';
import { Op } from 'sequelize';

async function seedProfissionais() {
    try {
        console.log("🌱 Populando profissionais...");

        const usuarios = await db.Usuario.findAll({
            where: { tipo_usuario: "profissional", id: {[Op.ne]: 2} },
            order: [["id", "ASC"]]
        });

        if (!usuarios.length) {
            console.log("❌ Nenhum usuário profissional encontrado.");
            process.exit(1);
        }

        const lista = [
            {
                id_usuario: usuarios[0]?.id,
                cpf: "12345678901",
                crp: "04/10001",
                bio: "Psicóloga clínica com experiência em ansiedade, autoestima e terapia cognitivo-comportamental.",
                especialidades: [
                    "Psicologia Clínica",
                    "Ansiedade",
                    "Terapia Cognitivo-Comportamental (TCC)",
                    "Autoestima"
                ]
            },
            {
                id_usuario: usuarios[1]?.id,
                cpf: "12345678902",
                crp: "04/10002",
                bio: "Especialista em terapia familiar, casais e mediação de conflitos.",
                especialidades: [
                    "Terapia Familiar",
                    "Terapia de Casais",
                    "Relacionamentos",
                    "Orientação Parental"
                ]
            },
            {
                id_usuario: usuarios[2]?.id,
                cpf: "12345678903",
                crp: "04/10003",
                bio: "Psicóloga focada em crianças, adolescentes e desenvolvimento emocional.",
                especialidades: [
                    "Psicologia Infantil",
                    "Psicologia do Adolescente",
                    "TDAH",
                    "TEA"
                ]
            },
            {
                id_usuario: usuarios[3]?.id,
                cpf: "12345678904",
                crp: "04/10004",
                bio: "Atendimento voltado para depressão, luto e transtornos do humor.",
                especialidades: [
                    "Depressão",
                    "Luto",
                    "Transtorno Bipolar",
                    "Psicologia Clínica"
                ]
            },
            {
                id_usuario: usuarios[4]?.id,
                cpf: "12345678905",
                crp: "04/10005",
                bio: "Especialista em saúde mental no ambiente corporativo.",
                especialidades: [
                    "Psicologia Organizacional",
                    "Burnout",
                    "Estresse",
                    "Mindfulness"
                ]
            },
            {
                id_usuario: usuarios[5]?.id,
                cpf: "12345678906",
                crp: "04/10006",
                bio: "Psicanalista com atuação em desenvolvimento pessoal e autoconhecimento.",
                especialidades: [
                    "Psicanálise",
                    "Desenvolvimento Pessoal",
                    "Autoestima",
                    "Mindfulness"
                ]
            },
            {
                id_usuario: usuarios[6]?.id,
                cpf: "12345678907",
                crp: "04/10007",
                bio: "Neuropsicóloga especializada em avaliação cognitiva.",
                especialidades: [
                    "Neuropsicologia",
                    "TDAH",
                    "TEA",
                    "Psicopedagogia"
                ]
            },
            {
                id_usuario: usuarios[7]?.id,
                cpf: "12345678908",
                crp: "04/10008",
                bio: "Psicólogo com foco em dependência química e transtornos alimentares.",
                especialidades: [
                    "Dependência Química",
                    "Transtornos Alimentares",
                    "Ansiedade",
                    "Depressão"
                ]
            },
            {
                id_usuario: usuarios[8]?.id,
                cpf: "12345678909",
                crp: "04/10009",
                bio: "Psiquiatra com experiência em transtornos de ansiedade e TOC.",
                especialidades: [
                    "Psiquiatria",
                    "Ansiedade",
                    "Transtorno Obsessivo-Compulsivo (TOC)",
                    "Transtorno Bipolar"
                ]
            },
            {
                id_usuario: usuarios[9]?.id,
                cpf: "12345678910",
                crp: "04/10010",
                bio: "Psicóloga humanista especializada em relacionamentos e desenvolvimento pessoal.",
                especialidades: [
                    "Psicologia Humanista",
                    "Relacionamentos",
                    "Desenvolvimento Pessoal",
                    "Gestalt-terapia"
                ]
            }
        ]
        .filter(p => p.id_usuario)
        .map(p => ({
            ...p,
            especialidades: JSON.stringify(p.especialidades)
        }));

        await db.Profissional.bulkCreate(lista, {
            ignoreDuplicates: true
        });

        console.log("✅ Profissionais cadastrados com sucesso!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Erro:", error);
        process.exit(1);
    }
}

seedProfissionais();