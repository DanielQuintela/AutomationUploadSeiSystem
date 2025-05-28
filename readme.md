# Automação de Importação de Usuários (MySQL + XLS)

Este projeto automatiza a leitura de um arquivo `.xls` contendo dados de usuários e importa as informações diretamente para um banco de dados MySQL.

---

## 📁 Estrutura Esperada

O script espera encontrar um arquivo chamado:

```
usuarios.xls
```

Localizado na pasta:

```
Área de Trabalho/Upload
```

Do **usuário atual do sistema**.

---

## 📦 Tecnologias Utilizadas

- Node.js
- MySQL2 (modo `promise`)
- XLS (via `xlsx` ou equivalente)
- ESModules/TypeScript (transpilado para JS)

---

## 🚀 Como executar

### 1. Instale as dependências

```bash
npm install
```

### 2. Compile o TypeScript (se necessário)

```bash
npx tsc
```

### 3. Execute o script

```bash
npm start
```

Ou diretamente com Node:

```bash
node dist/scriptConversor.js
```

---

## 🔧 Configuração de Conexão com o Banco de Dados

Este projeto utiliza variáveis de ambiente para configurar a conexão com o banco de dados. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DB_HOST=
DB_PORT=
DATABASE=
DB_USER=
DB_PASSWORD=

# Parâmetros adicionais usados no cadastro
SIN_ATIVO=
SIN_BLOQUEADO=
ID_ORGAO=
```

---
> ⚠️ A cada novo upload de dados para o banco, deve ser  inserido no `dotenv` o id do Ogao e os status do Sin
##
> ⚠️ O script só funcionará corretamente se essas variáveis forem definidas.

---


## ✅ Funcionamento

- O script localiza o arquivo `usuarios.xls` no caminho padrão.
- Os dados são lidos e tratados conforme o esperado.
- Cada usuário é inserido na base de dados `sip`.
- O script localiza o arquivo `unidades.xls`.
- Os dados são lidos e armazenados conforme os órgãos no `.env`.

---

## 📌 Observações

- Certifique-se de que o MySQL está conectado.
- O script está preparado para uso local; para produção ou acesso remoto, configure host, firewall e permissões adequadamente.

---

## 📄 Licença

Projeto de uso interno. Adapte conforme necessário.
