import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SessionForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    maxAttendees: 1,
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('danger');
  const navigate = useNavigate();

  const { title, description, date, duration, maxAttendees } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const body = JSON.stringify(formData);
      await axios.post('/api/sessions', body, config);
      setMessage('Session created successfully!');
      setVariant('success');
      setTimeout(() => navigate('/sessions'), 2000); // Redirect to session list
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to create session');
      setVariant('danger');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Create New Session</h2>
      {message && <Alert variant={variant}>{message}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter session title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter session description"
            name="description"
            value={description}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDate" className="mt-3">
          <Form.Label>Date and Time</Form.Label>
          <Form.Control
            type="datetime-local"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDuration" className="mt-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control
            type="number"
            placeholder="e.g., 60"
            name="duration"
            value={duration}
            onChange={onChange}
            required
            min="15"
          />
        </Form.Group>

        <Form.Group controlId="formMaxAttendees" className="mt-3">
          <Form.Label>Maximum Attendees</Form.Label>
          <Form.Control
            type="number"
            name="maxAttendees"
            value={maxAttendees}
            onChange={onChange}
            required
            min="1"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Create Session
        </Button>
      </Form>
    </Container>
  );
};

export default SessionForm;