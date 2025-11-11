# 🎬 Sistema de Gestión de Cine

Proyecto de gestión de un cine con operaciones CRUD para usuarios, películas, salas y funciones.

## 📋 Entidades del Sistema

### 👤 1. User (Usuario)

**Campos:**
- `id` - Auto-generado (MongoDB ObjectId)
- `name` - String
- `email` - String, único

**Endpoints:**
- `POST /api/users` - Crear un nuevo usuario
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `PUT /api/users/:id` - Actualizar un usuario por ID
- `DELETE /api/users/:id` - Eliminar un usuario por ID

**Validaciones:**
- El `email` debe ser único en el sistema
- El `email` debe tener un formato válido

---

### 🎥 2. Movie (Película)

**Campos:**
- `id` - Auto-generado (MongoDB ObjectId)
- `title` - String, requerido
- `director` - String
- `genre` - String
- `duration` - Number (en minutos)
- `release_year` - Number

**Endpoints:**
- `POST /api/movies` - Crear una nueva película
- `GET /api/movies` - Obtener todas las películas
- `GET /api/movies/:id` - Obtener una película por ID
- `PUT /api/movies/:id` - Actualizar una película por ID
- `DELETE /api/movies/:id` - Eliminar una película por ID

**Validaciones:**
- El `title` es obligatorio
- La `duration` debe ser un número positivo (mayor a 0)
- El `release_year` debe ser un número de 4 dígitos

---

### 🪑 3. Room (Sala)

**Campos:**
- `id` - Auto-generado (MongoDB ObjectId)
- `name` - String, único
- `capacity` - Number
- `type` - String (e.g., '2D', '3D', 'VIP')

**Endpoints:**
- `POST /api/rooms` - Crear una nueva sala
- `GET /api/rooms` - Obtener todas las salas
- `GET /api/rooms/:id` - Obtener una sala por ID
- `PUT /api/rooms/:id` - Actualizar una sala por ID
- `DELETE /api/rooms/:id` - Eliminar una sala por ID

**Validaciones:**
- El `name` (nombre de la sala) debe ser único
- La `capacity` (capacidad) debe ser un número entero positivo

---

### ⏱️ 4. Showtime (Función/Horario)

**Campos:**
- `id` - Auto-generado (MongoDB ObjectId)
- `movie_id` - ObjectId (referencia a Movie)
- `room_id` - ObjectId (referencia a Room)
- `start_time` - Date
- `end_time` - Date

**Endpoints:**
- `POST /api/showtimes` - Crear una nueva función
- `GET /api/showtimes` - Obtener todas las funciones
- `GET /api/showtimes/:id` - Obtener una función por ID
- `PUT /api/showtimes/:id` - Actualizar una función por ID
- `DELETE /api/showtimes/:id` - Eliminar una función por ID

**Validaciones:**
- Integridad referencial: Requiere la existencia de `movie_id` y `room_id`
- La hora de inicio (`start_time`) debe ser futura
- **Lógica de Negocio:** No puede haber superposición de horarios en la misma sala. No se permite otra función en la misma sala con un rango de tiempo que se cruce con la nueva función.

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://<tu_usuario>:<tu_password>@...
```

## 🧪 Pruebas

### Comandos de Ejecución

```bash
# Ejecutar todas las pruebas en paralelo
npm test

# Ejecutar pruebas con reporte de cobertura
npm test -- --coverage

# Ejecutar pruebas de forma secuencial (útil para debugging)
npm run test:sequential

# Ejecutar pruebas de un archivo específico
npm test -- user.test.js
npm test -- movie.test.js
npm test -- room.test.js
npm test -- showtime.test.js

# Ejecutar pruebas de regla
npm run lint
```

### 📊 Cobertura de Pruebas

El proyecto cuenta con **más del 90% de cobertura** en pruebas unitarias.

### 🎯 Tipos de Pruebas Implementadas

#### 1. **Pruebas de Endpoints Exitosos**
- ✅ Creación de recursos (POST)
- ✅ Lectura de recursos (GET individual y listado)
- ✅ Actualización de recursos (PUT)
- ✅ Eliminación de recursos (DELETE)

#### 2. **Pruebas de Validación**
- ❌ Campos requeridos faltantes
- ❌ Formatos inválidos (email, year, duration, etc.)
- ❌ Valores fuera de rango (números negativos, años incorrectos)
- ❌ Restricciones de unicidad (emails duplicados, nombres de salas)

#### 3. **Pruebas de Integridad Referencial**
- Validación de existencia de entidades relacionadas (movie_id, room_id)
- Manejo de referencias inexistentes

#### 4. **Pruebas de Manejo de Errores**
- IDs con formato inválido (CastError)
- Recursos no encontrados (404)
- Errores de base de datos (conexión perdida)
- Errores del servidor (500)

### 🏗️ Arquitectura de Pruebas

```
test/
├── user.test.js      
├── movie.test.js    
├── room.test.js    
└── showtime.test.js 
```

### 🔧 Configuración de Pruebas

- **Framework de Testing:** Jest 
- **Testing HTTP:** Supertest 
- **Base de Datos:** MongoDB Atlas
- **Ejecución:** Paralela por defecto para mayor velocidad
- **Aislamiento:** Cada suite de tests usa la misma base de datos pero limpia las colecciones antes de cada test

### 📝 Ejemplo de Test

```javascript
test('POST /api/users should create a new user', async () => {
    const newUser = {name: 'Luis', email: 'luis@mail.com'};
    const res = await request(app).post('/api/users').send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Luis');
});
```

### 🔄 Ciclo de Vida de los Tests

```javascript
beforeAll()   → Conectar a MongoDB
beforeEach()  → Limpiar colecciones
test()        → Ejecutar prueba individual
afterAll()    → Cerrar conexión
```


## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **Jest** - Framework de pruebas
- **Supertest** - Pruebas de API HTTP
- **ESLint** - Linter de código
