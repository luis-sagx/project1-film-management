const express = require('express');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const roomRoutes = require('./routes/room.routes');

const app = express(); // Crea una instancia de la aplicación Express

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta base para los usuarios
app.use('/api/users', userRoutes);

// Ruta base para las películas
app.use('/api/movies', movieRoutes);

// Ruta base para las salas
app.use('/api/rooms', roomRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Exportamos app para poder usarla en tests o en un archivo de servidor separado
module.exports = app;