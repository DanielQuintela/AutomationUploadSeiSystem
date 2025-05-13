import dbConnection from "../database/connection";
import { UserPermitionsInterface, UserToDBInterface } from "../types/users";

export async function uploadUsers(usuarios: UserToDBInterface[]){
    const connection = await dbConnection();
    try {
    await connection.query(
      `INSERT INTO ${process.env.USER_DB} (id_usuario, nome, email, cpf, sigla, id_orgao, sin_ativo, nome_registro_civil, sin_bloqueado) VALUES ?`,
      [usuarios]
    );
    console.log(`✅ Inseridos ${usuarios.length} usuários no banco.!!`);
  } catch (error) {
    console.error('❌ Erro ao inserir usuários:', error);
  } finally {
    await connection.end();
  }
}

export async function UploadUserPermitions(permitions: UserPermitionsInterface[]){
   const connection = await dbConnection();
console.log(permitions);

   try {
    await connection.query(
      `INSERT INTO ${process.env.PERMISSION_DB} (id_perfil, id_sistema, id_usuario, id_unidade, id_tipo_permissao, dta_inicio, sin_subunidades) VALUES ?`,
      [permitions]
    );
    console.log(`✅ Inseridas ${permitions.length} permissões no banco.!!`);
  } catch (error) {
    console.error('❌ Erro ao inserir permissões:', error);
  } finally {
    await connection.end();
  }
}