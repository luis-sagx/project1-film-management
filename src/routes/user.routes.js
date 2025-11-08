const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/user.controller');

const router = express.Router();

// Ruta GET para obtener todos los usuarios
router.get('/', getAllUsers);

// Ruta GET para obtener un usuario por ID
router.get('/:id', getUserById);

// Ruta POST para crear un nuevo usuario
router.post('/', createUser);

// Ruta PUT para actualizar un usuario por ID
router.put('/:id', updateUser);

// Ruta DELETE para eliminar un usuario por ID
router.delete('/:id', deleteUser);

module.exports = router;
