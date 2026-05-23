# Lumina Beauty Emporium

Projeto fullstack de e-commerce de beleza desenvolvido com React no frontend e ASP.NET Core no backend.

---

## Estrutura do Projeto

```
LuminaBeauty/
├── frontend/    → Aplicação React + Vite
└── backend/     → API REST ASP.NET Core 8 + SQLite
```

---

## Pré-requisitos

| Ferramenta | Versão | Link |
|---|---|---|
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download/dotnet/8.0 |
| Node.js | 20+ | https://nodejs.org |

---

## Como Rodar

### 1. Backend

Abra um terminal e execute:

```bash
cd backend
dotnet restore
dotnet run
```

A API estará disponível em `http://localhost:5000`  
Swagger disponível em `http://localhost:5000/swagger`

### 2. Frontend

Abra um segundo terminal e execute:

```bash
cd frontend
npm install
npm run dev
```

O site estará disponível em `http://localhost:8080`

---

## Usuário Admin

```
E-mail: gerencia@lumina.com.br
Senha:  Lumina123.
```

---

## Tecnologias Utilizadas

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- ASP.NET Core 8
- Entity Framework Core
- SQLite
- JWT Authentication
- Swagger
