const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');

// Rutas CRUD para funciones de cine
router.post('/', showtimeController.createShowtime);
router.get('/', showtimeController.getShowtimes);
router.get('/:id', showtimeController.getShowtimeById);
router.put('/:id', showtimeController.updateShowtime);
router.delete('/:id', showtimeController.deleteShowtime);

module.exports = router;