
const { google } = require('googleapis');
const path = require('path');

// Path to your service account JSON
const keyFile = path.join(__dirname, 'auth.json');

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

module.exports = { calendar };
