const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Session = require('../models/Session');
const User = require('../models/User'); // Required to populate user data

// @route   POST /api/sessions
// @desc    Create a new session (Professional only)
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, date, duration, maxAttendees } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'professional') {
      return res.status(403).json({ msg: 'Not authorized as a professional' });
    }

    const newSession = new Session({
      title,
      description,
      professional: req.user.id,
      date,
      duration,
      maxAttendees,
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions
// @desc    Get all sessions with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { title, description, professionalName } = req.query;
    let query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
    }
    if (description) {
      query.description = { $regex: description, $options: 'i' }; // Case-insensitive search
    }

    let sessions = await Session.find(query).populate('professional', 'name email');

    if (professionalName) {
      sessions = sessions.filter(session =>
        session.professional.name.toLowerCase().includes(professionalName.toLowerCase())
      );
    }

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('professional', 'name email');
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update a session (Professional only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, date, duration, maxAttendees, status } = req.body;

  // Build session object
  const sessionFields = {};
  if (title) sessionFields.title = title;
  if (description) sessionFields.description = description;
  if (date) sessionFields.date = date;
  if (duration) sessionFields.duration = duration;
  if (maxAttendees) sessionFields.maxAttendees = maxAttendees;
  if (status) sessionFields.status = status;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    // Make sure user owns session
    if (session.professional.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    session = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: sessionFields },
      { new: true }
    );

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session (Professional only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    // Make sure user owns session
    if (session.professional.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Session removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/sessions/join/:id
// @desc    Join a session (Applicant only)
// @access  Private
router.put('/join/:id', protect, async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    const user = await User.findById(req.user.id);
    if (user.role !== 'applicant') {
      return res.status(403).json({ msg: 'Only applicants can join sessions' });
    }

    // Check if user already joined
    if (session.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already joined this session' });
    }

    // Check if max attendees reached
    if (session.attendees.length >= session.maxAttendees) {
      return res.status(400).json({ msg: 'Session is full' });
    }

    session.attendees.push(req.user.id);
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/sessions/leave/:id
// @desc    Leave a session (Applicant only)
// @access  Private
router.put('/leave/:id', protect, async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    const user = await User.findById(req.user.id);
    if (user.role !== 'applicant') {
      return res.status(403).json({ msg: 'Only applicants can leave sessions' });
    }

    // Check if user is an attendee
    if (!session.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not joined this session' });
    }

    session.attendees = session.attendees.filter(
      (attendee) => attendee.toString() !== req.user.id
    );
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;