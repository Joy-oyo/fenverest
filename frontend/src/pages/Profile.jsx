import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get('/api/users/me', config);
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch profile.');
        localStorage.removeItem('token'); // Token might be invalid
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="info">No user data available. Please log in.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>User Profile</h2>
      <Card>
        <Card.Body>
          <Card.Title>{user.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
          <Card.Text>
            <strong>Role:</strong> {user.role}
            <br />
            <strong>Member Since:</strong> {new Date(user.date).toLocaleDateString()}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;