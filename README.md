# API REST — Loja Online (bd_dsapi)

Projeto acadêmico desenvolvido com Node.js, Express e MySQL. Inclui cadastro de clientes, consulta de produtos/categorias, criação e consulta de pedidos, controle de estoque e rotas administrativas protegidas por token.

## Requisitos
- Node.js 18 ou superior
- MySQL 8 (ou versão compatível)
- Postman ou Insomnia (opcional, para testar)

## 1. Criar o banco
Abra o MySQL Workbench e execute todo o arquivo `sql/schema.sql`. Ele cria o banco `bd_dsapi`, as tabelas e alguns dados de exemplo.

## 2. Configurar a aplicação
No terminal, dentro da pasta do projeto:

```bash
npm install
```

Copie `.env.example` para um arquivo chamado `.env` e ajuste os dados de acesso do seu MySQL. No Windows, pode copiar pelo Explorador de Arquivos ou executar:

```bash
copy .env.example .env
```

Edite `DB_USER`, `DB_PASSWORD` e `ADMIN_TOKEN`. Não publique o arquivo `.env` no GitHub.

## 3. Iniciar
```bash
npm start
```
A API ficará disponível em `http://localhost:3000`. Teste `GET http://localhost:3000/health` para verificar a conexão com o banco.

## Rotas
Todas as rotas usam JSON. Para operações administrativas, envie o cabeçalho `x-admin-token` com o valor definido em `ADMIN_TOKEN` no `.env`.

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/` | Público | Mensagem inicial |
| GET | `/health` | Público | Verifica conexão com banco |
| POST | `/api/clientes` | Público | Cadastra cliente |
| GET | `/api/clientes/:id` | Público | Consulta cliente por ID |
| GET | `/api/clientes` | Admin | Lista clientes |
| PUT | `/api/clientes/:id` | Admin | Atualiza cliente |
| DELETE | `/api/clientes/:id` | Admin | Exclui cliente |
| GET | `/api/categorias` | Público | Lista categorias |
| POST | `/api/categorias` | Admin | Cria categoria |
| PUT | `/api/categorias/:id` | Admin | Atualiza categoria |
| DELETE | `/api/categorias/:id` | Admin | Exclui categoria |
| GET | `/api/produtos` | Público | Lista produtos com estoque disponível |
| GET | `/api/produtos/:id` | Público | Consulta produto |
| POST | `/api/produtos` | Admin | Cadastra produto |
| PUT | `/api/produtos/:id` | Admin | Atualiza produto |
| DELETE | `/api/produtos/:id` | Admin | Exclui produto |
| POST | `/api/pedidos` | Público | Cria pedido e baixa estoque |
| GET | `/api/pedidos/:id` | Público | Consulta pedido e itens |
| GET | `/api/pedidos` | Admin | Lista pedidos |
| DELETE | `/api/pedidos/:id` | Admin | Cancela pedido e devolve estoque |

## Exemplos para Postman

### Cadastrar cliente — `POST /api/clientes`
```json
{
  "nome": "Maria Silva",
  "altura": 1.65,
  "nascimento": "2002-04-20",
  "cidade_id": 1
}
```

### Cadastrar produto — `POST /api/produtos`
Cabeçalho: `x-admin-token: troque-por-um-token-seguro` (use o token real do `.env`).
```json
{
  "nome": "Teclado USB",
  "preco": 99.9,
  "quantidade": 15,
  "categoria_id": 1
}
```

### Criar pedido — `POST /api/pedidos`
Use IDs de cliente e produto existentes no banco.
```json
{
  "cliente_id": 1,
  "endereco": "Rua Exemplo, 123 - Porto Alegre",
  "itens": [
    { "produto_id": 1, "quantidade": 2 }
  ]
}
```

### Atualizar produto — `PUT /api/produtos/1`
Cabeçalho administrativo obrigatório.
```json
{
  "nome": "Fone de ouvido",
  "preco": 89.9,
  "quantidade": 18,
  "categoria_id": 1
}
```

## Códigos HTTP usados
- `200`: consulta ou atualização concluída.
- `201`: registro criado.
- `204`: exclusão concluída sem corpo de resposta.
- `400`: dados inválidos.
- `403`: token administrativo ausente/inválido.
- `404`: recurso/rota não encontrado.
- `409`: conflito, por exemplo estoque insuficiente ou vínculo com outro registro.
- `500`: erro inesperado no servidor.

## Publicar no GitHub
1. Crie um repositório vazio no GitHub, por exemplo `api-loja-online-bd-dsapi`.
2. Não envie o arquivo `.env` nem a pasta `node_modules`.
3. Na pasta do projeto, execute:

```bash
git init
git add .
git commit -m "Adiciona API REST para loja online"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/api-loja-online-bd-dsapi.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub. Ao entregar, envie o link real do repositório criado na sua conta.

## Observações
- As rotas administrativas usam um token simples via cabeçalho para atender ao escopo didático; não substitui autenticação completa para produção.
- O diagrama fornecido não inclui e-mail/senha de clientes, então o cadastro segue as colunas apresentadas.
- O preço do item é salvo no pedido para manter o valor histórico no momento da compra.
