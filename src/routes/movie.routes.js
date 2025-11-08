const express = require('express');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movie.controller');

const router = express.Router();

// Ruta GET para obtener todas las películas
router.get('/', getAllMovies);

// Ruta GET para obtener una película por ID
router.get('/:id', getMovieById);

// Ruta POST para crear una nueva película
router.post('/', createMovie);

// Ruta PUT para actualizar una película por ID
router.put('/:id', updateMovie);

// Ruta DELETE para eliminar una película por ID
router.delete('/:id', deleteMovie);

module.exports = router;
