import dbConnection from "./database/connection";
import { UserInterface } from "./types/users";
import { getPerfilId } from "./utils/getPerfilIds";

export default async function userPermitions(usuarios: UserInterface[]) { 
    const connection = await dbConnection();
    
    console.log( getPerfilId("colaborador"));

    for (let i = 0; i < usuarios.length ; i++) {
        console.log(usuarios[i].cargo);
        
    }
    
}