"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const XLSX = __importStar(require("xlsx"));
const connection_1 = __importDefault(require("./database/connection"));
require('dotenv').config();
const fs_1 = __importDefault(require("fs"));
async function importaUsuarios() {
    const connection = await (0, connection_1.default)();
    const filePath = path_1.default.resolve(__dirname, 'usuarios.xls');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Converter a planilha para CSV
    const csvFilePath = path_1.default.resolve(__dirname, 'usuarios.csv');
    const csvData = XLSX.utils.sheet_to_csv(sheet);
    fs_1.default.writeFileSync(csvFilePath, csvData);
    // Ler o CSV convertido
    const rawData = fs_1.default.readFileSync(csvFilePath, 'utf-8').split('\n');
    const usuarios = [];
    // Localizar a linha do cabeçalho
    let headerLineIndex = -1;
    let header = [];
    for (let i = 0; i < rawData.length; i++) {
        const line = rawData[i].split(',').map((col) => col.trim().toLowerCase());
        if (line.includes('nome') && line.includes('email') && line.includes('cpf')) {
            headerLineIndex = i;
            header = line;
            break;
        }
    }
    if (headerLineIndex === -1) {
        console.error('❌ Não foi possível localizar as colunas Nome, Email ou CPF no arquivo.');
        return;
    }
    const nomeIndex = header.indexOf('nome');
    const emailIndex = header.indexOf('email');
    const cpfIndex = header.indexOf('cpf');
    // Processar as linhas de dados
    for (let i = headerLineIndex + 1; i < rawData.length; i++) {
        const row = rawData[i].split(',').map((col) => col.trim());
        const Nome = row[nomeIndex];
        const Email = row[emailIndex];
        const CPF = row[cpfIndex];
        if (!Nome || !Email || !CPF) {
            // console.log(`Linha ignorada: ${JSON.stringify(row)}`);
            continue;
        }
        const sigla = typeof Email === 'string' && Email.includes('@') ? Email.split('@')[0] : null;
        const id_orgao = 0;
        const sin_ativo = "S";
        let nome_registro_civil = Nome;
        const sin_bloqueado = "N";
        if (Nome?.toLowerCase() === 'nome' || Email?.toLowerCase() === 'email' || CPF?.toLowerCase() === 'cpf') {
            console.log(`Linha ignorada (repetição do cabeçalho): ${JSON.stringify(row)}`);
            continue;
        }
        usuarios.push([Nome, Email, CPF, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado]);
    }
    // console.log('Usuários processados:', usuarios);
    if (!usuarios.length) {
        console.log('❌ Nenhum usuário válido encontrado.');
        return;
    }
    try {
        await connection.query(`INSERT INTO teste_usuario (nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`, [usuarios]);
        console.log(`✅ Inseridos ${usuarios.length} usuários no banco.`);
    }
    catch (error) {
        console.error('❌ Erro ao inserir usuários:', error);
    }
    finally {
        await connection.end();
    }
}
importaUsuarios().catch(console.error);
