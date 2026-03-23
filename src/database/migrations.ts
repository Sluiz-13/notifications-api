import pool from "../database/connection"

async function runMigrations() {
  try {
      await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT,
    message TEXT,
    read BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
    );
    
    `);
  // console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
  // console.error('❌ Erro ao criar tabelas:', error);
  }


};

export default runMigrations;
runMigrations();