const PROFILE_API_BASE = (window.config && window.config.API_URL) || '';

class Profile {
    constructor() {
        this.modal = document.getElementById('profileModal');
        this.openButton = document.getElementById('profileBtn');
        this.closeButton = this.modal ? this.modal.querySelector('[data-modal-close]') : null;
        this.roleSwitch = document.getElementById('roleSwitch');
        this.updateRoleButton = document.getElementById('updateRoleBtn');
        this.toastContainer = document.getElementById('toastContainer');

        if (!this.modal || !this.openButton) {
            return;
        }

        this.bindEvents();
        this.syncFromLocalStorage();
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
        if (this.updateRoleButton) {
            this.updateRoleButton.addEventListener('click', (e) => this.handleRoleUpdate(e));
        }
    }

    open() {
        this.syncFromLocalStorage();
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
    }

    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    syncFromLocalStorage() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const avatar = document.getElementById('profileAvatar');
        const name = document.getElementById('profileName');
        const email = document.getElementById('profileEmail');
        const phone = document.getElementById('profilePhone');
        const role = document.getElementById('profileRole');
        const created = document.getElementById('createdEventsCount');
        const joined = document.getElementById('joinedEventsCount');

        if (avatar) {
            avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : '👤';
        }
        if (name) name.textContent = user.name || 'User';
        if (email) email.textContent = user.email || '—';
        if (phone) phone.textContent = user.phone || '—';
        if (role) role.textContent = user.role || 'participant';
        if (created) created.textContent = user.createdEvents || 0;
        if (joined) joined.textContent = user.joinedEvents || 0;
        if (this.roleSwitch) {
            this.roleSwitch.value = user.role || 'participant';
        }
    }

    async handleRoleUpdate(e) {
        e.preventDefault();
        if (!this.roleSwitch) return;
        const newRole = this.roleSwitch.value;

        try {
            const response = await fetch(`${PROFILE_API_BASE}${config.ENDPOINTS.USERS.ROLE}`, {
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

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...user, role: newRole };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            if (window.auth) {
                window.auth.updateUIForLoggedInUser(updatedUser);
            } else {
                this.syncFromLocalStorage();
            }

            this.showToast('Role updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update role', error);
            this.showToast(error.message || 'Unable to update role.', 'error');
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
    window.profile = new Profile();
});