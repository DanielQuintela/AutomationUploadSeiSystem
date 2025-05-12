export interface UserInterface {
  id_usuario: number;
  nome: string;
  email: string;
  cpf: string;
  sigla: string | null;
  id_orgao: string | undefined;
  sin_ativo: string | undefined;
  nome_registro_civil: string;
  sin_bloqueado: string | undefined;
  acesso: string;
  cargo: string;
  departamento: string;
}
