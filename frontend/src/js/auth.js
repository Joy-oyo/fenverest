class Auth {
    constructor() {
        this.loginForm = document.getElementById('loginFormElement');
        this.registerForm = document.getElementById('registerFormElement');
        this.verifyPhoneForm = document.getElementById('verifyPhoneFormElement');
        this.loginLink = document.getElementById('showLogin');
        this.registerLink = document.getElementById('showRegister');
        this.resendCodeLink = document.getElementById('resendCode');
        this.authOverlay = document.getElementById('authOverlay');
        this.appContainer = document.getElementById('appContainer');
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Form submission handlers
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (this.verifyPhoneForm) {
            this.verifyPhoneForm.addEventListener('submit', (e) => this.handlePhoneVerification(e));
        }

        // Form switching handlers
        if (this.loginLink) {
            this.loginLink.addEventListener('click', (e) => this.switchForm(e, 'login'));
        }
        if (this.registerLink) {
            this.registerLink.addEventListener('click', (e) => this.switchForm(e, 'register'));
        }
        if (this.resendCodeLink) {
            this.resendCodeLink.addEventListener('click', (e) => this.handleResendCode(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Hide auth overlay and show app
            this.authOverlay.style.display = 'none';
            this.appContainer.style.display = 'block';

            // Update UI for logged-in user
            this.updateUIForLoggedInUser(data.user);

        } catch (error) {
            this.showError(this.loginForm, error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            console.log('Sending registration request...', { name, email });
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Hide auth overlay and show app
            this.authOverlay.style.display = 'none';
            this.appContainer.style.display = 'block';

            // Update UI for logged-in user
            this.updateUIForLoggedInUser(data.user);

        } catch (error) {
            console.error('Registration error:', error);
            this.showError(this.registerForm, error.message || 'Registration failed. Please try again.');
        }
    }

    async handlePhoneVerification(e) {
        e.preventDefault();
        const code = document.getElementById('verificationCode').value;
        const tempUser = JSON.parse(localStorage.getItem('tempUser'));

        try {
            const response = await fetch('/api/auth/verify-phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    userId: tempUser._id,
                    code: code 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.removeItem('tempUser');

            // Hide auth overlay and show app
            this.authOverlay.style.display = 'none';
            this.appContainer.style.display = 'block';

            // Update UI for logged-in user
            this.updateUIForLoggedInUser(data.user);

        } catch (error) {
            this.showError(this.verifyPhoneForm, error.message);
        }
    }

    async handleResendCode(e) {
        e.preventDefault();
        const tempUser = JSON.parse(localStorage.getItem('tempUser'));

        try {
            const response = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: tempUser._id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend code');
            }

            this.showSuccess(this.verifyPhoneForm, 'Verification code resent successfully!');

        } catch (error) {
            this.showError(this.verifyPhoneForm, error.message);
        }
    }

    async handleRoleSwitch(e) {
        e.preventDefault();
        const newRole = document.getElementById('roleSwitch').value;
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await fetch('/api/users/role', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update role');
            }

            // Update local storage
            user.role = newRole;
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI
            this.updateUIForLoggedInUser(user);
            this.showSuccess(null, 'Role updated successfully!');

        } catch (error) {
            this.showError(null, error.message);
        }
    }

    switchForm(e, formType) {
        e.preventDefault();
        
        // Hide all forms
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('verifyPhoneForm').classList.add('hidden');
        
        // Show selected form
        document.getElementById(`${formType}Form`).classList.remove('hidden');
    }

    showError(form, message) {
        // Create error message element if it doesn't exist
        let errorElement = form ? form.querySelector('.error-message') : document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            if (form) {
                form.insertBefore(errorElement, form.firstChild);
            } else {
                document.body.appendChild(errorElement);
            }
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);
    }

    showSuccess(form, message) {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        
        if (form) {
            form.insertBefore(successElement, form.firstChild);
        } else {
            document.body.appendChild(successElement);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successElement.remove();
        }, 3000);
    }

    updateUIForLoggedInUser(user) {
        // Update profile information
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profilePhone').textContent = user.phone;
        document.getElementById('profileRole').textContent = user.role;

        // Update role switch dropdown
        const roleSwitch = document.getElementById('roleSwitch');
        if (roleSwitch) {
            roleSwitch.value = user.role;
        }

        // Show/hide elements based on user role
        const organizerElements = document.querySelectorAll('.organizer-only');
        organizerElements.forEach(element => {
            element.style.display = user.role === 'organizer' ? 'block' : 'none';
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            // User is logged in
            this.authOverlay.style.display = 'none';
            this.appContainer.style.display = 'block';
            this.updateUIForLoggedInUser(user);
        } else {
            // User is not logged in
            this.authOverlay.style.display = 'flex';
            this.appContainer.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authOverlay.style.display = 'flex';
        this.appContainer.style.display = 'none';
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
}); 