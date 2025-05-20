import dbConnection from './database/connection';
require('dotenv').config();
import { LastIdResult } from './types/dbConfig';
import userPermitions from './userPermitions';
import { UserInterface, UserToDBInterface } from './types/users';
import readXlsFunction from './services/readXlsFunction';
import fs from 'fs';
import { uploadUsers } from './repository/userRepository';

async function importaUsuarios() {
  const connection = await dbConnection();
  const csvFilePath = readXlsFunction()
  const usuarios: UserToDBInterface[] = [];
  const users: UserInterface[] = [];
  let departamentoAtual = '';

  // Ler o CSV convertido
  const rawData: string[] = fs.readFileSync(csvFilePath, 'utf-8').split('\n');

  // Capturar todas as linhas que contêm departamentos
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());
    if (row.some((col) => col.toLowerCase().startsWith('departamento:'))) {
      const departamentoLinha = row.find((col) => col.toLowerCase().startsWith('departamento:'));
      if (departamentoLinha) {
        const match = departamentoLinha.match(/departamento:\s*(.*?)\s*-/i);
        if (match && match[1]) {
          const departamento = match[1].trim();
          // fs.appendFileSync('log-processamento.txt', `Departamento capturado na linha ${i}: ${departamento}\n`);
        } else {
          console.log(`Departamento não identificado na linha ${i}: ${departamentoLinha}`);
        }
      }
    }
  }

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

  // Verificar departamentos antes do cabeçalho
  for (let i = 0; i < headerLineIndex; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    if (row.some((col) => col.toLowerCase().startsWith('departamento:'))) {
      const departamentoLinha = row.find((col) => col.toLowerCase().startsWith('departamento:'));

      if (departamentoLinha) {
        const match = departamentoLinha.match(/departamento:\s*(.*?)\s*-/i);
        if (match && match[1]) {
          departamentoAtual = match[1].trim(); // Atualizar o departamento atual
        } else {
          console.log(`Departamento não identificado na linha antes do cabeçalho: ${departamentoLinha}`);
        }
      }
    }
  }

  const nomeIndex = header.indexOf('nome');
  const emailIndex = header.indexOf('email');
  const cpfIndex = header.indexOf('cpf');
  const acesso = header.indexOf('perfil de acesso');
  const cargo = header.indexOf('cargo')

  const [rows] = await connection.query(`SELECT MAX(id_usuario) AS lastId FROM ${process.env.USER_DB}`) as unknown as [LastIdResult[], any];
  let lastId = rows[0]?.lastId ?? 100000000;
  // let lastId = 100000008

  for (let i = headerLineIndex + 1; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    // Atualiza o departamento se encontrar uma linha de departamento
    if (row.some((col) => col.toLowerCase().startsWith('departamento:'))) {
      const departamentoLinha = row.find((col) => col.toLowerCase().startsWith('departamento:'));
      if (departamentoLinha) {
        const match = departamentoLinha.match(/departamento:\s*(.*?)\s*-/i);
        if (match && match[1]) {
          departamentoAtual = match[1].trim();
          console.log(`Departamento identificado: ${departamentoAtual}`);
        }
      }
      continue;
    }

    // Ignora linhas de cabeçalho repetidas ou vazias
    if (
      !row[nomeIndex] || !row[emailIndex] || !row[cpfIndex] || !row[acesso] || !row[cargo] ||
      row[nomeIndex].toLowerCase() === 'nome' ||
      row[emailIndex].toLowerCase() === 'email' ||
      row[cpfIndex].toLowerCase() === 'cpf' ||
      row[acesso].toLowerCase() === 'perfil de acesso' ||
      row[cargo].toLowerCase() === 'cargo'
    ) {
      continue;
    }

    const Nome = row[nomeIndex];
    const Email = row[emailIndex];
    const CPF = row[cpfIndex];
    const Acesso = row[acesso];
    const Cargo = row[cargo];

    const sigla = typeof Email === 'string' && Email.includes('@') ? Email.split('@')[0] : null;

    const id_orgao = process.env.ID_ORGAO;
    const sin_ativo = process.env.SIN_ATIVO;
    let nome_registro_civil = Nome;
    const sin_bloqueado = process.env.SIN_BLOQUEADO;
    
    const siglaJaCadastrada = usuarios.some(user => user.sigla === sigla);
    if (siglaJaCadastrada) {
      const usuarioExistente = usuarios.find(user => user.sigla === sigla);
      const id_usuario = usuarioExistente ? usuarioExistente.id_usuario : 0;

      users.push({
        id_usuario: id_usuario,
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

      continue;
    }

    lastId += 1;
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

    usuarios.push({
      id_usuario: lastId,
      nome: Nome,
      email: Email,
      cpf: CPF,
      sigla: sigla,
      id_orgao: id_orgao,
      sin_ativo: sin_ativo,
      nome_registro_civil: nome_registro_civil,
      sin_bloqueado: sin_bloqueado,
    });
  }
  // console.log(usuarios.length);
  
  if (!usuarios.length) {
    console.log('❌ Nenhum usuário válido encontrado.');
    return;
  }

  await uploadUsers(usuarios);
 
  userPermitions(users);
}

importaUsuarios().catch(console.error);
