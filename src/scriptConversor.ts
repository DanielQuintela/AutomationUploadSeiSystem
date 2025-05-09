import path from 'path';
import * as XLSX from 'xlsx';
import dbConnection from './database/connection';
require('dotenv').config();
import fs from 'fs';

async function importaUsuarios() {
  const connection = await dbConnection();
  const filePath = path.resolve(__dirname, 'usuarios.xls');
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

  // Processar as linhas de dados
  for (let i = headerLineIndex + 1; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    // Extrair nome, email e cpf com base nos índices identificados
    const Nome = row[nomeIndex];
    const Email = row[emailIndex];
    const CPF = row[cpfIndex];

    if (!Nome || !Email || !CPF) {
      // console.log(`Linha ignorada: ${JSON.stringify(row)}`);
      continue;
    }

    // Gerar sigla a partir do email
    const sigla = typeof Email === 'string' && Email.includes('@') ? Email.split('@')[0] : null;

    const id_orgao = 0
    const sin_ativo = "S"
    let nome_registro_civil = Nome
    const sin_bloqueado = "N"

    // console.log(CPF);
    console.log(Nome);



    usuarios.push([Nome, Email, CPF, sigla, id_orgao, sin_ativo,nome_registro_civil, sin_bloqueado ]);
  }

  // console.log('Usuários processados:', usuarios);

  if (!usuarios.length) {
    console.log('❌ Nenhum usuário válido encontrado.');
    return;
  }

  // try {
  //   // Inserir os dados no banco
  //   await connection.query(
  //     `INSERT INTO teste_usuario (nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`,
  //     [usuarios]
  //   );
  //   console.log(`✅ Inseridos ${usuarios.length} usuários no banco.`);
  // } catch (error) {
  //   console.error('❌ Erro ao inserir usuários:', error);
  // } finally {
  //   await connection.end();
  // }
}

importaUsuarios().catch(console.error);
