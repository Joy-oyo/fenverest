class Profile {
    constructor() {
        this.profileModal = document.getElementById('profileModal');
        this.profileForm = document.getElementById('profileForm');
        this.profileButton = document.querySelector('.profile-button');
        this.closeProfileButton = document.querySelector('.close-profile');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.profileButton.addEventListener('click', () => this.openProfile());
        this.closeProfileButton.addEventListener('click', () => this.closeProfile());
        this.profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    openProfile() {
        this.loadProfileData();
        this.profileModal.style.display = 'block';
    }

    closeProfile() {
        this.profileModal.style.display = 'none';
    }

    async loadProfileData() {
        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile data');
            }

            const userData = await response.json();
            this.populateProfileForm(userData);

        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile data. Please try again.');
        }
    }

    populateProfileForm(userData) {
        const form = this.profileForm;
        form.querySelector('input[name="name"]').value = userData.name || '';
        form.querySelector('input[name="email"]').value = userData.email || '';
        form.querySelector('input[name="bio"]').value = userData.bio || '';
        form.querySelector('input[name="location"]').value = userData.location || '';
        
        // Set avatar preview if exists
        const avatarPreview = form.querySelector('.avatar-preview');
        if (userData.avatar) {
            avatarPreview.style.backgroundImage = `url(${userData.avatar})`;
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        const formData = new FormData(this.profileForm);
        const profileData = {
            name: formData.get('name'),
            email: formData.get('email'),
            bio: formData.get('bio'),
            location: formData.get('location')
        };

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            
            // Update local storage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({
                ...currentUser,
                ...updatedUser
            }));

            // Update UI
            this.updateUIForUser(updatedUser);
            this.showSuccess('Profile updated successfully!');
            this.closeProfile();

        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile. Please try again.');
        }
    }

    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/users/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }

            const data = await response.json();
            
            // Update avatar preview
            const avatarPreview = this.profileForm.querySelector('.avatar-preview');
            avatarPreview.style.backgroundImage = `url(${data.avatarUrl})`;

            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({
                ...currentUser,
                avatar: data.avatarUrl
            }));

            this.showSuccess('Avatar updated successfully!');

        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.showError('Failed to upload avatar. Please try again.');
        }
    }

    updateUIForUser(user) {
        // Update user menu
        const userMenu = document.querySelector('.user-menu');
        const userName = userMenu.querySelector('.user-name');
        userName.textContent = user.name;

        // Update avatar if exists
        const avatar = userMenu.querySelector('.user-avatar');
        if (user.avatar) {
            avatar.style.backgroundImage = `url(${user.avatar})`;
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

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
}); 