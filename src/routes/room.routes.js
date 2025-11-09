const express = require('express');
const router = express.Router();
const {
    createRoom, 
    getRooms, 
    getRoomById, 
    updateRoom, 
    deleteRoom
} = require('../controllers/room.controller');

// Ruta POST para crear un nuevo usuario
router.post('/', createRoom);

// Ruta GET para obtener todos las sala
router.get('/', getRooms);

// Ruta GET para obtener una sala por ID
router.get('/:id', getRoomById);

// Ruta PUT para actualizar una sala por ID
router.put('/:id', updateRoom);

// Ruta DELETE para eliminar una sala por ID
router.delete('/:id', deleteRoom);

module.exports = router;
