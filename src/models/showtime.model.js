const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required']
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  start_time: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: Date,
    required: [true, 'End time is required']
  }
}, {
  timestamps: true
});

// Índices para optimizar las búsquedas y validaciones
showtimeSchema.index({ room_id: 1, start_time: 1, end_time: 1 });

// Middleware de validación pre-save
showtimeSchema.pre('save', async function(next) {
  try {
    // Validar que movie_id existe
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie_id);
    if (!movie) {
      throw new Error('Movie does not exist');
    }

    // Validar que room_id existe
    const Room = mongoose.model('Room');
    const room = await Room.findById(this.room_id);
    if (!room) {
      throw new Error('Room does not exist');
    }

    // Validar que start_time es futura
    if (this.start_time <= new Date()) {
      throw new Error('Start time must be in the future');
    }

    // Validar que end_time es mayor que start_time
    if (this.end_time <= this.start_time) {
      throw new Error('End time must be greater than start time');
    }

    // Validar solapamiento
    const overlap = await this.constructor.findOne({
      room_id: this.room_id,
      _id: { $ne: this._id }, // Excluir el documento actual en actualizaciones
      start_time: { $lt: this.end_time },
      end_time: { $gt: this.start_time }
    });

    if (overlap) {
      throw new Error('There is an overlapping showtime in this room');
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;