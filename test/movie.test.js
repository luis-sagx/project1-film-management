require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./../src/app.js');
const Movie = require('./../src/models/movie.model.js');

// Conectar a MongoDB antes de todos los tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
    await Movie.deleteMany({});
});

// Desconectar después de todos los tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Movie API', () => {

    // Prueba de que GET devuelva una lista (puede estar vacía o con datos)
    test('GET /api/movies should return a list', async () => {
        const res = await request(app).get('/api/movies');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // Prueba de que POST cree una nueva película correctamente
    test('POST /api/movies should create a new movie', async () => {
        const newMovie = {
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi',
        duration: 148,
        release_year: 2010
        };
        const res = await request(app).post('/api/movies').send(newMovie);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id'); // MongoDB usa _id
        expect(res.body.title).toBe('Inception');
        expect(res.body.duration).toBe(148);
    });

    // Prueba de que POST falle si no se incluye title
    test('POST /api/movies should fail if title is missing', async () => {
        const res = await request(app).post('/api/movies').send({
        director: 'Someone',
        duration: 120
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Title is required');
    });

    // Prueba de que POST falle si duration no es un número positivo
    test('POST /api/movies should fail if duration is not positive', async () => {
        const res = await request(app).post('/api/movies').send({
        title: 'Test Movie',
        duration: -10
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Duration must be a positive number');
    });

    // Prueba de que POST falle si release_year no tiene 4 dígitos
    test('POST /api/movies should fail if release_year is not 4 digits', async () => {
        const res = await request(app).post('/api/movies').send({
        title: 'Test Movie',
        release_year: 20
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Release year must be a 4-digit number');
    });

    // Prueba de GET por ID
    test('GET /api/movies/:id should return a movie by id', async () => {
        // Primero creamos una película
        const newMovie = {
        title: 'Matrix',
        director: 'Wachowski',
        duration: 136,
        release_year: 1999
        };
        const createRes = await request(app).post('/api/movies').send(newMovie);
        const movieId = createRes.body._id; // MongoDB usa _id

        // Luego la buscamos por ID
        const res = await request(app).get(`/api/movies/${movieId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Matrix');
    });

    // Prueba de GET por ID cuando no existe
    test('GET /api/movies/:id should return 404 if movie not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).get(`/api/movies/${fakeId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de GET con ID inválido (CastError)
    test('GET /api/movies/:id should return 404 with invalid ID', async () => {
        const res = await request(app).get('/api/movies/invalid-id-format');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de PUT para actualizar una película
    test('PUT /api/movies/:id should update a movie', async () => {
        // Crear película
        const newMovie = {
        title: 'Old Title',
        duration: 100,
        release_year: 2000
        };
        const createRes = await request(app).post('/api/movies').send(newMovie);
        const movieId = createRes.body._id; // MongoDB usa _id

        // Actualizar película
        const updatedMovie = {
        title: 'New Title',
        director: 'New Director',
        duration: 120,
        release_year: 2005
        };
        const res = await request(app).put(`/api/movies/${movieId}`).send(updatedMovie);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('New Title');
        expect(res.body.duration).toBe(120);
    });

    // prueba de PUT que falle cuando la pelicula no existe
    test('PUT /api/movies/:id should return 404 if movie not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).put(`/api/movies/${fakeId}`).send({
        title: 'Test',
        director: 'Test Director',
        duration: 120,
        release_year: 2020
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de PUT con ID inválido (CastError)
    test('PUT /api/movies/:id should return 404 with invalid ID', async () => {
        const res = await request(app).put('/api/movies/invalid-id-format').send({
        title: 'Test',
        duration: 120
        });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de PUT con release_year inválido (ValidationError)
    test('PUT /api/movies/:id should fail with invalid release_year format', async () => {
        // Crear película primero
        const newMovie = {
        title: 'Test Movie',
        duration: 120,
        release_year: 2020
        };
        const createRes = await request(app).post('/api/movies').send(newMovie);
        const movieId = createRes.body._id;

        // Intentar actualizar con año inválido
        const res = await request(app).put(`/api/movies/${movieId}`).send({
        title: 'Updated',
        duration: 120,
        release_year: 20 // Año inválido (no tiene 4 dígitos)
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('year');
    });

    // Prueba de DELETE correcta de una película
    test('DELETE /api/movies/:id should delete a movie', async () => {
        // Crear película
        const newMovie = {
        title: 'To be deleted',
        duration: 90,
        release_year: 2020
        };
        const createRes = await request(app).post('/api/movies').send(newMovie);
        const movieId = createRes.body._id; // MongoDB usa _id

        // Eliminar película
        const res = await request(app).delete(`/api/movies/${movieId}`);
        expect(res.statusCode).toBe(204);

        // Verificar que ya no existe
        const getRes = await request(app).get(`/api/movies/${movieId}`);
        expect(getRes.statusCode).toBe(404);
    });

    // prueba de DELETE cuando la película no existe
    test('DELETE /api/movies/:id should return 404 if movie not found', async () => {
        const fakeId = new mongoose.Types.ObjectId(); // ID válido de MongoDB
        const res = await request(app).delete(`/api/movies/${fakeId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de DELETE con ID inválido (CastError)
    test('DELETE /api/movies/:id should return 404 with invalid ID', async () => {
        const res = await request(app).delete('/api/movies/invalid-id-format');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Movie not found');
    });

    // Prueba de manejo de errores del servidor (simulando error de DB)
    test('GET /api/movies should handle database errors', async () => {
        // Desconectar temporalmente para simular error
        await mongoose.connection.close();
        
        const res = await request(app).get('/api/movies');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
        
        // Reconectar para otros tests
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al crear con DB desconectada
    test('POST /api/movies should handle database errors', async () => {
        await mongoose.connection.close();
        
        const res = await request(app).post('/api/movies').send({
            title: 'Test Movie',
            duration: 120,
            release_year: 2024
        });
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al actualizar con DB desconectada
    test('PUT /api/movies/:id should handle database errors', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await mongoose.connection.close();
        
        const res = await request(app).put(`/api/movies/${fakeId}`).send({
            title: 'Test Movie',
            duration: 120
        });
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });

    // Prueba de error al eliminar con DB desconectada
    test('DELETE /api/movies/:id should handle database errors', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await mongoose.connection.close();
        
        const res = await request(app).delete(`/api/movies/${fakeId}`);
        expect(res.statusCode).toBe(500);
        
        await mongoose.connect(process.env.MONGODB_URI);
    });

});
