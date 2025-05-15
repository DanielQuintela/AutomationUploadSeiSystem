import dbConnection from "../database/connection";
import { UserPermitionsInterface, UserToDBInterface } from "../types/users";

export async function uploadUsers(usuarios: UserToDBInterface[]) {
    const connection = await dbConnection();
    try {
        const usuariosArray = usuarios.map(user => [
            user.id_usuario,
            user.nome,
            user.email,
            user.cpf,
            user.sigla,
            user.id_orgao,
            user.sin_ativo,
            user.nome_registro_civil,
            user.sin_bloqueado
        ]);

        await connection.query(
            `INSERT INTO ${process.env.USER_DB} (id_usuario, nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`,
            [usuariosArray]
        );
        console.log(`✅ Inseridos ${usuarios.length} usuários no banco.!!`);
    } catch (error) {
        console.error('❌ Erro ao inserir usuários:', error);
    } finally {
        await connection.end();
    }
}

export async function UploadUserPermitions(permitions: UserPermitionsInterface[]) {
    const connection = await dbConnection();

    try {
        const permitionsArray = permitions.map(permission => [
            permission.id_perfil,
            permission.id_sistema,
            permission.id_usuario,
            permission.id_unidade,
            permission.id_tipo_permissao,
            permission.dta_inicio,
            permission.sin_subunidades
        ]);

        await connection.query(
            `INSERT INTO ${process.env.PERMISSION_DB} (id_perfil, id_sistema, id_usuario, id_unidade, id_tipo_permissao, dta_inicio, sin_subunidades) VALUES ?`,
            [permitionsArray]
        );
        console.log(`✅ Inseridas ${permitions.length} permissões no banco.!!`);
    } catch (error) {
        await connection.end();
        console.error('❌ Erro ao inserir permissões:', error);
    } finally {
        await connection.end();
    }
}