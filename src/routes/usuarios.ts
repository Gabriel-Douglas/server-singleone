import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/config';
import bcrypt from "bcrypt";

const apiUsuarios = Router();

// Middleware para tratamento de erros
const handleError = (err: Error, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
};

// Rota para listar todos os usuários
apiUsuarios.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mysql = await db()
      const [rows] = await mysql.execute('SELECT * FROM usuarios');
      mysql.end()
      res.json(rows);
    } catch (err) {
      handleError(err, res, next);
    }
  });

// Rota para criar um novo usuário
apiUsuarios.post('/add', async (req: Request, res: Response, next: NextFunction) => {
  const { CPF, NOME, EMAIL, CELULAR, DT_NASCIMENTO, ADMINISTRADOR } = req.body;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(CPF, saltRounds);

  console.log(req.body);
  

  try {
    const mysql = await db()
    const [result] = await mysql.execute(`
      INSERT INTO usuarios (CPF, NOME, EMAIL, CELULAR, DT_NASCIMENTO, SENHA, ADMINISTRADOR) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [CPF, NOME, EMAIL, CELULAR, DT_NASCIMENTO, hashedPassword, ADMINISTRADOR]);
    mysql.end()
    res.status(200).json({
        msg: 'Usuário criado com sucesso',
        result: result
    });
  } catch (err) {
    console.log(err)
    handleError(err, res, next);
  }
});

// Rota para editar um usuário existente
apiUsuarios.put('/edit/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { NOME, EMAIL, CELULAR } = req.body;
  const { id } = req.params;

  try {
    const mysql = await db()
    const [result] = await mysql.execute(`
      UPDATE usuarios 
      SET NOME = ?, EMAIL = ?, CELULAR = ?
      WHERE ID = ?
    `, [NOME, EMAIL, CELULAR, id]);
    mysql.end()
    res.status(200).json({msg: 'Usuário atualizado com sucesso', result: result});
  } catch (err) {
    handleError(err, res, next);
  }
});

export default apiUsuarios;