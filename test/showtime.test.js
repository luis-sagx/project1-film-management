const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Movie = require('../src/models/movie.model');
const Room = require('../src/models/room.model');
const Showtime = require('../src/models/showtime.model');

describe('Showtime API', () => {
  let movieId;
  let roomId;
  let validShowtime;

  beforeAll(async () => {
    // Crear una película y una sala de prueba
    const movie = await Movie.create({
      title: 'Test Movie',
      duration: 120,
      rating: 'PG-13'
    });
    movieId = movie._id;

    const room = await Room.create({
      name: 'Test Room',
      capacity: 100,
      type: '2D'
    });
    roomId = room._id;

    // Datos base para una función válida
    validShowtime = {
      movie_id: movieId,
      room_id: roomId,
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000) // Mañana + 2 horas
    };
  });

  afterAll(async () => {
    // Limpiar las colecciones específicas en lugar de borrar toda la base de datos
    await Promise.all([
      Showtime.deleteMany({}),
      Movie.deleteMany({}),
      Room.deleteMany({})
    ]);
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Showtime.deleteMany({});
  });

  describe('POST /api/showtimes', () => {
    it('should create a valid showtime', async () => {
      const res = await request(app)
        .post('/api/showtimes')
        .send(validShowtime);
      
      expect(res.status).toBe(201);
      expect(res.body.movie_id).toBe(movieId.toString());
    });

    it('should fail with non-existent movie_id', async () => {
      const res = await request(app)
        .post('/api/showtimes')
        .send({
          ...validShowtime,
          movie_id: new mongoose.Types.ObjectId()
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Movie does not exist');
    });

    it('should fail with non-existent room_id', async () => {
      const res = await request(app)
        .post('/api/showtimes')
        .send({
          ...validShowtime,
          room_id: new mongoose.Types.ObjectId()
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Room does not exist');
    });

    it('should fail with past start_time', async () => {
      const res = await request(app)
        .post('/api/showtimes')
        .send({
          ...validShowtime,
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000)
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Start time must be in the future');
    });

    it('should fail when end_time <= start_time', async () => {
      const res = await request(app)
        .post('/api/showtimes')
        .send({
          ...validShowtime,
          end_time: validShowtime.start_time
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('End time must be greater than start time');
    });

    it('should fail with overlapping showtime', async () => {
      // Crear primera función
      await Showtime.create(validShowtime);

      // Intentar crear función solapada
      const res = await request(app)
        .post('/api/showtimes')
        .send({
          ...validShowtime,
          start_time: new Date(validShowtime.start_time.getTime() + 30 * 60 * 1000) // +30 min
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('overlapping showtime');
    });
  });

  describe('PUT /api/showtimes/:id', () => {
    it('should update showtime without overlap', async () => {
      const showtime = await Showtime.create(validShowtime);
      
      const res = await request(app)
        .put(`/api/showtimes/${showtime._id}`)
        .send({
          start_time: new Date(Date.now() + 48 * 60 * 60 * 1000), // En 2 días
          end_time: new Date(Date.now() + 50 * 60 * 60 * 1000)
        });
      
      expect(res.status).toBe(200);
    });

    it('should fail update with overlap', async () => {
      // Crear dos funciones
      const showtime1 = await Showtime.create(validShowtime);
      const showtime2 = await Showtime.create({
        ...validShowtime,
        start_time: new Date(Date.now() + 72 * 60 * 60 * 1000), // En 3 días
        end_time: new Date(Date.now() + 74 * 60 * 60 * 1000)
      });

      // Intentar actualizar showtime2 para que se solape con showtime1
      const res = await request(app)
        .put(`/api/showtimes/${showtime2._id}`)
        .send({
          start_time: validShowtime.start_time
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('overlapping showtime');
    });
  });

  describe('DELETE /api/showtimes/:id', () => {
    it('should delete existing showtime', async () => {
      const showtime = await Showtime.create(validShowtime);
      
      const res = await request(app)
        .delete(`/api/showtimes/${showtime._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
    });
  });
});