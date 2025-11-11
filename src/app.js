require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const roomRoutes = require('./routes/room.routes');
const showtimeRoutes = require('./routes/showtime.routes');

const app = express(); // Crea una instancia de la aplicación Express
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta base para los usuarios
app.use('/api/users', userRoutes);

// Ruta base para las películas
app.use('/api/movies', movieRoutes);

// Ruta base para las salas
app.use('/api/rooms', roomRoutes);

// Ruta base para las funciones de cine
app.use('/api/showtimes', showtimeRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Iniciar el servidor solo después de conectar a la base de datos
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Exportamos app para poder usarla en tests o en un archivo de servidor separado
module.exports = app;