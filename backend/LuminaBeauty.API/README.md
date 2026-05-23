# Lumina Beauty Emporium — Backend C#

API REST em **ASP.NET Core 8** com **Entity Framework Core** (SQLite) e autenticação **JWT**.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Link |
|---|---|---|
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download |

> SQLite já está embutido — não precisa instalar banco de dados.

---

## Como rodar

```bash
# 1. Entre na pasta do projeto
cd LuminaBeauty.API

# 2. Instale as ferramentas de migration (uma vez só)
dotnet tool install --global dotnet-ef

# 3. Crie o banco e aplique as migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# 4. Rode a API
dotnet run
```

A API sobe em `http://localhost:5000` (ou `https://localhost:5001`).  
O **Swagger** fica em: `http://localhost:5000/swagger`

---

## Endpoints

### Auth
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Cadastrar novo usuário |
| POST | `/api/auth/login` | Público | Login, retorna JWT |
| GET | `/api/auth/me` | Autenticado | Dados do usuário logado |
| PUT | `/api/auth/me` | Autenticado | Atualizar nome/telefone |

### Produtos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/products` | Público | Listar produtos (filtros: `category`, `subcategory`, `search`) |
| GET | `/api/products/{id}` | Público | Buscar produto por ID |
| POST | `/api/products` | Admin | Criar produto |
| PUT | `/api/products/{id}` | Admin | Editar produto |
| DELETE | `/api/products/{id}` | Admin | Excluir produto |

### Pedidos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/orders` | Autenticado | Admin vê todos; cliente vê os seus |
| GET | `/api/orders/{id}` | Autenticado | Detalhe do pedido |
| POST | `/api/orders` | Autenticado | Criar pedido |
| PATCH | `/api/orders/{id}/status` | Admin | Atualizar status |

### Cupons
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/coupons` | Admin | Listar todos |
| GET | `/api/coupons/apply?code=PROMO10` | Autenticado | Validar cupom |
| POST | `/api/coupons` | Admin | Criar cupom |
| PUT | `/api/coupons/{id}` | Admin | Editar cupom |
| DELETE | `/api/coupons/{id}` | Admin | Excluir cupom |

---

## Usuário admin padrão

```
E-mail:  gerencia@lumina.com.br
Senha:   Lumina123.
```

---

## Como integrar ao frontend React

Substitua as funções do `local-store.ts` por chamadas HTTP. Exemplo:

### 1. Crie um arquivo `src/lib/api.ts`

```ts
const BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("lumina_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Erro na requisição");
  }
  return res.json();
}

// Auth
export const api = {
  register: (data: { email: string; password: string; full_name: string; phone: string }) =>
    request<{ token: string; user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => request<any>("/auth/me"),

  updateProfile: (data: { fullName: string; phone: string }) =>
    request<any>("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  // Produtos
  getProducts: (params?: { category?: string; subcategory?: string; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  saveProduct: (data: any) =>
    data.id
      ? request<any>(`/products/${data.id}`, { method: "PUT", body: JSON.stringify(data) })
      : request<any>("/products", { method: "POST", body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  // Pedidos
  getOrders: () => request<any[]>("/orders"),
  createOrder: (data: any) => request<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Cupons
  getCoupons: () => request<any[]>("/coupons"),
  applyCoupon: (code: string) => request<any>(`/coupons/apply?code=${code}`),
  saveCoupon: (data: any) =>
    data.id
      ? request<any>(`/coupons/${data.id}`, { method: "PUT", body: JSON.stringify(data) })
      : request<any>("/coupons", { method: "POST", body: JSON.stringify(data) }),
  deleteCoupon: (id: string) =>
    request<void>(`/coupons/${id}`, { method: "DELETE" }),
};
```

### 2. Salve o token após login

```ts
const { token, user } = await api.login(email, password);
localStorage.setItem("lumina_token", token);
```

---

## Estrutura do projeto

```
LuminaBeauty.API/
├── Controllers/
│   ├── AuthController.cs       # /api/auth
│   ├── ProductsController.cs   # /api/products
│   ├── OrdersController.cs     # /api/orders
│   └── CouponsController.cs    # /api/coupons
├── Data/
│   └── AppDbContext.cs         # EF Core + seed de dados
├── DTOs/
│   └── DTOs.cs                 # Request/Response records
├── Models/
│   └── Models.cs               # Entidades: User, Product, Order, Coupon
├── Services/
│   └── JwtService.cs           # Geração de tokens JWT
├── Program.cs                  # Configuração da aplicação
├── appsettings.json            # Configurações (JWT secret, connection string)
└── lumina.db                   # Banco SQLite (criado ao rodar migrations)
```

---

## ⚠️ Antes de entregar o projeto

1. **Troque o `Jwt:Secret`** no `appsettings.json` por uma string longa e aleatória.
2. Para produção, substitua SQLite por SQL Server: mude o `UseSqlite` para `UseSqlServer` no `Program.cs` e ajuste a connection string.
