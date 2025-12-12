import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'applicant', // Default role
  });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('danger');
  const navigate = useNavigate();

  const { name, email, password, password2, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setMessage('Passwords do not match');
      setVariant('danger');
    } else {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const body = JSON.stringify({ name, email, password, role });
        const res = await axios.post('/api/auth/register', body, config);
        setMessage('Registration successful! Redirecting to login...');
        setVariant('success');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setMessage(err.response.data.msg || 'Registration failed');
        setVariant('danger');
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2>Register</h2>
      {message && <Alert variant={variant}>{message}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword2">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
            minLength="6"
          />
        </Form.Group>

        <Form.Group controlId="formBasicRole" className="mt-3">
          <Form.Label>Register as:</Form.Label>
          <Form.Check
            type="radio"
            label="Job Applicant"
            name="role"
            value="applicant"
            checked={role === 'applicant'}
            onChange={onChange}
            id="roleApplicant"
          />
          <Form.Check
            type="radio"
            label="Professional"
            name="role"
            value="professional"
            checked={role === 'professional'}
            onChange={onChange}
            id="roleProfessional"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Register
        </Button>
      </Form>
    </Container>
  );
};

export default Register;