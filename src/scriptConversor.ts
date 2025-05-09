import path from 'path';
import * as XLSX from 'xlsx';
import dbConnection from './database/connection';

async function importaXls() {
  const connection = await dbConnection();

  //Definir nome padrão para upload dos dados
  const filePath = path.resolve(__dirname, 'usuarios.xls'); 
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  if (!jsonData.length) {
    console.error('❌ Nenhum dado encontrado no arquivo XLS.');
    return;
  }

  const BATCH_SIZE = 1000;
  let rows: any[] = [];

  const insertBatch = async () => {
    if (!rows.length) return;
    try {
      await connection.query(
        'INSERT INTO usuarios (nome, email, idade) VALUES ?',
        [rows]
      );
      console.log(`✔️ Inseridos ${rows.length} registros.`);
    } catch (err) {
      console.error('❌ Erro ao inserir batch no banco:', err);
    }
    rows = [];
  };

  for (const row of jsonData) {
    rows.push([row.nome, row.email, row.idade]); 

    if (rows.length >= BATCH_SIZE) {
      await insertBatch();
    }
  }

  if (rows.length) {
    await insertBatch();
  }

  await connection.end();
  console.log('✅ Importação concluída com sucesso.');
}

importaXls().catch(console.error);
