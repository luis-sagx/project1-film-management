const request = require('supertest');
const app = require('./../src/app.js');

describe('User API', () => {

    // prueba de que get devuelva una lista vacia inicialmente
    test('GET /api/users should return an empty list initially', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // prueba de que post cree un nuevo usuario correctamente
    test('POST /api/users should create a new user', async () => {
        const newUser = {name: 'Luis', email: 'luis@mail.com'};
        const res = await request(app).post('/api/users').send(newUser);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
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
        expect(res.body).toHaveProperty('message', 'Invalid email format');
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
        const userId = createRes.body.id;

        // Obtener el usuario por ID
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Maria');
    });

    // prueba de GET por ID cuando no existe
    test('GET /api/users/:id should return 404 if user not found', async () => {
        const res = await request(app).get('/api/users/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    // prueba de PUT para actualizar un usuario
    test('PUT /api/users/:id should update a user', async () => {
        // Crear usuario
        const newUser = {name: 'Carlos', email: 'carlos@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body.id;

        // Actualizar usuario
        const updatedUser = {name: 'Carlos Actualizado', email: 'carlos.nuevo@mail.com'};
        const res = await request(app).put(`/api/users/${userId}`).send(updatedUser);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Carlos Actualizado');
        expect(res.body.email).toBe('carlos.nuevo@mail.com');
    });

    // prueba de PUT que falle cuando el usuario no existe
    test('PUT /api/users/:id should return 404 if user not found', async () => {
        const res = await request(app).put('/api/users/999999').send({
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
        const user2Id = createRes2.body.id;

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
        const userId = createRes.body.id;

        // Intentar actualizar con email invalido
        const res = await request(app).put(`/api/users/${userId}`).send({
            name: 'Ana',
            email: 'email-sin-formato-valido'
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid email format');
    });

    // prueba de DELETE exitoso
    test('DELETE /api/users/:id should delete a user', async () => {
        // Crear usuario
        const newUser = {name: 'Roberto', email: 'roberto@mail.com'};
        const createRes = await request(app).post('/api/users').send(newUser);
        const userId = createRes.body.id;

        // Eliminar usuario
        const res = await request(app).delete(`/api/users/${userId}`);
        expect(res.statusCode).toBe(204);

        // Verificar que ya no existe
        const getRes = await request(app).get(`/api/users/${userId}`);
        expect(getRes.statusCode).toBe(404);
    });

    // prueba de DELETE cuando el usuario no existe
    test('DELETE /api/users/:id should return 404 if user not found', async () => {
        const res = await request(app).delete('/api/users/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });
});
