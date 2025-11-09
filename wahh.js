
const { TwitterApi } = require('twitter-api-v2');

// Initialize client with OAuth 1.0a (Read & Write)
const client = new TwitterApi({
  appKey: '3ozIBs4vQHX1J9qM4ymlsk7PS',        // API Key
  appSecret: 'DAI1jpkbGl1Dd5cZwpAAK9XbUC9IZXed2biwFPeLN5UgPvutgT', // API Key Secret
  accessToken: '1801415694812385284-lLSKAR6Dhx8aYVEtofrLFC8j3CXQa5', // Access Token
  accessSecret: 'qFvQyQqy3iWwJsrY2U26k0WWydjingK5cVCirGmlZxiOH',    // Access Secret
});

// Function to post tweet via v1.1 endpoint
async function postTweet(text) {
  try {
  const tweetId = '1987354065672806690';
  const tweet = await client.v2.singleTweet(tweetId, {
    'tweet.fields': ['public_metrics'],
  });
  console.log(tweet.data.public_metrics);
    console.log('Tweet posted successfully:', tweet.text);
  } catch (err) {
    console.error('Error posting tweet:', err);
  }


}

postTweet()

module.exports = { postTweet }
