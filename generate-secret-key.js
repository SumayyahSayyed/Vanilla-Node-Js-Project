const crypto = require('crypto');

// Generate a random secret key
const key = crypto.randomBytes(32).toString('hex');

console.log('Generated Secret Key:', key);