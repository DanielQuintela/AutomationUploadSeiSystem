import dbConnection from "./database/connection";
import { getPerfilId } from "./utils/getPerfilIds";

export default async function userPermitions(usuarios: any) { 
    const connection = await dbConnection();
    
    console.log( getPerfilId("colaborador"));
    
}