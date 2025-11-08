// Simulación de una base de datos en memoria para películas
let movies = [];

/**
 * Valida que el año tenga 4 dígitos
 */
function isValidYear(year) {
  return /^\d{4}$/.test(String(year));
}

/**
 * Devuelve todas las películas almacenadas
 */
function getAllMovies(req, res) {
  res.json(movies);
}

/**
 * Devuelve una película por ID
 */
function getMovieById(req, res) {
  const { id } = req.params;
  const movie = movies.find(m => m.id === parseInt(id));

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie);
}

/**
 * Crea una nueva película con validaciones
 */
function createMovie(req, res) {
  const { title, director, genre, duration, release_year } = req.body;

  // Validación: title es obligatorio
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Validación: duration debe ser un número positivo
  if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
    return res.status(400).json({ message: 'Duration must be a positive number' });
  }

  // Validación: release_year debe ser un número de 4 dígitos
  if (release_year !== undefined && !isValidYear(release_year)) {
    return res.status(400).json({ message: 'Release year must be a 4-digit number' });
  }

  // Creamos el objeto película
  const newMovie = {
    id: Date.now(), // ID simulado
    title,
    director: director || '',
    genre: genre || '',
    duration: duration || 0,
    release_year: release_year || null
  };

  // Lo añadimos al arreglo de películas
  movies.push(newMovie);

  // Respondemos con la película creada
  res.status(201).json(newMovie);
}

/**
 * Actualiza una película por ID
 */
function updateMovie(req, res) {
  const { id } = req.params;
  const { title, director, genre, duration, release_year } = req.body;

  const movieIndex = movies.findIndex(m => m.id === parseInt(id));

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  // Validación: title es obligatorio
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // Validación: duration debe ser un número positivo
  if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
    return res.status(400).json({ message: 'Duration must be a positive number' });
  }

  // Validación: release_year debe ser un número de 4 dígitos
  if (release_year !== undefined && !isValidYear(release_year)) {
    return res.status(400).json({ message: 'Release year must be a 4-digit number' });
  }

  // Actualizamos la película
  movies[movieIndex] = {
    ...movies[movieIndex],
    title,
    director: director || movies[movieIndex].director,
    genre: genre || movies[movieIndex].genre,
    duration: duration !== undefined ? duration : movies[movieIndex].duration,
    release_year: release_year !== undefined ? release_year : movies[movieIndex].release_year
  };

  res.json(movies[movieIndex]);
}

/**
 * Elimina una película por ID
 */
function deleteMovie(req, res) {
  const { id } = req.params;
  const movieIndex = movies.findIndex(m => m.id === parseInt(id));

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  movies.splice(movieIndex, 1);
  res.status(204).send();
}

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
