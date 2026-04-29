# Plan de Implementación del Backend: Autenticación con Google OAuth

> Este documento describe los cambios necesarios en el backend (API en `localhost:8080`) para soportar el login exclusivo con Google implementado en el frontend Next.js mediante **Auth.js v5** con estrategia **JWT**.

---

## 1. Arquitectura Elegida

- **Frontend**: Auth.js v5 (`next-auth@beta`) maneja todo el flujo OAuth con Google.
- **Sesión**: JWT firmado por Auth.js, almacenado en cookie `httpOnly` (`authjs.session-token`).
- **Backend**: Recibe la cookie en cada request, valida el JWT con la clave compartida `AUTH_SECRET`, y extrae la identidad del usuario.

---

## 2. Tabla / Colección de Usuarios

Crear una entidad `users` con los siguientes campos mínimos:

| Campo       | Tipo                    | Restricciones              | Descripción                          |
|-------------|-------------------------|----------------------------|--------------------------------------|
| `id`        | UUID / SERIAL           | PRIMARY KEY                | ID interno del backend               |
| `email`     | VARCHAR(255)            | UNIQUE, NOT NULL           | Email de Google                      |
| `name`      | VARCHAR(255)            |                            | Nombre completo de Google            |
| `image`     | TEXT                    |                            | URL del avatar de Google             |
| `googleId`  | VARCHAR(255)            | UNIQUE                     | ID único de Google (`sub`)           |
| `role`      | VARCHAR(50)             | DEFAULT 'user'             | Rol para control de acceso futuro    |
| `createdAt` | TIMESTAMP / TIMESTAMPTZ | DEFAULT now()              | Fecha de creación                    |
| `updatedAt` | TIMESTAMP / TIMESTAMPTZ | DEFAULT now()              | Fecha de última actualización        |

> **Nota**: El campo `email` es el identificador principal. `googleId` sirve como referencia cruzada adicional.

---

## 3. Endpoints Requeridos

### 3.1 `POST /auth/sync` — IMPORTANTE: Sin autenticación JWT

**Propósito**: Sincronizar o crear un usuario después de que el frontend complete el login con Google.

**⚠️ CRÍTICO**: Este endpoint **NO debe requerir autenticación JWT**. Es llamado directamente por el servidor de Next.js desde el callback `signIn` de Auth.js, **antes** de que la cookie de sesión se establezca en el navegador. Por lo tanto, no hay cookie `authjs.session-token` disponible en este momento.

**Opciones de seguridad para este endpoint**:
1. **Recomendada**: No requerir auth. Aceptar los datos del usuario directamente. El endpoint solo crea/actualiza usuarios, no expone datos sensibles.
2. **Alternativa**: Validar un header `X-Internal-Api-Key` compartido entre frontend y backend.
3. **Alternativa**: Verificar que la request provenga de la IP interna/red local del frontend.

**Request Body**:
```json
{
  "email": "stiven@example.com",
  "name": "Stiven Valeriano",
  "image": "https://lh3.googleusercontent.com/a-/...",
  "googleId": "123456789012345678901"
}
```

**Lógica**:
1. Buscar usuario por `email`.
2. Si no existe, crearlo con los datos proporcionados.
3. Si existe, actualizar `name`, `image`, `googleId` (si cambió) y `updatedAt`.
4. Devolver el usuario completo.

**Response 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "stiven@example.com",
  "name": "Stiven Valeriano",
  "image": "https://lh3.googleusercontent.com/a-/...",
  "googleId": "123456789012345678901",
  "role": "user",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Response 500 Error**:
```json
{
  "error": "Internal server error"
}
```

---

### 3.2 `GET /auth/me` (Opcional pero recomendado)

**Propósito**: Devolver la información del usuario autenticado validando la cookie de sesión.

**Headers requeridos**:
```
Cookie: authjs.session-token=<jwt_token>
```

**Lógica**:
1. Leer el header `Cookie`.
2. Extraer el valor de `authjs.session-token`.
3. Verificar la firma del JWT usando `AUTH_SECRET`.
4. Extraer el `email` del payload del JWT.
5. Buscar el usuario en la base de datos por `email`.
6. Devolver los datos del usuario.

