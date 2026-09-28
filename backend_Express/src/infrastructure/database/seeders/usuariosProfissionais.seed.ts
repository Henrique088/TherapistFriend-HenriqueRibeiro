// src/infrastructure/database/seeders/usuariosProfissionais.seed.ts

import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import db from '../index';

async function seedUsuariosProfissionais() {
    const senhaHash = await bcrypt.hash('123456', 10);

    const lista = [
        {
            nome: "Dra. Ana Carolina Mendes",
            email: "ana.mendes@therapistfriend.com",
            telefone: "31999990001",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dr. Bruno Oliveira",
            email: "bruno.oliveira@therapistfriend.com",
            telefone: "31999990002",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dra. Camila Ferreira",
            email: "camila.ferreira@therapistfriend.com",
            telefone: "31999990003",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dr. Daniel Souza",
            email: "daniel.souza@therapistfriend.com",
            telefone: "31999990004",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dra. Elisa Martins",
            email: "elisa.martins@therapistfriend.com",
            telefone: "31999990005",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dr. Felipe Costa",
            email: "felipe.costa@therapistfriend.com",
            telefone: "31999990006",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dra. Gabriela Lima",
            email: "gabriela.lima@therapistfriend.com",
            telefone: "31999990007",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dr. Henrique Rocha",
            email: "henrique.rocha@therapistfriend.com",
            telefone: "31999990008",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dra. Juliana Almeida",
            email: "juliana.almeida@therapistfriend.com",
            telefone: "31999990009",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
        {
            nome: "Dr. Lucas Barbosa",
            email: "lucas.barbosa@therapistfriend.com",
            telefone: "31999990010",
            senha_hash: senhaHash,
            tipo_usuario: "profissional",
            telefone_validado: true,
            email_validado: true,
            ativo: true,
            data_cadastro: new Date(),
        },
    ];

    try {
        console.log("🌱 Populando usuários profissionais...");

        await db.Usuario.bulkCreate(lista, {
            ignoreDuplicates: true,
        });

        console.log("✅ Usuários profissionais cadastrados com sucesso!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erro ao rodar seed:", error);
        process.exit(1);
    }
}

seedUsuariosProfissionais();