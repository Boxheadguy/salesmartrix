// Fetch messages for a chat key

let messagesStore = {}; // shared with send-message

exports.handler = async (event) => {
  const { chatKey } = event.queryStringParameters || {};
  if (!chatKey) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing chatKey' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ messages: messagesStore[chatKey] || [] })
  };
};
