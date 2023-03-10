import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
var cors = require('cors')

import 'express-async-errors';

import BaseRouter from './routes/api';
import LoginRouter from './routes/login';
import UsersRouter from './routes/usuarios';
import CursosRouter from './routes/cursos';
import UploadCurso from './routes/upload';
import SaladeAula from './routes/aula';

import logger from 'jet-logger';
import EnvVars from '@configurations/EnvVars';
import HttpStatusCodes from '@configurations/HttpStatusCodes';
import { NodeEnvs } from '@declarations/enums';
import { RouteError } from '@declarations/classes';

import {db} from './db/config'


// **** Init express **** //

const app = express();
app.use(cors())

// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

// Show routes called in console during development
if (EnvVars.nodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.nodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// **** Add API routes **** //

// Add APIs
app.use('/api', BaseRouter);
app.use('/login',LoginRouter);
app.use('/users',UsersRouter);
app.use('/cursos',CursosRouter);
app.use('/upload',UploadCurso);
app.use('/saladeaula',SaladeAula);

// Setup error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  logger.err(err, true);
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});

// **** Serve front-end content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// // Nav to login pg by default
// app.get('/', (_: Request, res: Response) => {
//   res.sendFile('login.html', { root: viewsDir });
// });

// // Redirect to login if not logged in.
// app.get('/users', (req: Request, res: Response) => {
//   const jwt = req.signedCookies[EnvVars.cookieProps.key];
//   if (!jwt) {
//     res.redirect('/');
//   } else {
//     res.sendFile('users.html', { root: viewsDir });
//   }
// });

app.get('/cursos', async (req, res) => {
  var sqlCursos = `SELECT * FROM cursos WHERE CATEGORIA = '${req.query.categoria}'`

  const mysql = await db();
  
    try {
      const [cursos] = await mysql.query(sqlCursos)
      mysql.end();
      res.status(200).json(cursos)
    } catch (error) {
      console.log(error)
      mysql.end();
    }
})

app.get('/categorias', async (req, res) => {
  var sqlCursos = `SELECT * FROM categorias`

  const mysql = await db();
  
    try {
      const [categorias] = await mysql.query(sqlCursos)
      mysql.end();
      res.status(200).json(categorias)
    } catch (error) {
      console.log(error)
      mysql.end();
    }
})

// **** Export default **** //

export default app;
