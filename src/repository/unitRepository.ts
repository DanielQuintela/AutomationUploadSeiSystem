import dbConnection from "../database/connection";
import { UnitInterface } from "../types/units";


export async function uploadUnits(units: UnitInterface[]) {
    const connection = await dbConnection();
    try {
        const unitsArray = units.map(unit => [
            unit.id_unidade,
            unit.id_orgao,
            unit.sigla,
            unit.descricao,
            unit.sin_ativo,
            unit.sin_global,
        ]);

        await connection.query(
            `INSERT INTO ${process.env.UNIT_DB} (id_unidade, id_orgao, sigla, descricao, sin_ativo, sin_global) VALUES ?`,
            [unitsArray]
        );
        console.log(`✅ Inseridas ${units.length} unidades no banco.!!`);
    } catch (error) {
        console.error('❌ Erro ao inserir unidades:', error);
    } finally {
        await connection.end();
    }
}