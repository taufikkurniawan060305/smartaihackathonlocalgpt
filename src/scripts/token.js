const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const oAuthFile = path.join(__dirname, 'auth.json');
const oAuthCredentials = JSON.parse(fs.readFileSync(oAuthFile));
const { client_id, client_secret, redirect_uris } = oAuthCredentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Scopes for Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:\n', authUrl);

  // Ask user to paste the code from browser
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('\nEnter the code from that page here: ', async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      fs.writeFileSync(path.join(__dirname, 'token.json'), JSON.stringify(tokens, null, 2));
      console.log('✅ Token stored to token.json');
    } catch (err) {
      console.error('❌ Error retrieving access token', err);
    }
    readline.close();
  });
}

main();

