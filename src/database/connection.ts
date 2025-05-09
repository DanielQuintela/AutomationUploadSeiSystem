import mysql from 'mysql2/promise';

export default async function dbConnection() {
    
    if (!process.env.DB_HOST || !process.env.DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
        throw new Error('Variáveis de ambiente do banco de dados não estão definidas corretamente.');
      }
    const conn = await mysql.createConnection({ 
        host: process.env.DB_HOST, 
        database: process.env.DATABASE,
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD
    });

    return conn;
};
 

