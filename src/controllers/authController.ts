import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../database/connection';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body; // pegar os dados do body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Este e-mail ja esta em uso" })
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertResult = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const newUser = insertResult.rows[0];
    return res.status(201).json({
      message: "Usuario registrado com sucesso!",
      user: newUser
    })
  } catch (error) {
    console.log("Erro ao fazer registro", error);
    return res.status(500).json({ error: "Erro interno no servidor" })
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body; // pegar os dados do body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    ); // buscar usuario no banco

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    } // verificar se existe

    const user = result.rows[0];
    const senhaCorreta = await bcrypt.compare(password, user.password);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha invalida" })
    };

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET!,            
      { expiresIn: '1d' }    
    );
    return res.status(200).json({ token });


  } catch (error) {
    console.error(error);
    res.status(500).json("Erro interno no servidor")
  };
}