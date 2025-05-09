import fs from 'fs';
import csv from 'fast-csv';
import mysql from 'mysql2/promise';

async function importaCsv() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, database: process.env.DATABASE,user: process.env.DB_USER, password: process.env.DB_PASSWORD});
  const stream = fs.createReadStream('usuarios.csv');
  const parser = csv.parse({ headers: true });

  const BATCH_SIZE = 1000;
  let rows: any[] = [];

  parser.on('data', row => {
    rows.push([row.nome, row.email, row.idade /*, …*/]);
    if (rows.length >= BATCH_SIZE) {
      parser.pause();
      conn.query(
        'INSERT INTO usuarios (nome, email, idade, …) VALUES ?',
        [rows]
      ).then(() => {
        rows = [];
        parser.resume();
      });
    }
  });

  parser.on('end', async () => {
    if (rows.length) {
      await conn.query('INSERT INTO usuarios (nome, email, idade, …) VALUES ?', [rows]);
    }
    await conn.end();
    console.log('Importação concluída');
  });

  stream.pipe(parser);
}

importaCsv().catch(console.error);
