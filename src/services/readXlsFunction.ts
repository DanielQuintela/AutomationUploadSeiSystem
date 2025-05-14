import path from 'path';
const os = require('os');
import * as XLSX from 'xlsx';
import fs from 'fs';

export default function readXlsFunction() {
    const desktopDir = path.join(os.homedir(), 'Desktop', 'upload');
    const filePath = path.resolve(desktopDir, 'usuarios.xls');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Converter a planilha para CSV
    const csvFilePath = path.resolve(__dirname, 'usuarios.csv');
    const csvData = XLSX.utils.sheet_to_csv(sheet);
    fs.writeFileSync(csvFilePath, csvData);
    
    //Retorna csv
    return csvFilePath
}