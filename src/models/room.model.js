const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be a positive integer'],
    validate: {
      validator: Number.isInteger,
      message: 'Capacity must be a positive integer'
    }
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['2D', '3D', 'VIP'],
  }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;