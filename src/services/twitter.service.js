// const { TwitterApi } = require('twitter-api-v2');

// const client = new TwitterApi({
//   appKey: 'VYJxXdXMFjQ8ty3qD9cJvTmAT',
//   appSecret: 'Bh4kYkn4yBxeX1bqMOjwm5k3AAOq1JIKDTRL2523tnkMprQ07F',
//   accessToken: '1801415694812385284-lLSKAR6Dhx8aYVEtofrLFC8j3CXQa5',
//   accessSecret: 'qFvQyQqy3iWwJsrY2U26k0WWydjingK5cVCirGmlZxiOH',
// });
// // bearer : AAAAAAAAAAAAAAAAAAAAAE5u5QEAAAAAj43zpI6HBdQiP1CpT%2BKHlkfVJRQ%3DP2Lhkai2JEG1vDiYIIlVStO07cWg5Emx9VAIPPzO6v8yB9Jel0
// async function postTweetV2(text) {
//   try {
//     const tweet = await client.v2.tweet(text); // uses v2 endpoint
//     console.log('Tweet posted via v2:', tweet.data.text);
//   } catch (err) {
//     console.error('Error posting tweet via v2:', err);
//   }
// }

// postTweetV2('Hello world! Posting via v2 API 🚀');

// // API Key

// // 3ozIBs4vQHX1J9qM4ymlsk7PS

// // API Key Secret

// // DAI1jpkbGl1Dd5cZwpAAK9XbUC9IZXed2biwFPeLN5UgPvutgT

// // Client_iD

// // R3VMY3kzS1hlTXRnQm9oaUQ1ZkU6MTpjaQ

// // Client secret

// // FU5u2XYcXboon2RVTE0V3RblLQvYST_uKa4ZeSWMSK3Mqniq8P

const { TwitterApi } = require('twitter-api-v2');

// Initialize client with OAuth 1.0a (Read & Write)
const client = new TwitterApi({
  appKey: '3ozIBs4vQHX1J9qM4ymlsk7PS',        // API Key
  appSecret: 'DAI1jpkbGl1Dd5cZwpAAK9XbUC9IZXed2biwFPeLN5UgPvutgT', // API Key Secret
  accessToken: '1801415694812385284-lLSKAR6Dhx8aYVEtofrLFC8j3CXQa5', // Access Token
  accessSecret: 'qFvQyQqy3iWwJsrY2U26k0WWydjingK5cVCirGmlZxiOH',    // Access Secret
});

async function postTweet(text) {
  try {
    const tweet = await client.v2.tweet(text); // v2 endpoint
    console.log('Tweet posted successfully:', tweet.data.text);

    // Return the tweet ID
    return tweet.data.id;
  } catch (err) {
    console.error('Error posting tweet:', err);
    throw err; // propagate error
  }
}


module.exports = { postTweet }
