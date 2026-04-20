# API Reference — stvCms

**Base URL:** `http://localhost:8080`  
**Content-Type:** `application/json` (salvo endpoints de imagen)  
**Actualizado:** 2026-04-20

---

## Autenticación (OAuth con Google)

El sistema usa sesiones con cookie `user-session`. No se requiere token Bearer en los endpoints de posts.

### `GET /auth/`
Página de login (HTML).

### `GET /auth/google`
Inicia el flujo OAuth con Google. Redirigir al usuario a esta URL.

### `GET /auth/google/callback`
Callback automático de Google. No llamar directamente.  
Al completar, guarda sesión y redirige a `/auth/success`.

### `GET /auth/success`
Página de éxito post-login. Requiere cookie de sesión activa.

**Datos de sesión disponibles:** `email`, `name`, `avatar`

---

## Posts

### `POST /post/create`
Crea un nuevo post.

**Request body:**
```json
{
  "title": "Mi primer post",
  "user_id": "user@example.com",
  "is_visible": true,
  "content_blocks": [
    {
      "type": "text",
      "order": 1,
      "content": "Contenido del bloque"
    },
    {
      "type": "code",
      "order": 2,
      "content": "console.log('hola')",
      "language": "javascript"
    }
  ]
}
```

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `title` | string | ✅ | |
| `user_id` | string | ✅ | Identificador del autor |
| `is_visible` | boolean | ❌ | Default: `true` |
| `content_blocks` | array | ❌ | Ver tipos abajo |

**Tipos de content block:** `text` · `code` · `image` · `url`

**Respuestas:**
- `201` → `"Post creado"`
- `400` → `{ "error": "..." }`
- `500` → `{ "error": "..." }`

**Nota:** Invalida el caché Redis de posts.

---

### `GET /post/getAll`
Retorna todos los posts. Resultado cacheado 24 horas.

**Respuesta `200`:**
```json
[
  {
    "id": 1,
    "createdAt": "2026-04-20T10:00:00Z",
    "updatedAt": "2026-04-20T10:00:00Z",
    "title": "Mi post",
    "userId": "user@example.com",
    "isVisible": true,
    "contentBlocks": [
      {
        "id": 1,
        "type": "text",
        "order": 1,
        "content": "Texto del bloque",
        "language": ""
      }
    ]
  }
]
```

---

### `GET /post/getPost/:id`
Retorna un post por su ID numérico.

**Path param:** `id` (integer)

**Respuestas:**
- `200` → Objeto `PostResponse` (misma estructura que el array de `getAll`)
- `400` → ID inválido
- `500` → Error interno

---

### `POST /post/getPost/:filter`
Busca posts por título, `user_id` o contenido de bloques.

**Path param:** `filter` (string, término de búsqueda)

**Respuesta `200`:** Array de `PostResponse` que coincidan con el filtro.

**Respuestas de error:**
- `400` → Filtro vacío
- `500` → Error interno

---

### `PUT /post/update`
Actualiza un post existente.

**Request body:**
```json
{
  "id": 1,
  "title": "Título actualizado",
  "content_blocks": [
    {
      "type": "text",
      "order": 1,
      "content": "Nuevo contenido"
    }
  ]
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `id` | integer | ✅ |
| `title` | string | ❌ |
| `content_blocks` | array | ❌ |

**Respuestas:**
- `200` → `"Post actualizado"`
- `400` → Body inválido
- `500` → Error interno

**Nota:** Invalida el caché Redis de posts.

---

### `DELETE /post/delete/:id`
Elimina un post por ID.

**Path param:** `id` (integer)

**Respuestas:**
- `204` → `{ "message": "Deleted" }`
- `500` → Error interno

**Nota:** Invalida el caché Redis de posts.

---

## Imágenes

### `POST /post/uploadImage`
Sube una imagen para usar en un post.

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Notas |
|---|---|---|
| `image` | file | JPEG, PNG o GIF · Máx 10 MB |

La imagen se redimensiona automáticamente si supera 3 MB o 1920×1920 px.

**Respuesta `200`:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Respuestas de error:**
- `400` → Archivo inválido o formato no soportado
- `500` → Error al guardar

---

### `GET /post/image/:filename`
Retorna la imagen subida.

**Path param:** `filename` (string, valor de `filename` retornado por `uploadImage`)

**Respuesta `200`:** Bytes de la imagen con `Content-Type: image/jpeg`

---

## Generación de texto con IA

### `GET /post/genTextAI`
Genera texto para un post usando IA (OpenRouter).

**Request body:**
```json
{
  "text_ai": "Escribe sobre los beneficios de usar Go en backend"
}
```

**Respuesta `200`:** String con el texto generado (incluye secciones y markup HTML).

**Respuestas de error:**
- `400` → Campo `text_ai` vacío
- `500` → Error con el proveedor de IA

---

## Manejo de errores

Todos los errores retornan el mismo formato:
```json
{
  "error": "descripción del error"
}
```

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Creado |
| `204` | Sin contenido (DELETE exitoso) |
| `400` | Request inválido (validación / body malformado) |
| `500` | Error interno del servidor |
