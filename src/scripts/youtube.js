const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// Load OAuth credentials
const CREDENTIALS_PATH = path.join(__dirname, 'auth.json'); // your downloaded OAuth client secrets
const TOKEN_PATH = path.join(__dirname, 'youtube.json');

const oAuthCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_id, client_secret, redirect_uris } = oAuthCredentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Scopes for YouTube upload
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

/**
 * Get and store OAuth token if not exists
 */
async function authorize() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:\n', authUrl);

  // Ask user for code
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('\nEnter the code from that page here: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Token stored to token.json');

  return oAuth2Client;
}

authorize()