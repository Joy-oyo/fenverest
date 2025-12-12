const config = {
    API_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            VERIFY_PHONE: '/auth/verify-phone',
            RESEND_CODE: '/auth/resend-code'
        },
        USERS: {
            PROFILE: '/users/profile',
            ROLE: '/users/role',
            PREFERENCES: '/users/preferences'
        },
        EVENTS: {
            LIST: '/events',
            LIKE: '/events/:id/like',
            PASS: '/events/:id/pass'
        }
    }
}; 