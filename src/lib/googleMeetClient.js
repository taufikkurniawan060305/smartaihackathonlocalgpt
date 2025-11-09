const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load OAuth credentials
const oAuthFile = path.join(__dirname, 'auth.json');
const oAuthCredentials = JSON.parse(fs.readFileSync(oAuthFile));
const { client_id, client_secret, redirect_uris } = oAuthCredentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load user token
const tokenFile = path.join(__dirname, 'token.json');
const token = JSON.parse(fs.readFileSync(tokenFile));
oAuth2Client.setCredentials(token);

// Calendar instance using OAuth2
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

/**
 * Create a Google Calendar event with a Meet link
 * @param {Object} params
 * @param {string} params.summary
 * @param {string} params.description
 * @param {Date} params.startDate
 * @param {Date} params.endDate
 * @returns {Promise<{htmlLink: string, meetLink: string}>}
 */
async function createCalendarEvent({ summary, description, startDate, endDate, isMeeting = false }) {

  console.log(isMeeting, "maaa")
  const event = {
    summary,
    description,
    start: { dateTime: startDate.toISOString(), timeZone: 'UTC' },
    end: { dateTime: endDate.toISOString(), timeZone: 'UTC' },
  };

  if (isMeeting) {
    event.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: isMeeting ? 1 : 0,
  });

  
  const meetLink = isMeeting
    ? res.data?.conferenceData?.entryPoints?.[0]?.uri || null
    : null;

  console.log(meetLink, "brop")
  return { htmlLink: res.data.htmlLink, meetLink };
}

module.exports = { createCalendarEvent };
