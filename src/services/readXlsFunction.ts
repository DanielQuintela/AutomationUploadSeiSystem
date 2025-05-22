import path from 'path';
const os = require('os');
import * as XLSX from 'xlsx';
import fs from 'fs';
import iconv from 'iconv-lite';

function readUserXlsFunction() {
    const desktopDir = path.join(os.homedir(), 'Desktop', 'upload');
    const filePath = path.resolve(desktopDir, 'usuarios.xls');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Converter a planilha para CSV
    const csvFilePath = path.resolve(__dirname, 'usuarios.csv');
    const csvData = XLSX.utils.sheet_to_csv(sheet);
    fs.writeFileSync(csvFilePath, csvData, { encoding: 'utf8' });

    return csvFilePath
}

function readUnitFunction() {
    const desktopDir = path.join(os.homedir(), 'Desktop', 'upload');
    const filePath = path.resolve(desktopDir, 'unidades.xls');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvFilePath = path.resolve(__dirname, 'unidades.csv');
    const csvData = XLSX.utils.sheet_to_csv(sheet);

    const csvBuffer = iconv.encode(csvData, 'utf8');
    fs.writeFileSync(csvFilePath, csvBuffer);

    
    return csvFilePath
}

export { readUserXlsFunction, readUnitFunction }