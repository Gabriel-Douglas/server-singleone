import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/config';

const apiCursos = Router();

// Middleware para tratamento de erros
const handleError = (err: Error, res: Response, next: NextFunction) => {
    res.status(500).json({ error: err.message });
};

// GET - Read (Listar todos os cursos)
apiCursos.get('/list', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mysql = await db();
        const [rows] = await mysql.query('SELECT * FROM cursos')
        mysql.end()
        res.status(200).json(rows);
    } catch (error) {
        handleError(error, res, next);
    }
});

// GET - Read (Obter curso por ID)
apiCursos.get('/one/:id', async (req: Request, res: Response, next: NextFunction) => {
try {
    const id = req.params.id;
    const mysql = await db();
    const [rows] = await mysql.query(`SELECT * FROM cursos WHERE ID = ${id}`)

    if (!JSON.parse(JSON.stringify(rows)).length) {
        mysql.end()
        return res.status(404).json({ error: 'Curso não encontrado' });
    }
    res.status(200).json(rows);
} catch (error) {
    handleError(error, res, next);
}
});

// POST - Create (Criar novo curso)
apiCursos.post('/add', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nome, descricao, dir_capa, categoria, professor, horas, status } = req.body;
        const mysql = await db()
        const [result] = await mysql.execute(`
        INSERT INTO cursos (NOME, DESCRICAO, DIR_CAPA, CATEGORIA, PROFESSOR, HORAS, STATUS) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [nome, descricao, dir_capa, categoria, professor, horas, status]);
        
        mysql.end()
        res.json({ status: 200, message: 'Curso criado com sucesso'});
    
    } catch (error) {
        handleError(error, res, next);
    }
});

// PUT - Update (Atualizar curso por ID)
apiCursos.post('/edit/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const mysql = await db()
    const { nome, descricao, dir_capa, categoria, professor, horas, status } = req.body;

    try {
        await mysql.execute(`UPDATE cursos SET NOME = '${nome}', DESCRICAO = '${descricao}', CATEGORIA = '${categoria}', PROFESSOR = '${professor}', HORAS = '${horas}', STATUS = '${status}' WHERE ID = ${id}`)
        mysql.end()
        res.json({ status: 200, message: 'Curso editado com sucesso'});

            // (err: any, result: any) => {
            //     if (err) {
            //         mysql.end()
            //         return res.status(500).json({ error: err.message });
            //     }
            //     if (result.affectedRows === 0) {
            //         mysql.end()
            //         return res.status(404).json({ error: 'Curso não encontrado' });
            //     }
            //     res.json({ message: 'Curso atualizado com sucesso' });
            // }
    } catch (error) {
        handleError(error, res, next);
    }
});

// DELETE - Delete (Deletar curso por ID)
apiCursos.delete('/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
    const mysql = await db()
    const id = req.params.id;

    try {
        await mysql.query(`DELETE FROM cursos WHERE ID = ${id}`, (err: any, result: any) => {
            if (err) {
                mysql.end()
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                mysql.end()
                return res.status(404).json({ error: 'Curso não encontrado' });
            }
            res.json({ message: 'Curso deletado com sucesso' });
        });
    } catch (error) {
        handleError(error, res, next);
    }
});

  apiCursos.get('/etapas', async (req: Request, res: Response, next: NextFunction) => {

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
      GROUP BY c.ID;`

    try {
        const id = req.params.id;
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


    apiCursos.post('/etapas/add', async (req: Request, res: Response, next: NextFunction) => {
        try {

            console.log(req.body);
            
            const { nome, descricao, idCurso } = req.body;
            const mysql = await db();

            const [result] = await mysql.execute(`
            INSERT INTO cursos_etapas (ID_CURSO, NOME, DESCRICAO) 
            VALUES (?, ?, ?)`, [idCurso, nome, descricao]);
            
            mysql.end()
            res.json({ status: 200, message: 'Etapa criada com sucesso'});
            
        } catch (error) {
            handleError(error, res, next);
        }
    })

export default apiCursos;