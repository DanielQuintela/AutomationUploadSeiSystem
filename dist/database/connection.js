"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
async function dbConnection() {
    if (!process.env.DB_HOST || !process.env.DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
        throw new Error('Variáveis de ambiente do banco de dados não estão definidas corretamente.');
    }
    const conn = await promise_1.default.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });
    if (conn)
        console.log("Conexão com banco realizada com sucesso !");
    return conn;
}
;
