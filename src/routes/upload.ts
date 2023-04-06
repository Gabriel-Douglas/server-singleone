import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { unlink } from 'fs';
import path from 'path';
import { db } from '../db/config';

const apiUpload = Router();

const pathStorage = '/efs/singleoneeducation/capas/';

// Middleware para tratamento de erros
const handleError = (err: Error, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
};

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pathStorage);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Arquivo inválido'));
  }
};

const uploadCapa = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).single('file');

// Rota de upload de capa de curso
apiUpload.post('/capaCurso', uploadCapa, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { CURSOID } = req.query;
    const fileName = req.file?.filename;

    if (fileName) {
      const mysql = await db();
      const [result] = await mysql.execute(`
        UPDATE cursos 
        SET DIR_CAPA = ? WHERE ID = ?`,
        [`/${fileName}`, CURSOID]);
      mysql.end();
    } else {
      throw new Error('Arquivo não encontrado');
    }

    res.status(200).json({ message: 'Arquivo carregado com sucesso!' });

  } catch (error) {
      // se houver algum erro, exclui o arquivo
      if (req.file) {
        unlink(req.file.path, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    handleError(error, res, next);
  }
});

export default apiUpload;
