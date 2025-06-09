class EventSwipe {
    constructor() {
        this.cardStack = document.querySelector('.card-stack');
        this.likeButton = document.querySelector('.like-button');
        this.passButton = document.querySelector('.pass-button');
        this.matchCounter = document.querySelector('.match-counter');
        this.currentCard = null;
        this.currentIndex = 0;
        this.events = [];
        
        this.initializeEventListeners();
        this.loadEvents();
    }

    initializeEventListeners() {
        this.likeButton.addEventListener('click', () => this.handleLike());
        this.passButton.addEventListener('click', () => this.handlePass());
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load events');
            }

            this.events = await response.json();
            this.displayNextEvent();

        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('Failed to load events. Please try again later.');
        }
    }

    displayNextEvent() {
        if (this.currentIndex >= this.events.length) {
            this.showNoMoreEvents();
            return;
        }

        const event = this.events[this.currentIndex];
        this.currentCard = this.createEventCard(event);
        this.cardStack.innerHTML = '';
        this.cardStack.appendChild(this.currentCard);
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-image" style="background-image: url('${event.image || 'default-event.jpg'}')">
                <div class="difficulty-tag ${event.difficulty.toLowerCase()}">${event.difficulty}</div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-details">
                    <span class="event-date">${new Date(event.date).toLocaleDateString()}</span>
                    <span class="event-location">${event.location}</span>
                </div>
                <div class="event-organizer">
                    <img src="${event.organizer.avatar || 'default-avatar.jpg'}" alt="${event.organizer.name}">
                    <span>${event.organizer.name}</span>
                </div>
            </div>
        `;
        return card;
    }

    async handleLike() {
        if (!this.currentCard) return;

        const event = this.events[this.currentIndex];
        try {
            const response = await fetch(`/api/events/${event._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to like event');
            }

            // Animate card swipe right
            this.currentCard.style.transform = 'translateX(150%) rotate(30deg)';
            this.currentCard.style.opacity = '0';

            // Update match counter if it's a match
            const data = await response.json();
            if (data.isMatch) {
                this.updateMatchCounter();
                this.showMatchNotification(event);
            }

            // Move to next event after animation
            setTimeout(() => {
                this.currentIndex++;
                this.displayNextEvent();
            }, 300);

        } catch (error) {
            console.error('Error liking event:', error);
            this.showError('Failed to like event. Please try again.');
        }
    }

    async handlePass() {
        if (!this.currentCard) return;

        const event = this.events[this.currentIndex];
        try {
            const response = await fetch(`/api/events/${event._id}/pass`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to pass event');
            }

            // Animate card swipe left
            this.currentCard.style.transform = 'translateX(-150%) rotate(-30deg)';
            this.currentCard.style.opacity = '0';

            // Move to next event after animation
            setTimeout(() => {
                this.currentIndex++;
                this.displayNextEvent();
            }, 300);

        } catch (error) {
            console.error('Error passing event:', error);
            this.showError('Failed to pass event. Please try again.');
        }
    }

    updateMatchCounter() {
        const currentCount = parseInt(this.matchCounter.textContent);
        this.matchCounter.textContent = currentCount + 1;
    }

    showMatchNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = `
            <h3>It's a Match! 🎉</h3>
            <p>You and ${event.organizer.name} are both interested in ${event.title}</p>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showNoMoreEvents() {
        this.cardStack.innerHTML = `
            <div class="no-events">
                <h3>No More Events</h3>
                <p>Check back later for new events!</p>
            </div>
        `;
    }

    showError(message) {
        const errorNotification = document.createElement('div');
        errorNotification.className = 'error-notification';
        errorNotification.textContent = message;
        document.body.appendChild(errorNotification);

        // Remove error notification after 3 seconds
        setTimeout(() => {
            errorNotification.remove();
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventSwipe = new EventSwipe();
}); 