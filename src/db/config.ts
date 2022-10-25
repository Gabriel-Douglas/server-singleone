import pg from 'pg';

export const pool = new pg.Pool({
  maxUses: 20,
  connectionString: process.env.PGCONSTR,
  ssl: {
    rejectUnauthorized: false
  }
});

// export const select = async (sqlQuery: string) => pool.connect((err,client,done) => {
  
//   if(err){
//     return console.log("HOUVE UMA FALHA AO CONECTAR AO BANCO DE DADOS",err.message);
//   }

//   return client.query(sqlQuery,(err,result) => {
//     done()
//     if(err){
//       console.log("HOUVE UMA FALHA AO EXECUTAR A CONSULTA",err.message);
//     }

//     console.log(result.rows)
//     return result.rows

//   })
// })


// export default new pg.Client({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: 5432,
//   ssl: {
//      rejectUnauthorized: false
//   }
// })
