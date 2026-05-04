// This file contains helper functions for our simulation scripts.
const fetch = require('node-fetch');

// When the simulation runs inside the backend process, call the local API (not a public URL).
const API_BASE_URL =
  process.env.SIMULATION_API_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 5000}/api`;

/**
 * A helper function to make a POST request to our backend API.
 * @param {string} endpoint The API endpoint to call (e.g., '/register').
 * @param {object} body The JSON body of the request.
 * @returns The JSON response from the server.
 */
async function postRequest(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return await response.json();
    }
    
    return await response.json();

  } catch (error) {
    console.error(`Failed to make POST request to ${endpoint}:`, error.message);
    return { success: false, message: error.message };
  }
}

module.exports = { postRequest };
