import dbConnection from './database/connection';
require('dotenv').config();
import { LastIdResult } from './types/dbConfig';
import userPermitions from './userPermitions';
import { UserInterface } from './types/users';
import readXlsFunction from './services/readXlsFunction';
import fs from 'fs';
import { uploadUsers } from './repository/userRepository';

async function importaUsuarios() {
  const connection = await dbConnection();
  const csvFilePath = readXlsFunction()
  const usuarios: any[] = [];
  const users: UserInterface[] = [];
  let departamentoAtual = '';

  // Ler o CSV convertido
  const rawData: string[] = fs.readFileSync(csvFilePath, 'utf-8').split('\n');
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
  if (!usuarios.length) {
    console.log('❌ Nenhum usuário válido encontrado.');
    return;
  }

  await uploadUsers(usuarios);
 
  userPermitions(users);
}

importaUsuarios().catch(console.error);
