import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState({
    title: '',
    description: '',
    professionalName: '',
  });

  const fetchSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let role = null;
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        role = decodedToken.user.role;
      }
      setUserRole(role);

      const queryParams = new URLSearchParams(searchTerm).toString();
      const res = await axios.get(`/api/sessions?${queryParams}`);
      setSessions(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch sessions.');
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleJoinLeave = async (sessionId, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to join/leave sessions.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`/api/sessions/${action}/${sessionId}`, {}, config);
      fetchSessions(); // Re-fetch sessions to update attendance
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${action} session.`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm({ ...searchTerm, [e.target.name]: e.target.value });
  };

  return (
    <Container className="mt-5">
      <h2>Available Sessions</h2>
      {userRole === 'professional' && (
        <Button as={Link} to="/create-session" variant="success" className="mb-3">
          Create New Session
        </Button>
      )}

      <Form className="mb-4">
        <Row>
          <Col>
            <Form.Group controlId="searchTitle">
              <Form.Control
                type="text"
                placeholder="Search by title"
                name="title"
                value={searchTerm.title}
                onChange={handleSearchChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="searchDescription">
              <Form.Control
                type="text"
                placeholder="Search by description"
                name="description"
                value={searchTerm.description}
                onChange={handleSearchChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="searchProfessional">
              <Form.Control
                type="text"
                placeholder="Search by professional name"
                name="professionalName"
                value={searchTerm.professionalName}
                onChange={handleSearchChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : sessions.length === 0 ? (
        <Alert variant="info">No sessions available matching your criteria.</Alert>
      ) : (
        sessions.map((session) => (
          <Card key={session._id} className="mb-3">
            <Card.Body>
              <Card.Title>{session.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Professional: {session.professional.name} ({session.professional.email})
              </Card.Subtitle>
              <Card.Text>{session.description}</Card.Text>
              <Card.Text>
                <strong>Date:</strong> {new Date(session.date).toLocaleString()}
              </Card.Text>
              <Card.Text>
                <strong>Duration:</strong> {session.duration} minutes
              </Card.Text>
              <Card.Text>
                <strong>Attendees:</strong> {session.attendees.length} / {session.maxAttendees}
              </Card.Text>
              {userRole === 'applicant' && (
                session.attendees.includes(
                  JSON.parse(window.atob(localStorage.getItem('token').split('.')[1])).user.id
                ) ? (
                  <Button variant="warning" onClick={() => handleJoinLeave(session._id, 'leave')}>
                    Leave Session
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => handleJoinLeave(session._id, 'join')}
                    disabled={session.attendees.length >= session.maxAttendees}>
                    Join Session
                  </Button>
                )
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default SessionList;