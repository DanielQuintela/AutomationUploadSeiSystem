"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const fast_csv_1 = __importDefault(require("fast-csv"));
const promise_1 = __importDefault(require("mysql2/promise"));
async function importaCsv() {
    const conn = await promise_1.default.createConnection({ host: '…', user: '…', password: '…', database: '…' });
    const stream = fs_1.default.createReadStream('usuarios.csv');
    const parser = fast_csv_1.default.parse({ headers: true });
    const BATCH_SIZE = 1000;
    let rows = [];
    parser.on('data', row => {
        rows.push([row.nome, row.email, row.idade /*, …*/]);
        if (rows.length >= BATCH_SIZE) {
            parser.pause();
            conn.query('INSERT INTO usuarios (nome, email, idade, …) VALUES ?', [rows]).then(() => {
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
