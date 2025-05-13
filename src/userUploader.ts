import path from 'path';
const os = require('os');
import * as XLSX from 'xlsx';
import dbConnection from './database/connection';
require('dotenv').config();
import fs from 'fs';
import { LastIdResult } from './types/dbConfig';
import userPermitions from './userPermitions';
import { UserInterface } from './types/users';

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
  const users: UserInterface[] = [];

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
  const acesso = header.indexOf('perfil de acesso');
  const cargo = header.indexOf('cargo')

  const [rows] = await connection.query('SELECT MAX(id_usuario) AS lastId FROM teste_usuario') as unknown as [LastIdResult[], any];
  let lastId = rows[0]?.lastId ?? 100000000;
  
  let departamentoAtual = '';

  for (let i = headerLineIndex + 1; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    if (row.some((col) => col.toLowerCase().startsWith('departamento:'))) {
      const departamentoLinha = row.find((col) => col.toLowerCase().startsWith('departamento:'));
      if (departamentoLinha) {
        const match = departamentoLinha.match(/departamento:\s*(.*?)\s*-/i);
        if (match && match[1]) {
          departamentoAtual = match[1].trim(); // Atualizar o departamento atual
          console.log(`Departamento identificado: ${departamentoAtual}`);
        }
      }
      continue; 
    };
    
    const Nome = row[nomeIndex];
    const Email = row[emailIndex];
    const CPF = row[cpfIndex];
    const Acesso = row[acesso];
    const Cargo = row[cargo];

    if (!Nome || !Email || !CPF || !Acesso || !Cargo) {
      continue;
    };

    const sigla = typeof Email === 'string' && Email.includes('@') ? Email.split('@')[0] : null;

    const id_orgao = process.env.ID_ORGAO;
    const sin_ativo = process.env.SIN_ATIVO;
    let nome_registro_civil = Nome;
    const sin_bloqueado = process.env.SIN_BLOQUEADO;

    if (
      Nome?.toLowerCase()   === 'nome' ||
      Email?.toLowerCase()  === 'email' ||
      CPF?.toLowerCase()    === 'cpf' ||
      Acesso?.toLowerCase() === 'perfil de acesso' ||
      Cargo?.toLowerCase()  === 'cargo'
    ) {
      continue;
    };

    lastId += 1;

    usuarios.push([
      lastId,
      Nome,
      Email,
      CPF,
      sigla,
      id_orgao,
      sin_ativo,
      nome_registro_civil,
      sin_bloqueado,
    ]);

   users.push({
      id_usuario: lastId,
      nome: Nome,
      email: Email,
      cpf: CPF,
      sigla: sigla,
      id_orgao: id_orgao,
      sin_ativo: sin_ativo,
      nome_registro_civil: nome_registro_civil,
      sin_bloqueado: sin_bloqueado,
      acesso: Acesso,
      cargo: Cargo,
      departamento: departamentoAtual,
    });    
  }
  // console.log('Usuários processados:', usuarios);
  if (!usuarios.length) {
    console.log('❌ Nenhum usuário válido encontrado.');
    return;
  }

  try {
    await connection.query(
      `INSERT INTO ${process.env.DB_NAME} (id_usuario, nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`,
      [usuarios]
    );
    console.log(`✅ Inseridos ${usuarios.length} usuários no banco.!!`);
  } catch (error) {
    console.error('❌ Erro ao inserir usuários:', error);
  } finally {
    await connection.end();
  }
  userPermitions(users);
}

importaUsuarios().catch(console.error);
