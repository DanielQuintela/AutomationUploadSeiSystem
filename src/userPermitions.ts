import dbConnection from "./database/connection";
import { UserInterface } from "./types/users";
import getCurrentDate from "./utils/getDataTime";
import { getUnitID } from "./utils/getUnitID";
import { getPerfilId } from "./utils/getPerfilIds";
import { UploadUserPermitions } from "./repository/userRepository";

export default async function userPermitions(usuarios: UserInterface[]) { 
    const connection = await dbConnection();
    const permitions:any[] = []
    
    console.log( getPerfilId("colaborador"));
    
    for (let i = 0; i < usuarios.length ; i++) {

        const acesso = usuarios[i].acesso.toLocaleLowerCase().replace(/\s+/g, '');
        const unidade = usuarios[i].departamento.toLocaleLowerCase().replace(/\s+/g, '');

        const id_perfil = getPerfilId(acesso);
        const id_unidade = getUnitID(unidade);
        
        const id_usuario = usuarios[i].id_usuario;
        const id_sistema = process.env.ID_SISTEMA;
        const id_tipo_permissao = 1
        const sin_subunidades = process.env.SIN_SUBUNIDADES
        const dta_inicio = getCurrentDate();
        
        permitions.push([
            id_perfil,
            id_sistema,
            id_usuario,
            id_unidade,
            id_tipo_permissao,
            dta_inicio,
            sin_subunidades
        ]);
    };

    await UploadUserPermitions(permitions);
    
}

