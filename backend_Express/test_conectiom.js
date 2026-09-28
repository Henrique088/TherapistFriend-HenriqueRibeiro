const sequelize = require('./config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar:', err);
  } finally {
    await sequelize.close();
  }
})();
