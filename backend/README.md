# PedagoPass Backend (Standalone)

Servidor Node.js (Express + TypeScript) para autenticação e comunidades, com persistência em arquivo `.data/db.json`.

## Banco de dados (MySQL)

Configure `DATABASE_URL` no arquivo `.env` dentro da pasta `backend/`. Exemplo:

```
DATABASE_URL="mysql://usuario:senha@host:3306/banco"
```

Depois, gere o cliente e aplique o schema:

```
npm run prisma:generate
npm run prisma:push
```

Em produção, use `npm run prisma:migrate` para aplicar migrations criadas previamente.

## Endpoints

- GET `/health` — Health check
- POST `/auth/signup` — { nome, email, senha } → { ok, token, user }
- POST `/auth/login` — { email, senha } → { ok, token, user }
- POST `/auth/logout` — noop (descartar token no cliente)
- GET `/me` — precisa header `Authorization: Bearer <token>` → { user }
- GET `/communities` — lista de comunidades com detalhes (nome, descrição, tags, capa)
- POST `/communities/:slug/join` — requer token → { ok }
- DELETE `/communities/:slug/join` — requer token → { ok }
- GET `/me/communities` — requer token → { communities: string[] }
	- Dica: use também `GET /communities` para mapear os slugs aos detalhes

Seeding do banco:

- Execute `npm run prisma:generate` e `npm run prisma:push`.
- Popule comunidades iniciais com `npm run prisma:seed` (usa `prisma/seed.ts`).

Reservas e compras
- GET `/reservations/me` — lista reservas do usuário
- GET `/reservations/:id` — reserva por id
- POST `/reservations` — cria reserva; body: { destinoSlug, destinoNome, destinoImagem?, ida, volta, pessoas, formaPagamento?, totalEstimado }
- PATCH `/reservations/:id/status` — body: { status: "pendente" | "confirmada" | "cancelada" }
- GET `/orders/me` — lista compras do usuário
- GET `/orders/:id` — compra por id
- GET `/orders/by-reservation/:reservationId` — compra vinculada à reserva
- POST `/orders/mark-paid` — body: { reservationId, metodo, parcelas? } → cria order e confirma a reserva

Obs.: A lista de comunidades aqui é mínima (slugs). Você pode integrar uma fonte real (banco de dados) ou sincronizar com o front.

## Como rodar (Windows cmd)

1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Instale as dependências:

```cmd
cd backend
npm install
```

3. Ambiente de desenvolvimento (hot-reload):

```cmd
npm run dev
```

O servidor sobe em `http://localhost:4000` (ajuste `PORT` no `.env`).

## Notas de arquitetura

- Persistência: arquivo JSON em `backend/.data/db.json`. Em produção, use um banco real (Postgres/Supabase/etc.).
- Autenticação: JWT no header Authorization. Tokens expiram em 30 dias.
- CORS: configure `CORS_ORIGIN` no `.env` com a origem do seu front.
- Segurança: as senhas são hash SHA-256 apenas para demonstração. Em produção, troque por bcrypt/argon2.

## Próximos passos

- Adicionar domínios de dados (reservas, pedidos) com suas rotas.
- Conectar a um banco real com migrations.
- Sincronizar a lista de comunidades com uma coleção persistida.
