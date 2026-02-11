// Configuration for API endpoints
// Replace with your Google Apps Script web app URL or set to local server
export const API_URL = 'https://script.google.com/macros/s/AKfycbz-DZKGULoSBcQmhnevX9zSXqPi8PR3PrNKtYVp4sIIJOWg728nVmdSvTYrQ1x4-fpq/exec';

// Toggle backend: true = use Firebase/remote, false = use local `server.js` endpoints
export const USE_REMOTE_BACKEND = true;

// Admin password hashing (store salted SHA-256 hash to avoid plain-text password in source)
// Salt value used for hashing (keep as constant per deployment)
export const ADMIN_PW_SALT = 'tuckshop_salt_v1';
// SHA-256("EdgeAdmin" + ADMIN_PW_SALT) computed and stored here
export const ADMIN_PW_HASH = '2256c0e57453ea111041438ac71c8d13211aea4a762db7c1e9b4a4ba1209f0a5';

// Local API endpoints (used when USE_REMOTE_BACKEND is false)
export const LOCAL_API = {
	GET_ORDERS: '/api/orders',
	POST_ORDER: '/api/orders'
};