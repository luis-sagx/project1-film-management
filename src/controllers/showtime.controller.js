const Showtime = require('../models/showtime.model');

// Crear una nueva función de cine
exports.createShowtime = async (req, res) => {
  try {
    const showtime = new Showtime(req.body);
    await showtime.save();
    res.status(201).json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las funciones
exports.getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie_id', 'title')
      .populate('room_id', 'name');
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una función por ID
exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie_id', 'title')
      .populate('room_id', 'name');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una función
exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Actualizar los campos
    Object.assign(showtime, req.body);
    await showtime.save(); // Esto ejecutará las validaciones

    res.json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una función
exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};