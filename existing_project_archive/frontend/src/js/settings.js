const SETTINGS_API_BASE = (window.config && window.config.API_URL) || '';

class Settings {
    constructor() {
        this.modal = document.getElementById('settingsModal');
        this.openButton = document.getElementById('settingsBtn');
        this.closeButton = this.modal ? this.modal.querySelector('[data-modal-close]') : null;
        this.form = document.getElementById('settingsForm');
        this.toastContainer = document.getElementById('toastContainer');

        if (!this.modal || !this.form || !this.openButton) {
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        this.openButton.addEventListener('click', () => this.open());
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    open() {
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        this.loadSettings();
    }

    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    async loadSettings() {
        try {
            const response = await fetch(`${SETTINGS_API_BASE}${config.ENDPOINTS.USERS.PREFERENCES}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load settings');
            }

            const preferences = await response.json();
            this.populateForm(preferences);
        } catch (error) {
            console.error('Error loading settings', error);
            this.showToast('Unable to load settings right now.', 'error');
        }
    }

    populateForm(preferences = {}) {
        const interestsInput = document.getElementById('interests');
        if (interestsInput) {
            interestsInput.value = (preferences.interests || []).join(', ');
        }

        const difficultyChecks = this.form.querySelectorAll('input[name="difficulty"]');
        const preferred = new Set(preferences.preferredDifficulties || []);
        difficultyChecks.forEach((checkbox) => {
            checkbox.checked = preferred.has(checkbox.value);
        });

        const notificationPrefs = preferences.notifications || {};
        const notificationMap = {
            emailNotif: 'email',
            pushNotif: 'push',
            eventReminders: 'eventReminders',
            newMatches: 'newMatches'
        };
        Object.entries(notificationMap).forEach(([id, key]) => {
            const input = document.getElementById(id);
            if (input) {
                input.checked = Boolean(notificationPrefs[key]);
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const interestsInput = document.getElementById('interests');
        const interests = interestsInput
            ? interestsInput.value.split(',').map(item => item.trim()).filter(Boolean)
            : [];
        const preferredDifficulties = Array.from(this.form.querySelectorAll('input[name="difficulty"]:checked'))
            .map(input => input.value);

        const settingsPayload = {
            interests,
            preferredDifficulties,
            notifications: {
                email: document.getElementById('emailNotif')?.checked || false,
                push: document.getElementById('pushNotif')?.checked || false,
                eventReminders: document.getElementById('eventReminders')?.checked || false,
                newMatches: document.getElementById('newMatches')?.checked || false
            }
        };

        try {
            const response = await fetch(`${SETTINGS_API_BASE}${config.ENDPOINTS.USERS.PREFERENCES}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            this.showToast('Settings saved!', 'success');
            this.close();
        } catch (error) {
            console.error('Error updating settings', error);
            this.showToast(error.message || 'Unable to save settings.', 'error');
        }
    }

    showToast(message, type = 'info') {
        const container = this.toastContainer || document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});