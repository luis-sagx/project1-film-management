const User = require('../models/user.model');

/**
 * Devuelve todos los usuarios almacenados
 */
async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

/**
 * Devuelve un usuario por ID
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
}

/**
 * Crea un nuevo usuario si se proveen name y email válidos
 */
async function createUser(req, res) {
  try {
    const { name, email } = req.body;

    // Validación básica de entrada
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Crear el usuario
    const newUser = await User.create({ name, email });

    res.status(201).json(newUser);
  } catch (error) {
    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    // Error de email duplicado (por índice único)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
}

/**
 * Actualiza un usuario por ID
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validación básica de entrada
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Verificar si el email ya existe en otro usuario
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }

    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    // Error de email duplicado (por índice único)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
}

/**
 * Elimina un usuario por ID
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    // Si el ID no es válido para MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
