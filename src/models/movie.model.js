const mongoose = require('mongoose');

/**
 * Schema de Película para MongoDB
 */
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    director: {
      type: String,
      trim: true,
      default: ''
    },
    genre: {
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: Number,
      min: [1, 'Duration must be a positive number'],
      default: 0
    },
    release_year: {
      type: Number,
      validate: {
        validator: function(value) {
          if (value === null || value === undefined) { 
            return true;
          };
          return /^\d{4}$/.test(String(value));
        },
        message: 'Release year must be a 4-digit number'
      },
      default: null
    }
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
