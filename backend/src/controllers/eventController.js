const Event = require('../models/Event');
const User = require('../models/User');

const createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });

    await event.save();

    // Add event to user's createdEvents
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdEvents: event._id }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const { difficulty, status } = req.query;
    const query = {};

    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already joined this event' });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    event.participants.push(req.user._id);
    await event.save();

    // Add event to user's joinedEvents
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedEvents: event._id }
    });

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.participants = event.participants.filter(
      participant => participant.toString() !== req.user._id.toString()
    );
    await event.save();

    // Remove event from user's joinedEvents
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedEvents: event._id }
    });

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await event.remove();

    // Remove event from organizer's createdEvents
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdEvents: event._id }
    });

    // Remove event from all participants' joinedEvents
    await User.updateMany(
      { joinedEvents: event._id },
      { $pull: { joinedEvents: event._id } }
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent
}; 