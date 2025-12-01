const API_BASE = (window.config && window.config.API_URL) || '';

const buildUrl = (endpoint = '') => `${API_BASE}${endpoint}`;

class EventSwipe {
    constructor() {
        this.cardStack = document.getElementById('cardStack');
        this.likeButton = document.getElementById('likeBtn');
        this.passButton = document.getElementById('passBtn');
        this.matchCount = document.getElementById('matchCount');
        this.toastContainer = document.getElementById('toastContainer');

        if (!this.cardStack || !this.likeButton || !this.passButton) {
            console.warn('EventSwipe: missing core DOM nodes, aborting init.');
            return;
        }

        this.events = [];
        this.currentIndex = 0;
        this.isPerformingAction = false;

        this.bindEvents();
        this.setLoadingState(true);
        this.loadEvents();
    }

    get authToken() {
        return localStorage.getItem('token');
    }

    bindEvents() {
        this.likeButton.addEventListener('click', () => this.handleCardAction('like'));
        this.passButton.addEventListener('click', () => this.handleCardAction('pass'));
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.cardStack.innerHTML = `
                <div class="loading-state">
                    <p>Fetching experiences near you…</p>
                </div>
            `;
        }
    }

    async loadEvents() {
        if (!this.authToken) {
            this.showEmptyState('Login required', 'Sign in to start discovering events.');
            return;
        }

        this.setLoadingState(true);

        try {
            const response = await fetch(buildUrl(config.ENDPOINTS.EVENTS.LIST), {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load events');
            }

            this.events = await response.json() || [];
            this.currentIndex = 0;

            if (!this.events.length) {
                this.showNoMoreEvents();
                return;
            }

            this.displayNextEvent();
        } catch (error) {
            console.error('Error loading events:', error);
            this.showEmptyState('Unable to load events', 'Please try again shortly.');
            this.showToast('Could not load events, please retry.', 'error');
        }
    }

    getAuthHeaders() {
        const headers = {};
        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }
        return headers;
    }

    displayNextEvent() {
        if (this.currentIndex >= this.events.length) {
            this.showNoMoreEvents();
            return;
        }

        const event = this.events[this.currentIndex];
        const card = this.createEventCard(event);
        this.cardStack.innerHTML = '';
        this.cardStack.appendChild(card);
    }

    createEventCard(event = {}) {
        const { organizer = {} } = event;
        const hasImage = Boolean(event.image);
        const difficultyLabel = event.difficulty || 'All Levels';
        const difficultyClass = difficultyLabel.toLowerCase().replace(/\s+/g, '-');

        const card = document.createElement('div');
        card.className = 'event-card new-card';
        card.innerHTML = `
            <div class="event-image ${hasImage ? '' : 'event-image--placeholder'}" ${hasImage ? `style="background-image: url('${event.image}')"` : ''}>
                <div class="difficulty-tag ${difficultyClass}">${difficultyLabel}</div>
            </div>
            <div class="event-content">
                <h3>${event.title || 'Untitled Event'}</h3>
                <p class="event-description">${event.description || 'Details are coming soon.'}</p>
                <div class="event-details">
                    <span class="event-date">${event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</span>
                    <span class="event-location">${event.location || 'Location TBA'}</span>
                </div>
                <div class="event-organizer">
                    <div class="organizer-avatar">${(organizer.name || 'U')[0]}</div>
                    <span>${organizer.name || 'Organizer'}</span>
                </div>
            </div>
        `;
        return card;
    }

    async handleCardAction(type) {
        if (this.isPerformingAction || !this.events.length) {
            return;
        }

        const event = this.events[this.currentIndex];
        if (!event || !event._id) {
            this.showToast('Something went wrong with this event.', 'error');
            return;
        }

        const endpointTemplate = type === 'like'
            ? config.ENDPOINTS.EVENTS.LIKE
            : config.ENDPOINTS.EVENTS.PASS;
        const endpoint = endpointTemplate.replace(':id', event._id);

        this.isPerformingAction = true;
        this.animateCard(type);

        try {
            const response = await fetch(buildUrl(endpoint), {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to ${type} event`);
            }

            if (type === 'like') {
                const data = await response.json();
                if (data?.isMatch) {
                    this.incrementMatchCounter();
                    this.showMatchNotification(event);
                }
            }

            setTimeout(() => {
                this.currentIndex += 1;
                this.isPerformingAction = false;
                this.displayNextEvent();
            }, 320);
        } catch (error) {
            console.error(`Error trying to ${type} event`, error);
            this.isPerformingAction = false;
            this.showToast(`Unable to ${type} this event.`, 'error');
            this.displayNextEvent();
        }
    }

    animateCard(type) {
        const card = this.cardStack.querySelector('.event-card');
        if (!card) {
            return;
        }
        const direction = type === 'like' ? 1 : -1;
        requestAnimationFrame(() => {
            card.style.transform = `translateX(${150 * direction}%) rotate(${30 * direction}deg)`;
            card.style.opacity = '0';
        });
    }

    incrementMatchCounter() {
        if (!this.matchCount) return;
        const currentCount = parseInt(this.matchCount.textContent, 10) || 0;
        this.matchCount.textContent = currentCount + 1;
    }

    showMatchNotification(event = {}) {
        const organizerName = (event.organizer && event.organizer.name) || 'the organizer';
        const eventTitle = event.title || 'this event';
        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = `
            <h3>It's a Match! 🎉</h3>
            <p>You and ${organizerName} both liked ${eventTitle}.</p>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    showEmptyState(title, subtitle) {
        this.cardStack.innerHTML = `
            <div class="empty-state">
                <h3>${title}</h3>
                <p>${subtitle}</p>
            </div>
        `;
    }

    showNoMoreEvents() {
        this.showEmptyState('No more events', 'Check back later for fresh matches.');
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 200);
        }, 3200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.eventSwipe = new EventSwipe();
});