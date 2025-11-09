const Room = require('../models/room.model');

// Crear una nueva sala
async function createRoom(req, res) {
  try {
    const { name, capacity, type } = req.body;

    // Validaciones individuales (para cumplir con los tests)
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (capacity === null){
      return res.status(400).json({ message: 'Capacity is required' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required' });
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      return res
        .status(400)
        .json({ message: 'The capacity must be a positive number.' });
    }

    if (!['2D', '3D', 'VIP'].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Invalid type, must be 2D, 3D or VIP' });
    }

    const room = await Room.create({ name, capacity, type });
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'The name of the room already exists' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
}

// Obtener todas las salas
async function getRooms(req, res) {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving rooms', error: error.message });
  }
}

// Obtener una sala por ID
async function getRoomById(req, res) {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    res.status(500).json({ message: 'Error retrieving room', error: error.message });
  }
}

// Actualizar una sala por ID
async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    const { name, capacity, type } = req.body;

    if (!name && !capacity && !type) {
      return res.status(400).json({
        message: 'At least one field (name, capacity, type) is required to update',
      });
    }

    const room = await Room.findByIdAndUpdate(
      id, 
      { name, capacity, type }, 
      { new: true, runValidators: true }
    );
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    res.status(500).json({ message: 'Error updating the room', error: error.message });
  }
}

// Eliminar una sala por ID
async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room successfully removed' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
}

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
