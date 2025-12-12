import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile'; // Import Profile component
import SessionForm from './pages/SessionForm'; // Import SessionForm component
import SessionList from './pages/SessionList'; // Import SessionList component
import Home from './pages/Home'; // Import Home component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './index.css'; // Main CSS file

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(window.atob(base64));
        setUserRole(decodedToken.user.role);
      } catch (e) {
        console.error("Failed to decode token", e);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('token');
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/'); // Redirect to home page
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Fenverest</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/sessions">Sessions</Nav.Link> {/* Always show sessions */}
              {!isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                  {userRole === 'professional' && (
                    <Nav.Link as={Link} to="/create-session">Create Session</Nav.Link>
                  )}
                  <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sessions" element={<SessionList />} /> {/* Session List Route */}
          <Route path="/create-session" element={<SessionForm />} /> {/* Create Session Route */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;