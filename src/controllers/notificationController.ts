import { Request, Response } from 'express';
import pool from '../database/connection';
import jwt from 'jsonwebtoken';
import { io } from '../server';

// Função auxiliar para pegar o userId do token
const getUserId = (req: Request): number => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]!;
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
  return decoded.id;
}

// Criar notificação
export const createNotification = async (req: Request, res: Response) => {
  const { title, message } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ error: "Título e mensagem são obrigatórios" });
    }

    const userId = getUserId(req);

    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, message]
    );
    io.to(`user_${userId}`).emit('nova_notificacao', result.rows[0]);

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }

}

// Listar notificações do usuário
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// Marcar notificação como lida
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = getUserId(req);

    const result = await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}