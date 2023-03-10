import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { db } from '../db/config'
import bcrypt from "bcrypt";
import EnvVars from '@configurations/EnvVars';

const router = express.Router();

router.post('/auth', async (req, res) => {
  // Obtém os dados de usuário e senha enviados no corpo da requisição
  const { email, password } = req.body;

  // Verifica se o usuário existe no banco de dados
  const mysql = await db()
  const [rows] = await mysql.execute('SELECT ID, EMAIL, SENHA FROM usuarios WHERE email = ?', [email]);
  
  const user = JSON.parse(JSON.stringify(rows))
  console.log(user);
  

  if (Array.isArray(rows) && rows.length <= 0) {
    return res.status(401).send({ message: 'Usuário ou senha inválidos' });
  }

  // Verifica se a senha está correta

  bcrypt.compare(password, user[0].SENHA, function(err, resBcrypt) {
    if (err){
      // handle error
      return res.status(401).send({ message: 'Usuário ou senha inválidos' });
    }
    if (resBcrypt) {
      // EnvVars.jwt.secret
      const token = jwt.sign({ id: user.ID }, "#Cerrado@2023!", {
        expiresIn: 12 * 60 * 60, // expira em 12 horas EnvVars.jwt.exp
      });
      res.status(200).json({token: token})
    } else {
      // response is OutgoingMessage object that server response http request
      res.status(401).send({ message: 'Usuário ou senha inválidos' });
    }
  });

  // if (user[0].SENHA !== password) {
  //   return res.status(401).send({ message: 'Usuário ou senha inválidos' });
  // }

  // // Cria o token JWT
  // // EnvVars.jwt.secret
  // const token = jwt.sign({ id: user.ID }, "#Cerrado@2023!", {
  //   expiresIn: 12 * 60 * 60, // expira em 12 horas EnvVars.jwt.exp
  // });

  // // res.send({ token });
  // res.status(200).json({token: token})
});

export default router;