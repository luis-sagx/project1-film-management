require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./../src/app.js');
const Room = require('./../src/models/room.model.js');

// Conectar a una base de datos
beforeAll(async () => {
  // Si ya hay conexión, cerrarla
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  const dbUri = process.env.MONGODB_URI
  await mongoose.connect(dbUri);
});

// Limpiar la base de datos antes de cada test
beforeEach(async () => {
  await Room.deleteMany({});
});

// Desconectar después de todos los tests
afterAll(async () => {
  await Room.deleteMany({});
  await mongoose.connection.close();
});

describe('Room API', () => {
  // Prueba de que GET devuelva una lista (puede estar vacía o con datos)
  test('GET /api/rooms should return a list', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Prueba de que POST cree una nueva sala correctamente
  test('POST /api/rooms should create a new room', async () => {
    const newRoom = {
      name: 'Sala 1',
      capacity: 100,
      type: '2D'
    };
    const res = await request(app).post('/api/rooms').send(newRoom);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Sala 1');
    expect(res.body.capacity).toBe(100);
  });

  // Prueba de que POST falla sin nombre
  test('POST /api/rooms should fail if name is missing', async () => {
    const res = await request(app).post('/api/rooms').send({
      capacity: 50,
      type: '3D'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Name is required');
  });

  // POST falla si capacidad no es positiva
  test('POST /api/rooms should fail if capacity is not positive', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala X',
      capacity: -10,
      type: 'VIP'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('The capacity must be a positive number');
  });

  // POST falla si tipo no es valido
  test('POST /api/rooms should fail if type is invalid', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala Inválida',
      capacity: 100,
      type: '4D'
    });
    expect(res.statusCode).toBe(400);
  });

  // POST falla si nombre duplicado
  test('POST /api/rooms should fail if name is duplicated', async () => {
    await Room.create({ name: 'Sala Duplicada', capacity: 80, type: '2D' });
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala Duplicada',
      capacity: 100,
      type: '3D'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('The name of the room already exists');
  });

  test('POST /api/rooms should fail if capacity is null', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala Null',
      capacity: null,
      type: '2D'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Capacity is required');
  });

  test('POST /api/rooms should fail if type is missing', async () => {
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala Sin Tipo',
      capacity: 80
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Type is required');
  });

  // GET por ID correcto
  test('GET /api/rooms/:id should return a room by id', async () => {
    const room = await Room.create({ name: 'Sala GET', capacity: 60, type: 'VIP' });
    const res = await request(app).get(`/api/rooms/${room._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Sala GET');
  });

  // GET por ID inexistente
  test('GET /api/rooms/:id should return 404 if not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/rooms/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toContain('Room not found');
  });

  // GET con ID inválido
  test('GET /api/rooms/:id should return 400 if ID is invalid', async () => {
    const res = await request(app).get('/api/rooms/invalid-id');
    expect(res.statusCode).toBe(400);
  });

  // PUT correcto
  test('PUT /api/rooms/:id should update a room', async () => {
    const room = await Room.create({ name: 'Sala Editar', capacity: 40, type: '2D' });
    const res = await request(app).put(`/api/rooms/${room._id}`).send({ capacity: 120 });
    expect(res.statusCode).toBe(200);
    expect(res.body.capacity).toBe(120);
  });

  // PUT no encontrado
  test('PUT /api/rooms/:id should return 404 if room not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/rooms/${fakeId}`).send({ capacity: 99 });
    expect(res.statusCode).toBe(404);
  });

  // PUT ID inválido
  test('PUT /api/rooms/:id should return 400 with invalid ID', async () => {
    const res = await request(app).put('/api/rooms/invalid-id').send({ capacity: 50 });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/rooms/:id should fail if no fields are provided', async () => {
    const room = await Room.create({ name: 'Sala Update Vacía', capacity: 70, type: 'VIP' });
    const res = await request(app).put(`/api/rooms/${room._id}`).send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'message',
      'At least one field (name, capacity, type) is required to update'
    );
  });

  // DELETE correcto
  test('DELETE /api/rooms/:id should delete a room', async () => {
    const room = await Room.create({ name: 'Sala Borrar', capacity: 50, type: '3D' });
    const res = await request(app).delete(`/api/rooms/${room._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Room successfully removed');
  });

  // DELETE no encontrado
  test('DELETE /api/rooms/:id should return 404 if not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/rooms/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  // DELETE con ID inválido
  test('DELETE /api/rooms/:id should return 400 if ID invalid', async () => {
    const res = await request(app).delete('/api/rooms/invalid-id');
    expect(res.statusCode).toBe(400);
  });

  // Manejo de errores: GET con DB desconectada
  test('GET /api/rooms should handle DB errors', async () => {
    await mongoose.connection.close();
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // Manejo de errores: POST con DB desconectada
  test('POST /api/rooms should handle DB errors', async () => {
    await mongoose.connection.close();
    const res = await request(app).post('/api/rooms').send({
      name: 'Sala DB',
      capacity: 10,
      type: '2D'
    });
    expect(res.statusCode).toBe(500);
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // Manejo de errores: PUT con DB desconectada
  test('PUT /api/rooms/:id should handle DB errors', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await mongoose.connection.close();
    const res = await request(app).put(`/api/rooms/${fakeId}`).send({ capacity: 10 });
    expect(res.statusCode).toBe(500);
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // Manejo de errores: DELETE con DB desconectada
  test('DELETE /api/rooms/:id should handle DB errors', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await mongoose.connection.close();
    const res = await request(app).delete(`/api/rooms/${fakeId}`);
    expect(res.statusCode).toBe(500);
    await mongoose.connect(process.env.MONGODB_URI);
  });
});
