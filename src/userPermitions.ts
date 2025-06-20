import { UserInterface, UserPermitionsInterface } from "./types/users";
import getCurrentDate from "./utils/getDataTime";
import { getUnitID } from "./utils/getUnitID";
import { getPerfilId } from "./utils/getPerfilIds";
import { UploadUserPermitions } from "./repository/userRepository";

export default async function userPermitions(usuarios: UserInterface[]) { 
    const permitions:UserPermitionsInterface[] = []
    let id_perfil;
    
    for (let i = 0; i < usuarios.length ; i++) {

        const acesso = usuarios[i].acesso.toLocaleLowerCase().replace(/\s+/g, '');
        const unidade = usuarios[i].departamento.toLocaleLowerCase().replace(/\s+/g, '');

        // Lógica para separar colaborador assinante e não assinante
        if (acesso === "colaborador" || acesso === "colaboradorsga") {
            const assinante = usuarios[i].assinante;            
            if (assinante === true) {
                id_perfil = getPerfilId('basicosei');
            } else {
                id_perfil = getPerfilId(acesso);
            }
        } else {
            id_perfil = getPerfilId(acesso);
        };

        const id_unidade = getUnitID(unidade);
        const id_usuario = usuarios[i].id_usuario;
        const id_sistema = process.env.ID_SISTEMA ? Number(process.env.ID_SISTEMA) : undefined;
        const sin_subunidades = process.env.SIN_SUBUNIDADES || '';
        const dta_inicio = new Date(getCurrentDate()); 
        const id_tipo_permissao = 1;
        
        permitions.push({
            id_perfil: id_perfil,
            id_sistema: id_sistema,
            id_usuario: id_usuario,
            id_unidade: id_unidade,
            id_tipo_permissao: id_tipo_permissao,
            dta_inicio: dta_inicio,
            sin_subunidades: sin_subunidades
        });
    };

    // console.log(permitions.length);
    
    await UploadUserPermitions(permitions);
}

