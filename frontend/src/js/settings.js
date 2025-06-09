class Settings {
    constructor() {
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsForm = document.getElementById('settingsForm');
        this.settingsButton = document.querySelector('.settings-button');
        this.closeSettingsButton = document.querySelector('.close-settings');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.settingsButton.addEventListener('click', () => this.openSettings());
        this.closeSettingsButton.addEventListener('click', () => this.closeSettings());
        this.settingsForm.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
    }

    openSettings() {
        this.loadSettings();
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/users/preferences', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load settings');
            }

            const preferences = await response.json();
            this.populateSettingsForm(preferences);

        } catch (error) {
            console.error('Error loading settings:', error);
            this.showError('Failed to load settings. Please try again.');
        }
    }

    populateSettingsForm(preferences) {
        const form = this.settingsForm;
        
        // Set interests
        const interests = form.querySelectorAll('input[name="interests"]');
        interests.forEach(checkbox => {
            checkbox.checked = preferences.interests.includes(checkbox.value);
        });

        // Set difficulty preferences
        const difficulties = form.querySelectorAll('input[name="difficulty"]');
        difficulties.forEach(checkbox => {
            checkbox.checked = preferences.preferredDifficulties.includes(checkbox.value);
        });

        // Set location preferences
        form.querySelector('input[name="maxDistance"]').value = preferences.maxDistance || 50;
        form.querySelector('input[name="location"]').value = preferences.location || '';

        // Set notification preferences
        form.querySelector('input[name="emailNotifications"]').checked = preferences.notifications.email;
        form.querySelector('input[name="pushNotifications"]').checked = preferences.notifications.push;
        form.querySelector('input[name="eventReminders"]').checked = preferences.notifications.eventReminders;

        // Set privacy settings
        form.querySelector('input[name="profileVisibility"]').checked = preferences.privacy.profileVisibility;
        form.querySelector('input[name="showLocation"]').checked = preferences.privacy.showLocation;
    }

    async handleSettingsUpdate(e) {
        e.preventDefault();
        const formData = new FormData(this.settingsForm);
        
        const settingsData = {
            interests: Array.from(formData.getAll('interests')),
            preferredDifficulties: Array.from(formData.getAll('difficulty')),
            maxDistance: parseInt(formData.get('maxDistance')),
            location: formData.get('location'),
            notifications: {
                email: formData.get('emailNotifications') === 'on',
                push: formData.get('pushNotifications') === 'on',
                eventReminders: formData.get('eventReminders') === 'on'
            },
            privacy: {
                profileVisibility: formData.get('profileVisibility') === 'on',
                showLocation: formData.get('showLocation') === 'on'
            }
        };

        try {
            const response = await fetch('/api/users/preferences', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            this.showSuccess('Settings updated successfully!');
            this.closeSettings();

        } catch (error) {
            console.error('Error updating settings:', error);
            this.showError('Failed to update settings. Please try again.');
        }
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
}); 