**Response 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "stiven@example.com",
  "name": "Stiven Valeriano",
  "image": "https://...",
  "role": "user"
}
```

**Response 401 Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

---

## 4. Validación del JWT en Endpoints Protegidos

Todos los endpoints existentes (`/post/*`) y futuros deben requerir autenticación **excepto** `POST /auth/sync`.

### 4.1 Extraer el Token

El frontend envía la cookie automáticamente en cada request al dominio de Next.js (`localhost:3000`). Next.js reescribe las requests de `/api/*` al backend y **reenvía los headers originales incluyendo `Cookie`**. Por lo tanto, el backend recibe:

```
Cookie: authjs.session-token=<jwt_value>; otras_cookies=...
```

### 4.2 Verificar el JWT

El JWT está firmado con **HS256** usando el `AUTH_SECRET` compartido.

**Payload típico del JWT de Auth.js**:
```json
{
  "name": "Stiven Valeriano",
  "email": "stiven@example.com",
  "picture": "https://...",
  "sub": "1234567890",
  "iat": 1705312000,
  "exp": 1707904000
}
```

> El campo `sub` es el ID interno de Auth.js (no el `googleId`). El `email` es el identificador más confiable para buscar al usuario en tu base de datos.

### 4.3 Implementación por Lenguaje

#### Node.js (jsonwebtoken)
```js
const jwt = require('jsonwebtoken');
const AUTH_SECRET = process.env.AUTH_SECRET;

function verifyAuthToken(cookieHeader) {
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
  
  const token = cookies['authjs.session-token'];
  if (!token) return null;
  
  try {
    return jwt.verify(token, AUTH_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
```

#### Python (PyJWT)
```python
import jwt
from flask import request

AUTH_SECRET = os.environ['AUTH_SECRET']

def verify_auth_token():
    cookie_header = request.headers.get('Cookie', '')
    cookies = dict(c.split('=', 1) for c in cookie_header.split('; ') if '=' in c)
    token = cookies.get('authjs.session-token')
    
    if not token:
        return None
    
    try:
        return jwt.decode(token, AUTH_SECRET, algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return None
```

#### Go (golang-jwt)
```go
import (
    "strings"
    "github.com/golang-jwt/jwt/v5"
)

func verifyAuthToken(cookieHeader string) (*jwt.Token, error) {
    cookies := parseCookies(cookieHeader)
    tokenString, ok := cookies["authjs.session-token"]
    if !ok {
        return nil, fmt.Errorf("missing session token")
    }
    
    return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("AUTH_SECRET")), nil
    }, jwt.WithValidMethods([]string{"HS256"}))
}
```

---

## 5. Variables de Entorno del Backend

Añadir las siguientes variables al `.env` del backend:

```env
# Debe ser EXACTAMENTE el mismo valor que en el frontend (Next.js)
AUTH_SECRET=tu-secreto-largo-y-aleatorio-minimo-32-caracteres

# Google OAuth (solo si el backend valida directamente con Google)
# En la Opción A no es estrictamente necesario, pero útil para debugging
GOOGLE_CLIENT_ID=tu-google-oauth-client-id
GOOGLE_CLIENT_SECRET=tu-google-oauth-client-secret
```

> **CRÍTICO**: `AUTH_SECRET` debe ser idéntico en ambos servicios. Auth.js lo usa para firmar el JWT; el backend lo usa para verificarlo. Si difieren, la autenticación fallará.

---

## 6. Flujo Completo de Autenticación

```
Usuario hace clic en "Continue with Google"
         │
         ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js       │────►│   Google     │────►│  Usuario    │
│  (Auth.js)      │     │   OAuth      │     │  autoriza   │
└─────────────────┘     └──────────────┘     └─────────────┘
         │
         │ Google redirige con código
         ▼
┌─────────────────┐
│  /api/auth/     │  Auth.js valida código con Google
│  callback/      │  Genera JWT firmado
│  google         │  Ejecuta signIn callback
└─────────────────┘
         │
         │ callback signIn:
         │ fetch POST /auth/sync (sin cookie, servidor→servidor)
         ▼
┌─────────────────┐
│   Backend       │  Crea/actualiza usuario
│  /auth/sync     │  (NO requiere JWT)
└─────────────────┘
         │
         │ Respuesta con Set-Cookie: authjs.session-token=...
         ▼
┌─────────────────┐
│   Navegador     │  Almacena cookie
└─────────────────┘
         │
         │ Requests posteriores a /api/post/*
         │ (cookie automática + credentials: include)
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────►│   Backend       │
│  Rewrite /api/* │     │  Valida JWT     │
│  (reenvía       │     │  con AUTH_SEC   │
│   headers       │     │  RET y Cookie)  │
│   incluidos)    │     └─────────────────┘
└─────────────────┘
```

---

## 7. CORS (Si aplica)

Si el frontend (`http://localhost:3000`) y el backend (`http://localhost:8080`) corren en diferentes orígenes, el backend debe permitir credenciales (cookies) en CORS:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

> **Importante**: `Access-Control-Allow-Origin` no puede ser `*` cuando `Access-Control-Allow-Credentials: true`. Debe ser el origen exacto del frontend.

---

## 8. Endpoints del Backend a Proteger

Proteger con validación JWT (leer cookie `authjs.session-token`):

- `GET /post/getAll`
- `POST /post/create`
- `GET /post/getPost/:id`
- `PUT /post/update`
- `DELETE /post/delete/:id`
- `POST /post/uploadImage`
- `GET /auth/me`

**NO proteger** (accesible sin JWT):
- `POST /auth/sync` — Endpoint de registro llamado por el servidor Next.js

---

## 9. Notas de Seguridad

- `AUTH_SECRET` debe tener al menos **32 caracteres** aleatorios. Generar con: `openssl rand -base64 32`.
- En producción, usar **HTTPS** obligatoriamente. Auth.js usa `__Secure-` prefix para cookies en HTTPS.
- La cookie `authjs.session-token` es `httpOnly` por defecto (el frontend JavaScript no puede leerla), lo que previene XSS.
- No exponer `AUTH_SECRET` en logs ni en repositorios públicos.
- Considerar implementar rate limiting en `/auth/sync` para prevenir abuso.

---

## 10. Checklist de Implementación Backend

- [ ] Crear tabla/colección `users`.
- [ ] Implementar `POST /auth/sync` (sin requerir JWT).
- [ ] Implementar `GET /auth/me` (requiere JWT válido).
- [ ] Implementar función middleware/utility para verificar JWT (`authjs.session-token`).
- [ ] Aplicar verificación JWT a todos los endpoints protegidos.
- [ ] Configurar CORS con credenciales habilitadas.
- [ ] Añadir `AUTH_SECRET` al `.env` del backend (mismo valor que frontend).
- [ ] Probar flujo completo: login → sync → request protegido.
