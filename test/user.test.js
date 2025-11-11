require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./../src/app.js');
const User = require('./../src/models/user.model.js');

// Conectar a una base de datos 
beforeAll(async () => {
    // Si ya hay conexión, cerrarla
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    
    const dbUri = process.env.MONGODB_URI;
    await mongoose.connect(dbUri);
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
    await User.deleteMany({});
});

// Desconectar después de todos los tests
afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('User API', () => {

    // prueba de que get devuelva una lista vacia inicialmente
    test('GET /api/users should return an empty list initially', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // prueba de que post cree un nuevo usuario correctamente
    test('POST /api/users should create a new user', async () => {
        const newUser = {name: 'Luis', email: 'luis@mail.com'};
        const res = await request(app).post('/api/users').send(newUser);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id'); // MongoDB usa _id
        expect(res.body.name).toBe('Luis');
    });

    // prueba de que post falle si los datos estan incompletos
    test('POST /api/users should fail if incomplete data', async () => {
        const res = await request(app).post('/api/users').send({name: 'Pepito'});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Name and email are required');
    });

    // prueba de que post falle si el formato del email es invalido
    test('POST /api/users should fail if email format is invalid', async () => {
        const res = await request(app).post('/api/users').send({
            name: 'Juan',
            email: 'correo-invalido'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Please provide a valid email');
    });

    // prueba de que post falle si el email ya existe
    test('POST /api/users should fail if email already exists', async () => {
        const newUser = {name: 'Pedro', email: 'pedro@mail.com'};
        
        // Crear primer usuario
        await request(app).post('/api/users').send(newUser);
        
        // Intentar crear otro usuario con el mismo email
        const res = await request(app).post('/api/users').send({
            name: 'Otro Pedro',
            email: 'pedro@mail.com'
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    // prueba de GET por ID exitoso
    test('GET /api/users/:id should return a user by id', async () => {
        // Crear un usuario primero
        const newUser = {name: 'Maria', email: 'maria@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body._id; // MongoDB usa _id

        // Obtener el usuario por ID
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Maria');
    });

    // prueba de GET por ID cuando no existe
    test('GET /api/users/:id should return 404 if user not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).get(`/api/users/${fakeId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // Prueba de GET con ID inválido (CastError)
    test('GET /api/users/:id should return 404 with invalid ID', async () => {
        const res = await request(app).get('/api/users/invalid-id-format');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // prueba de PUT para actualizar un usuario
    test('PUT /api/users/:id should update a user', async () => {
        // Crear usuario
        const newUser = {name: 'Carlos', email: 'carlos@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body._id; // MongoDB usa _id

        // Actualizar usuario
        const updatedUser = {name: 'Carlos Actualizado', email: 'carlos.nuevo@mail.com'};
        const res = await request(app).put(`/api/users/${userId}`).send(updatedUser);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Carlos Actualizado');
        expect(res.body.email).toBe('carlos.nuevo@mail.com');
    });

    // prueba de PUT que falle cuando el usuario no existe
    test('PUT /api/users/:id should return 404 if user not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).put(`/api/users/${fakeId}`).send({
            name: 'Test',
            email: 'test@mail.com'
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // Prueba de PUT con ID inválido (CastError)
    test('PUT /api/users/:id should return 404 with invalid ID', async () => {
        const res = await request(app).put('/api/users/invalid-id-format').send({
            name: 'Test',
            email: 'test@mail.com'
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // prueba de PUT que falle si el email ya existe en otro usuario
    test('PUT /api/users/:id should fail if email already exists for another user', async () => {
        // Crear dos usuarios
        const user1 = {name: 'User1', email: 'user1@mail.com'};
        const user2 = {name: 'User2', email: 'user2@mail.com'};
        
        await request(app).post('/api/users').send(user1);
        const createRes2 = await request(app).post('/api/users').send(user2);
        const user2Id = createRes2.body._id; // MongoDB usa _id

        // Intentar actualizar user2 con el email de user1
        const res = await request(app).put(`/api/users/${user2Id}`).send({
            name: 'User2',
            email: 'user1@mail.com'
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    // prueba de PUT que falle si el formato del email es invalido
    test('PUT /api/users/:id should fail if email format is invalid', async () => {
        // Crear usuario
        const newUser = {name: 'Ana', email: 'ana@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body._id; // MongoDB usa _id

        // Intentar actualizar con email invalido
        const res = await request(app).put(`/api/users/${userId}`).send({
            name: 'Ana',
            email: 'email-sin-formato-valido'
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('email'); // Mensaje puede variar
    });

    // prueba de DELETE exitoso
    test('DELETE /api/users/:id should delete a user', async () => {
        // Crear usuario
        const newUser = {name: 'Roberto', email: 'roberto@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body._id; // MongoDB usa _id

        // Eliminar usuario
        const res = await request(app).delete(`/api/users/${userId}`);
        expect(res.statusCode).toBe(204);

        // Verificar que ya no existe
        const getRes = await request(app).get(`/api/users/${userId}`);
        expect(getRes.statusCode).toBe(404);
    });

    // prueba de DELETE cuando el usuario no existe
    test('DELETE /api/users/:id should return 404 if user not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).delete(`/api/users/${fakeId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // Prueba de DELETE con ID inválido (CastError)
    test('DELETE /api/users/:id should return 404 with invalid ID', async () => {
        const res = await request(app).delete('/api/users/invalid-id-format');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // Prueba de manejo de errores del servidor (simulando error de DB)
    test('GET /api/users should handle database errors', async () => {
        // Desconectar temporalmente para simular error
        await mongoose.connection.close();
        
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
        
        // Reconectar para otros tests
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al crear con DB desconectada
    test('POST /api/users should handle database errors', async () => {
        await mongoose.connection.close();
        
        const res = await request(app).post('/api/users').send({
            name: 'Test',
            email: 'test@mail.com'
        });
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al actualizar con DB desconectada
    test('PUT /api/users/:id should handle database errors', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await mongoose.connection.close();
        
        const res = await request(app).put(`/api/users/${fakeId}`).send({
            name: 'Test',
            email: 'test@mail.com'
        });
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al eliminar con DB desconectada
    test('DELETE /api/users/:id should handle database errors', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await mongoose.connection.close();
        
        const res = await request(app).delete(`/api/users/${fakeId}`);
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });
});
