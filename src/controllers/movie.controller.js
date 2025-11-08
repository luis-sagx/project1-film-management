const Movie = require('../models/movie.model');

/**
 * Devuelve todas las películas almacenadas
 */
async function getAllMovies(req, res) {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies', error: error.message });
  }
}

/**
 * Devuelve una película por ID
 */
async function getMovieById(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.status(500).json({ message: 'Error fetching movie', error: error.message });
  }
}

/**
 * Crea una nueva película con validaciones
 */
async function createMovie(req, res) {
  try {
    const { title, director, genre, duration, release_year } = req.body;

    // Validación: title es obligatorio
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validación: duration debe ser un número positivo
    if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    // Crear la película
    const newMovie = await Movie.create({
      title,
      director,
      genre,
      duration,
      release_year
    });

    res.status(201).json(newMovie);
  } catch (error) {
    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    res.status(500).json({ message: 'Error creating movie', error: error.message });
  }
}

/**
 * Actualiza una película por ID
 */
async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    const { title, director, genre, duration, release_year } = req.body;

    // Validación: title es obligatorio
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validación: duration debe ser un número positivo
    if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    // Actualizar la película
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { title, director, genre, duration, release_year },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(updatedMovie);
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    res.status(500).json({ message: 'Error updating movie', error: error.message });
  }
}

/**
 * Elimina una película por ID
 */
async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(204).send();
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(500).json({ message: 'Error deleting movie', error: error.message });
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
