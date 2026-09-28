// scripts/create-admin.ts
import { Sequelize } from 'sequelize';
import initUsuarioModel, { UsuarioModel } from '../src/infrastructure/database/models/usuario.model';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const email = process.argv[2];
  const senha = process.argv[3];
  const nome = process.argv[4] || 'Admin Inicial';

  if (!email || !senha) {
    console.error('Uso: npx ts-node scripts/create-admin.ts <email> <senha> <nome?>');
    process.exit(1);
  }

  // Inicializa o Sequelize manualmente para o script
  const sequelize = new Sequelize(process.env.DATABASE_URL!);
  initUsuarioModel(sequelize);    

  try {
    const hash = await bcrypt.hash(senha, 10);

    const [user, created] = await UsuarioModel.findOrCreate({
      where: { email },
      defaults: {
        nome,
        email,
        telefone: '',
        telefone_validado: true,
        email_validado: true,
        senha_hash: hash,
        tipo_usuario: 'admin'
      }
    });

    if (created) {
      console.log(`Admin ${email} criado com sucesso!`);
    } else {
      console.log(`Usuário ${email} já existe. Atualizando para tipo 'admin'...`);
      user.tipo_usuario = 'admin';
      await user.save();
    }
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await sequelize.close();
  }
}

bootstrap();