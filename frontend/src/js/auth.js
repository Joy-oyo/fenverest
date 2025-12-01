const AUTH_API_BASE = (window.config && window.config.API_URL) || '';

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
        this.logoutButton = document.getElementById('logoutBtn');

        this.initializeEventListeners();
        this.bindGlobalActions();
        this.checkAuthStatus();
    }

    buildUrl(endpoint) {
        return `${AUTH_API_BASE}${endpoint}`;
    }

    initializeEventListeners() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (this.verifyPhoneForm) {
            this.verifyPhoneForm.addEventListener('submit', (e) => this.handlePhoneVerification(e));
        }

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

    bindGlobalActions() {
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => this.logout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(this.buildUrl(config.ENDPOINTS.AUTH.LOGIN), {
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

            this.persistSession(data);
        } catch (error) {
            this.showError(this.loginForm, error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(this.buildUrl(config.ENDPOINTS.AUTH.REGISTER), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();

            if (data.requiresVerification) {
                localStorage.setItem('tempUser', JSON.stringify(data.user));
                this.switchForm(null, 'verifyPhone');
                this.showSuccess(this.verifyPhoneForm, 'Enter the code we just sent to verify your phone.');
                return;
            }

            this.persistSession(data);
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(this.registerForm, error.message || 'Registration failed. Please try again.');
        }
    }

    async handlePhoneVerification(e) {
        e.preventDefault();
        const code = document.getElementById('verificationCode').value;
        const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');

        if (!tempUser._id) {
            this.showError(this.verifyPhoneForm, 'Something went wrong. Please restart the sign-up flow.');
            return;
        }

        try {
            const response = await fetch(this.buildUrl(config.ENDPOINTS.AUTH.VERIFY_PHONE), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    userId: tempUser._id,
                    code 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            localStorage.removeItem('tempUser');
            this.persistSession(data);
        } catch (error) {
            this.showError(this.verifyPhoneForm, error.message);
        }
    }

    async handleResendCode(e) {
        e.preventDefault();
        const tempUser = JSON.parse(localStorage.getItem('tempUser') || '{}');

        if (!tempUser._id) {
            this.showError(this.verifyPhoneForm, 'No pending verification found.');
            return;
        }

        try {
            const response = await fetch(this.buildUrl(config.ENDPOINTS.AUTH.RESEND_CODE), {
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

    switchForm(e, formType) {
        if (e) {
            e.preventDefault();
        }

        const forms = {
            login: document.getElementById('loginForm'),
            register: document.getElementById('registerForm'),
            verifyPhone: document.getElementById('verifyPhoneForm')
        };

        Object.values(forms).forEach(form => {
            if (form) {
                form.classList.add('hidden');
            }
        });

        const target = forms[formType];
        if (target) {
            target.classList.remove('hidden');
        }
    }

    showError(form, message) {
        const target = form || this.authOverlay || document.body;
        let errorElement = target.querySelector ? target.querySelector('.error-message') : null;

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            if (form && form.firstChild) {
                form.insertBefore(errorElement, form.firstChild);
            } else if (form) {
                form.appendChild(errorElement);
            } else if (target.appendChild) {
                target.appendChild(errorElement);
            }
        }

        errorElement.textContent = message;
        errorElement.classList.add('show');

        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);
    }

    showSuccess(form, message) {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;

        if (form && form.firstChild) {
            form.insertBefore(successElement, form.firstChild);
        } else if (form) {
            form.appendChild(successElement);
        } else {
            document.body.appendChild(successElement);
        }

        setTimeout(() => {
            successElement.remove();
        }, 3000);
    }

    updateUIForLoggedInUser(user) {
        if (!user) return;

        const nameEl = document.getElementById('profileName');
        const emailEl = document.getElementById('profileEmail');
        const phoneEl = document.getElementById('profilePhone');
        const roleEl = document.getElementById('profileRole');

        if (nameEl) nameEl.textContent = user.name || 'Unknown user';
        if (emailEl) emailEl.textContent = user.email || '—';
        if (phoneEl) phoneEl.textContent = user.phone || '—';
        if (roleEl) roleEl.textContent = user.role || 'participant';

        const roleSwitch = document.getElementById('roleSwitch');
        if (roleSwitch) {
            roleSwitch.value = user.role || 'participant';
        }

        const organizerElements = document.querySelectorAll('.organizer-only');
        organizerElements.forEach(element => {
            element.style.display = user.role === 'organizer' ? 'block' : 'none';
        });

        const createdEventsCount = document.getElementById('createdEventsCount');
        const joinedEventsCount = document.getElementById('joinedEventsCount');
        if (createdEventsCount) {
            createdEventsCount.textContent = user.createdEvents || 0;
        }
        if (joinedEventsCount) {
            joinedEventsCount.textContent = user.joinedEvents || 0;
        }
    }

    persistSession(data) {
        if (!data || !data.token || !data.user) {
            throw new Error('Invalid session response');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        this.toggleAppVisibility(true);
        this.updateUIForLoggedInUser(data.user);
        if (window.eventSwipe && typeof window.eventSwipe.loadEvents === 'function') {
            window.eventSwipe.loadEvents();
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        if (token && user) {
            this.toggleAppVisibility(true);
            this.updateUIForLoggedInUser(user);
        } else {
            this.toggleAppVisibility(false);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.toggleAppVisibility(false);
        this.switchForm(null, 'login');
        if (window.eventSwipe) {
            window.eventSwipe.events = [];
            window.eventSwipe.currentIndex = 0;
            window.eventSwipe.showEmptyState('Login required', 'Sign in to continue.');
        }
    }

    toggleAppVisibility(isLoggedIn) {
        if (this.authOverlay) {
            this.authOverlay.style.display = isLoggedIn ? 'none' : 'flex';
        }
        if (this.appContainer) {
            this.appContainer.style.display = isLoggedIn ? 'block' : 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});