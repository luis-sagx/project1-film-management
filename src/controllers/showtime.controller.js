const Showtime = require('../models/showtime.model');
const Movie = require('../models/movie.model');
const Room = require('../models/room.model');

// Crear una nueva función de cine
exports.createShowtime = async (req, res) => {
  try {
    const { movie_id, room_id, start_time, end_time } = req.body;

    // Validar que movie_id existe
    const movie = await Movie.findById(movie_id);
    if (!movie) {
      return res.status(400).json({ message: 'Movie does not exist' });
    }

    // Validar que room_id existe
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(400).json({ message: 'Room does not exist' });
    }

    // Validar que start_time es futura
    if (new Date(start_time) <= new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    // Validar que end_time es mayor que start_time
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ message: 'End time must be greater than start time' });
    }

    // Validar solapamiento
    const overlap = await Showtime.findOne({
      room_id: room_id,
      $or: [
        // Caso 1: El nuevo showtime empieza durante uno existente
        {
          start_time: { $lte: new Date(start_time) },
          end_time: { $gt: new Date(start_time) }
        },
        // Caso 2: El nuevo showtime termina durante uno existente
        {
          start_time: { $lt: new Date(end_time) },
          end_time: { $gte: new Date(end_time) }
        },
        // Caso 3: El nuevo showtime contiene completamente uno existente
        {
          start_time: { $gte: new Date(start_time) },
          end_time: { $lte: new Date(end_time) }
        }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'There is an overlapping showtime in this room' });
    }

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

    const { movie_id, room_id, start_time, end_time } = req.body;

    // Si se proporciona movie_id, validar que existe
    if (movie_id) {
      const movie = await Movie.findById(movie_id);
      if (!movie) {
        return res.status(400).json({ message: 'Movie does not exist' });
      }
    }

    // Si se proporciona room_id, validar que existe
    if (room_id) {
      const room = await Room.findById(room_id);
      if (!room) {
        return res.status(400).json({ message: 'Room does not exist' });
      }
    }

    // Validar start_time si se proporciona
    if (start_time && new Date(start_time) <= new Date()) {
      return res.status(400).json({ message: 'Start time must be in the future' });
    }

    // Validar end_time vs start_time
    const newStartTime = start_time ? new Date(start_time) : showtime.start_time;
    const newEndTime = end_time ? new Date(end_time) : showtime.end_time;
    
    if (newEndTime <= newStartTime) {
      return res.status(400).json({ message: 'End time must be greater than start time' });
    }

    // Validar solapamiento (excluyendo el showtime actual)
    const newRoomId = room_id || showtime.room_id;
    const overlap = await Showtime.findOne({
      room_id: newRoomId,
      _id: { $ne: req.params.id },
      $or: [
        {
          start_time: { $lte: newStartTime },
          end_time: { $gt: newStartTime }
        },
        {
          start_time: { $lt: newEndTime },
          end_time: { $gte: newEndTime }
        },
        {
          start_time: { $gte: newStartTime },
          end_time: { $lte: newEndTime }
        }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'There is an overlapping showtime in this room' });
    }

    // Actualizar los campos
    Object.assign(showtime, req.body);
    await showtime.save();

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