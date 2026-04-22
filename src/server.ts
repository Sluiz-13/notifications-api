import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import runMigrations from './database/migrations';
import authRoutes from "./routes/authRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();
runMigrations();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`);

  socket.on('join', (userId: number) => {
    socket.join(`user_${userId}`);
    console.log(`✅ Usuário ${userId} entrou na sala`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuário desconectado: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 API de Notificações rodando!' });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});