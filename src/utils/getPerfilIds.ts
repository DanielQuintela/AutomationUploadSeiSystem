import { perfilMap } from '../config/perfilMap';

export function getPerfilId(perfil: string): number | undefined {
  return perfilMap[perfil];
}
