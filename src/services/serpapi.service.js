// src/services/serpapi.service.js
const { getJson } = require("serpapi");

/**
 * Cari query di Google via SerpAPI
 * @param {string} query
 * @returns {Promise<Array>} organic_results
 */
async function searchGoogle(query) {
  try {
    const response = await getJson({
      engine: "google",
      api_key: process.env.SERPAPI_KEY, // simpan API key di environment variable
      q: query,
      location: "Indonesia",
      hl: "id",
      gl: "id"
    });

    return response.organic_results || [];
  } catch (err) {
    console.error("SerpAPI Error:", err.message);
    return [];
  }
}

module.exports = { searchGoogle };
