require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Movie = require('../src/models/movie.model');
const Room = require('../src/models/room.model');
const Showtime = require('../src/models/showtime.model');

// Conectar a una base de datos 
beforeAll(async () => {
  // Si ya hay conexión, cerrarla
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  const dbUri = process.env.MONGODB_URI.replace('/film-management', '/film-management-test');
  await mongoose.connect(dbUri);
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  await Showtime.deleteMany({});
  await Movie.deleteMany({});
  await Room.deleteMany({});
});

// Desconectar después de todos los tests
afterAll(async () => {
  await Showtime.deleteMany({});
  await Movie.deleteMany({});
  await Room.deleteMany({});
  await mongoose.connection.close();
});

describe('Showtime API', () => {
  // Prueba de POST exitoso
  test('POST /api/showtimes should create a new showtime', async () => {
    // Crear película y sala primero
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    // Verificar que existen
    const movieExists = await Movie.findById(movie._id);
    const roomExists = await Room.findById(room._id);
    expect(movieExists).not.toBeNull();
    expect(roomExists).not.toBeNull();

    const newShowtime = {
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000) // Pasado mañana
    };

    const res = await request(app).post('/api/showtimes').send(newShowtime);

    if (res.statusCode !== 201) {
      console.log('Error response:', res.body);
    }

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.movie_id).toBe(movie._id.toString());
    expect(res.body.room_id).toBe(room._id.toString());
  });

  // Prueba de POST con movie_id inexistente
  test('POST /api/showtimes should fail with non-existent movie_id', async () => {
    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const res = await request(app).post('/api/showtimes').send({
      movie_id: new mongoose.Types.ObjectId(),
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Movie does not exist');
  });

  // Prueba de POST con room_id inexistente
  test('POST /api/showtimes should fail with non-existent room_id', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const res = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: new mongoose.Types.ObjectId(),
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Room does not exist');
  });

  // Prueba de POST con start_time en el pasado
  test('POST /api/showtimes should fail with past start_time', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const res = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Start time must be in the future');
  });

  // Prueba de POST cuando end_time <= start_time
  test('POST /api/showtimes should fail when end_time <= start_time', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const res = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: startTime,
      end_time: startTime // Mismo tiempo
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'End time must be greater than start time');
  });

  // Prueba de GET por ID exitoso
  test('GET /api/showtimes/:id should return a showtime by id', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).get(`/api/showtimes/${showtimeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(showtimeId);
  });

  // Prueba de GET por ID cuando no existe
  test('GET /api/showtimes/:id should return 404 if showtime not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/showtimes/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Showtime not found');
  });

  // Prueba de PUT exitoso
  test('PUT /api/showtimes/:id should update a showtime', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      start_time: new Date(Date.now() + 48 * 60 * 60 * 1000), // En 2 días
      end_time: new Date(Date.now() + 50 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(showtimeId);
  });

  // Prueba de PUT cuando el showtime no existe
  test('PUT /api/showtimes/:id should return 404 if showtime not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/showtimes/${fakeId}`).send({
      start_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 50 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Showtime not found');
  });

  // Prueba de PUT con solapamiento
  test('PUT /api/showtimes/:id should fail with overlapping showtime', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    // Crear dos funciones
    const showtime1 = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtime2 = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 72 * 60 * 60 * 1000), // En 3 días
      end_time: new Date(Date.now() + 74 * 60 * 60 * 1000)
    });

    // Intentar actualizar showtime2 para que se solape con showtime1
    const res = await request(app).put(`/api/showtimes/${showtime2.body._id}`).send({
      start_time: showtime1.body.start_time
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('overlapping showtime');
  });

  // Prueba de DELETE exitoso
  test('DELETE /api/showtimes/:id should delete a showtime', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).delete(`/api/showtimes/${showtimeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('deleted successfully');

    // Verificar que ya no existe
    const getRes = await request(app).get(`/api/showtimes/${showtimeId}`);
    expect(getRes.statusCode).toBe(404);
  });

  // Prueba de DELETE cuando el showtime no existe
  test('DELETE /api/showtimes/:id should return 404 if showtime not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/showtimes/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Showtime not found');
  });

  // Prueba de GET todos los showtimes
  test('GET /api/showtimes should return all showtimes', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const res = await request(app).get('/api/showtimes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Prueba de PUT con movie_id diferente
  test('PUT /api/showtimes/:id should update with new movie_id', async () => {
    const movie1 = await Movie.create({
      title: 'Test Movie 1',
      duration: 120,
      release_year: 2024
    });

    const movie2 = await Movie.create({
      title: 'Test Movie 2',
      duration: 90,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie1._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      movie_id: movie2._id
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.movie_id).toBe(movie2._id.toString());
  });

  // Prueba de PUT con movie_id inexistente
  test('PUT /api/showtimes/:id should fail with non-existent movie_id', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      movie_id: new mongoose.Types.ObjectId()
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Movie does not exist');
  });

  // Prueba de PUT con room_id diferente
  test('PUT /api/showtimes/:id should update with new room_id', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room1 = await Room.create({
      name: 'Test Room 1',
      capacity: 100,
      type: '2D'
    });

    const room2 = await Room.create({
      name: 'Test Room 2',
      capacity: 150,
      type: '3D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room1._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      room_id: room2._id
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.room_id).toBe(room2._id.toString());
  });

  // Prueba de PUT con room_id inexistente
  test('PUT /api/showtimes/:id should fail with non-existent room_id', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      room_id: new mongoose.Types.ObjectId()
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Room does not exist');
  });

  // Prueba de PUT con start_time en el pasado
  test('PUT /api/showtimes/:id should fail with past start_time', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000) // Hace 2 horas
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Start time must be in the future');
  });

  // Prueba de PUT donde end_time <= start_time
  test('PUT /api/showtimes/:id should fail when updated end_time <= start_time', async () => {
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      release_year: 2024
    });

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const createRes = await request(app).post('/api/showtimes').send({
      movie_id: movie._id,
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    const showtimeId = createRes.body._id;

    const res = await request(app).put(`/api/showtimes/${showtimeId}`).send({
      end_time: new Date(Date.now() + 20 * 60 * 60 * 1000) // Antes del start_time actual
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'End time must be greater than start time');
  });

  // Prueba de manejo de errores: GET con DB desconectada
  test('GET /api/showtimes should handle database errors', async () => {
    await mongoose.connection.close();
    
    const res = await request(app).get('/api/showtimes');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // Prueba de manejo de errores: DELETE con DB desconectada
  test('DELETE /api/showtimes/:id should handle database errors', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await mongoose.connection.close();
    
    const res = await request(app).delete(`/api/showtimes/${fakeId}`);
    expect(res.statusCode).toBe(500);
    
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // Prueba de manejo de errores: POST con ID inválido de movie
  test('POST /api/showtimes should handle invalid movie_id format', async () => {
    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });

    const res = await request(app).post('/api/showtimes').send({
      movie_id: 'invalid-id',
      room_id: room._id,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Prueba de manejo de errores: PUT con ID inválido
  test('PUT /api/showtimes/:id should handle invalid ID format', async () => {
    const res = await request(app).put('/api/showtimes/invalid-id').send({
      start_time: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});