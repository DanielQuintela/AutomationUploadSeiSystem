import dbConnection from "./database/connection";
import { uploadUnits } from "./repository/unitRepository";
require('dotenv').config();
import { readUnitFunction } from "./services/readXlsFunction";
import { LastIdResult } from "./types/dbConfig";
import { UnitInterface } from "./types/units";
import fs from 'fs';

async function importaUnidades() {
    const connection = await dbConnection();
    const csvFilePath = readUnitFunction()
    const unidades: UnitInterface[] = []
 
   const rawData: string[] = fs.readFileSync(csvFilePath, 'utf8').split('\n');

    let headerLineIndex = -1;
    let header: string[] = [];
    for (let i = 0; i < rawData.length; i++) {
        const line = rawData[i].split(',').map((col) => col.trim().toLowerCase());
        if (line.includes('nome') && line.includes('sigla')) {
        headerLineIndex = i;
        header = line;
        break;
        }
    }
    if (headerLineIndex === -1) {
        console.error('❌ Não foi possível localizar as colunas Nome e Sigla no arquivo.');
        return;
    }

    const nomeIndex = header.indexOf('nome');
    const siglaIndex = header.indexOf('sigla');

    const [rows] = await connection.query(`SELECT MAX(id_unidade) AS lastId FROM ${process.env.UNIT_DB}`) as unknown as [LastIdResult[], any];
    let lastId = rows[0]?.lastId ?? 100000000;

    for (let i = headerLineIndex + 1; i < rawData.length; i++) {
    const row = rawData[i].split(',').map((col) => col.trim());

    // Ignora linhas de cabeçalho repetidas ou vazias
    if (
      !row[nomeIndex] || !row[siglaIndex] ||
      row[nomeIndex].toLowerCase() === 'nome' ||
      row[siglaIndex].toLowerCase() === 'sigla'
    ) {
      continue;
    }

    const Nome = row[nomeIndex];
    const Sigla = row[siglaIndex];

     const id_orgao = process.env.ID_ORGAO;
    const sin_ativo = process.env.SIN_ATIVO;
    const sin_global = process.env.SIN_GLOBAL;

    lastId += 1;
    unidades.push({
        id_unidade: lastId,
        descricao: Nome,
        sigla: Sigla,
        id_orgao: id_orgao,
        sin_ativo: sin_ativo,
        sin_global: sin_global
    })
}

uploadUnits(unidades)


}

importaUnidades().catch(console.error);