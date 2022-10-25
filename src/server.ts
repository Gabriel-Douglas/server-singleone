import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';

import 'express-async-errors';

import BaseRouter from './routes/api';
import logger from 'jet-logger';
import EnvVars from '@configurations/EnvVars';
import HttpStatusCodes from '@configurations/HttpStatusCodes';
import { NodeEnvs } from '@declarations/enums';
import { RouteError } from '@declarations/classes';

import {pool} from './db/config';

// **** Init express **** //

const app = express();

// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', "true");

  // Pass to next layer of middleware
  next();
});


// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({extended: true}));
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

// Nav to login pg by default
app.get('/', (_: Request, res: Response) => {
  res.sendFile('login.html', {root: viewsDir});
});

// Redirect to login if not logged in.
app.get('/users', (req: Request, res: Response) => {
  const jwt = req.signedCookies[EnvVars.cookieProps.key];
  if (!jwt) {
    res.redirect('/');
  } else {
    res.sendFile('users.html', {root: viewsDir});
  }
});

app.get('/home', async (req, res) => {
  var sqlCursos = `SELECT * FROM luztol."CURSOS" WHERE "CATEGORIA" = '${req.query.categoria}'`
  var cursos = await pool.query(sqlCursos);
  res.status(200).json(cursos.rows)

  // pool.query(sqlCursos,(error,results)=>{
  //   if(error) throw error;
  //   res.status(200).json(results.rows)
  // })
})

// **** Export default **** //

export default app;
