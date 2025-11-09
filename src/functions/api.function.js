
async function callReadStringAPI(text) {
  try {
    const response = await fetch('https://dauntless-dandiacally-quinn.ngrok-free.dev/api/read_string', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log("responsnya", response)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

// Export the function using module.exports
module.exports = {
  callReadStringAPI
};