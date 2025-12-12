const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { auth, isOrganizer } = require('../middleware/auth');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(auth);
router.post('/', isOrganizer, createEvent);
router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);
router.patch('/:id', isOrganizer, updateEvent);
router.delete('/:id', isOrganizer, deleteEvent);

module.exports = router; 