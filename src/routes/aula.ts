import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/config';

const apiAula = Router();

// Middleware para tratamento de erros
const handleError = (err: Error, res: Response, next: NextFunction) => {
    res.status(500).json({ error: err.message });
};

apiAula.get('/curso/:cursoId', async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { cursoId } = req.params

        var sql = `SELECT JSON_OBJECT(
            'ID', c.ID,
            'NOME', c.NOME,
            'DESCRICAO', c.DESCRICAO,
            'DIR_CAPA', c.DIR_CAPA,
            'CATEGORIA', c.CATEGORIA,
            'PROFESSOR', c.PROFESSOR,
            'HORAS', c.HORAS,
            'STATUS', c.STATUS,
            'ETAPAS', IF(ce.NOME IS NULL, '[]',COALESCE(JSON_ARRAYAGG(
              JSON_OBJECT(
                'NOME', ce.Nome,
                'DESCRICAO', ce.Descricao
              )
            ), '[]')
          )) AS Curso
          FROM cursos c
          LEFT JOIN cursos_etapas ce ON ce.ID_CURSO = c.ID
          WHERE c.ID = ${cursoId}
          GROUP BY c.ID;`

        const mysql = await db();
        const [rows] = await mysql.query(sql)

        if (!JSON.parse(JSON.stringify(rows)).length) {
            mysql.end()
            return res.status(404).json({ error: 'Curso não encontrado' });
        }

        mysql.end()
        res.status(200).json(rows);

    } catch (error) {
        handleError(error, res, next);
    }
});

export default apiAula;