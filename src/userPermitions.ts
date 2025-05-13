import dbConnection from "./database/connection";
import { UserInterface } from "./types/users";
import getCurrentDate from "./utils/getDataTime";
import { getUnitID } from "./utils/getUnitID";
import { getPerfilId } from "./utils/getPerfilIds";

export default async function userPermitions(usuarios: UserInterface[]) { 
    const connection = await dbConnection();
    const permitions:any[] = []
    
     // TOOD: NÃO SUBIR ESSE ARQUIVO NO MERGE
    for (let i = 0; i < usuarios.length ; i++) {

        const acesso = usuarios[i].acesso.toLocaleLowerCase().replace(/\s+/g, '');
        const unidade = usuarios[i].departamento.toLocaleLowerCase().replace(/\s+/g, '');

        const id_perfil = getPerfilId(acesso);
        const id_unidade = getUnitID(unidade);

        console.log(acesso);
        console.log(id_perfil);

        console.log(unidade)
        console.log(id_unidade);
       
        
    }
    
}

