// Netlify serverless function to handle message persistence
// Stores messages in a simple JSON file or memory (for demo)

const fs = require('fs');
const path = require('path');

// simple in-memory store (persists per function deployment)
let messagesStore = {};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { chatKey, message } = JSON.parse(event.body);
    if (!chatKey || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing chatKey or message' }) };
    }

    // store message in memory
    if (!messagesStore[chatKey]) {
      messagesStore[chatKey] = [];
    }
    messagesStore[chatKey].push(message);

    // broadcast to other clients via a simple endpoint (optional: use third-party realtime)
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, stored: true })
    };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
