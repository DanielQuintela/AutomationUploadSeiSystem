export interface UserInterface {
  id_usuario           : number;
  nome                 : string;
  email                : string;
  cpf                  : string;
  sigla                : string | null;
  id_orgao             : string | undefined;
  sin_ativo            : string | undefined;
  nome_registro_civil  : string;
  sin_bloqueado        : string | undefined;
  acesso               : string;
  cargo                : string;
  departamento         : string;
  assinante            : boolean;
  certificado?          : boolean;
};

export interface UserToDBInterface {
  id_usuario           : number;
  nome                 : string;
  email                : string;
  cpf                  : string;
  sigla                : string | null;
  id_orgao             : string | undefined;
  sin_ativo            : string | undefined;
  nome_registro_civil  : string;
  sin_bloqueado        : string | undefined;
};

export interface UserPermitionsInterface {
  id_perfil            : number | undefined;
  id_sistema           : number | undefined;
  id_usuario           : number | undefined;
  id_unidade           : number | undefined;
  id_tipo_permissao    : number | undefined;
  dta_inicio           : Date;
  sin_subunidades      : string;
};
