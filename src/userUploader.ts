import path from 'path';
const os = require('os');
import * as XLSX from 'xlsx';
import dbConnection from './database/connection';
require('dotenv').config();
import fs from 'fs';
import { LastIdResult } from './types/dbConfig';
import userPermitions from './userPermitions';


async function importaUsuarios() {
  const connection = await dbConnection();

  const desktopDir = path.join(os.homedir(), 'Desktop', 'upload');
  const filePath = path.resolve(desktopDir, 'usuarios.xls');

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Converter a planilha para CSV
  const csvFilePath = path.resolve(__dirname, 'usuarios.csv');
  const csvData = XLSX.utils.sheet_to_csv(sheet);
  fs.writeFileSync(csvFilePath, csvData);

  // Ler o CSV convertido
  const rawData: string[] = fs.readFileSync(csvFilePath, 'utf-8').split('\n');
  const usuarios: any[] = [];

  // Localizar a linha do cabeçalho
  let headerLineIndex = -1;
  let header: string[] = [];
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
  const acesso = header.indexOf('perfil de acesso')

  const [rows] = await connection.query('SELECT MAX(id_usuario) AS lastId FROM teste_usuario') as unknown as [LastIdResult[], any];
  let lastId = rows[0]?.lastId ?? 100000000;
  
  // Processar as linhas de dados
  for (let i = headerLineIndex + 1; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    const Nome = row[nomeIndex];
    const Email = row[emailIndex];
    const CPF = row[cpfIndex];
    const Acesso = row[acesso]
    console.log(Acesso);
    
    if (!Nome || !Email || !CPF) {
  
      continue;
    }

    const sigla = typeof Email === 'string' && Email.includes('@') ? Email.split('@')[0] : null;

    const id_orgao = process.env.ID_ORGAO
    const sin_ativo = process.env.SIN_ATIVO
    let nome_registro_civil = Nome
    const sin_bloqueado = process.env.SIN_BLOQUEADO
    
    if (Nome?.toLowerCase() === 'nome' || Email?.toLowerCase() === 'email' || CPF?.toLowerCase() === 'cpf') {

      continue;
    }

    lastId += 1

    usuarios.push([
      lastId,
      Nome, 
      Email, 
      CPF, 
      sigla, 
      id_orgao, 
      sin_ativo,
      nome_registro_civil, 
      sin_bloqueado 
    ]);
  }
    


  if (!usuarios.length) {
  
    return;
  }

  try {
    await connection.query(
      `INSERT INTO ${process.env.DB_NAME} (id_usuario, nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`,
      [usuarios]
    );

  } catch (error) {
    console.error('❌ Erro ao inserir usuários:', error);
  } finally {
    await connection.end();
  }

  userPermitions(usuarios);
}

importaUsuarios().catch(console.error);
