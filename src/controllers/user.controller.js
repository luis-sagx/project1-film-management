// Simulación de una base de datos en memoria
let users = [];

/**
 * Valida el formato de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Devuelve todos los usuarios almacenados
 */
function getAllUsers(req, res) {
  res.json(users);
}

/**
 * Devuelve un usuario por ID
 */
function getUserById(req, res) {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
}

/**
 * Crea un nuevo usuario si se proveen name y email válidos
 */
function createUser(req, res) {
  const { name, email } = req.body;

  // Validación básica de entrada
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  // Validación de formato de email
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validación de email único
  const emailExists = users.some(u => u.email === email);
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Creamos un objeto usuario
  const newUser = {
    id: Date.now(), // ID simulado
    name,
    email
  };

  // Lo añadimos al arreglo de usuarios
  users.push(newUser);

  // Respondemos con el usuario creado
  res.status(201).json(newUser);
}

/**
 * Actualiza un usuario por ID
 */
function updateUser(req, res) {
  const { id } = req.params;
  const { name, email } = req.body;

  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Validación básica de entrada
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  // Validación de formato de email
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validación de email único (excluyendo el usuario actual)
  const emailExists = users.some(u => u.email === email && u.id !== parseInt(id));
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Actualizamos el usuario
  users[userIndex] = {
    ...users[userIndex],
    name,
    email
  };

  res.json(users[userIndex]);
}

/**
 * Elimina un usuario por ID
 */
function deleteUser(req, res) {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
}

module.exports = { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
};