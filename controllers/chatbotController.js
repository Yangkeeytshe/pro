// controllers/chatbotController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Bhutanese clothing context for the AI
const BHUTANESE_CONTEXT = `
You are a helpful assistant for Mom's Art, a Bhutanese traditional clothing store.

KEEP RESPONSES BRIEF AND CONCISE (2-3 sentences max).

KEY PRODUCTS:
- Gho: Men's traditional robe
- Kira: Women's traditional dress
- Tego: Jacket worn with Kira
- Wonju: Blouse worn under Tego
- Kabney/Rachu: Traditional scarves

OCCASIONS: Festivals, weddings, ceremonies, daily wear, office wear

CARE: Hand wash cold water, dry clean silk items, store in cool dry place

SIZING: Gho measured by chest/length, Kira one-size-fits-most with belt, Tego S-XL

Always give short, helpful answers about Bhutanese clothing, sizing, care, and cultural significance.
`;

// Generate session ID for anonymous users
const generateSessionId = () => {
  return uuidv4();
};

// Get or create chat session
const getOrCreateSession = async (req) => {
  const userId = req.session.user ? req.session.user.id : null;
  let sessionId = req.session.chatSessionId;

  if (!sessionId) {
    sessionId = generateSessionId();
    req.session.chatSessionId = sessionId;

    // Store session in database
    const insertSessionQuery = 'INSERT INTO chat_sessions (user_id, session_id) VALUES (?, ?)';
    return new Promise((resolve, reject) => {
      db.query(insertSessionQuery, [userId, sessionId], (err, result) => {
        if (err) {
          console.error('Error creating chat session:', err);
          reject(err);
        } else {
          resolve(sessionId);
        }
      });
    });
  }

  return sessionId;
};

// Store message in database
const storeMessage = async (sessionId, messageType, content) => {
  const insertMessageQuery = 'INSERT INTO chat_messages (session_id, message_type, message_content) VALUES (?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.query(insertMessageQuery, [sessionId, messageType, content], (err, result) => {
      if (err) {
        console.error('Error storing message:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Send message to chatbot
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Get or create session
    const sessionId = await getOrCreateSession(req);

    // Store user message
    await storeMessage(sessionId, 'user', message);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt with context
    const prompt = `${BHUTANESE_CONTEXT}\n\nUser question: ${message}\n\nProvide a brief, helpful response (2-3 sentences max):`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botMessage = response.text();

    // Store bot response
    await storeMessage(sessionId, 'bot', botMessage);

    res.json({
      success: true,
      message: botMessage,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const sessionId = req.session.chatSessionId;

    if (!sessionId) {
      return res.json({
        success: true,
        messages: []
      });
    }

    const query = `
      SELECT message_type, message_content, created_at 
      FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC 
      LIMIT 50
    `;

    db.query(query, [sessionId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        messages: results
      });
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear chat session
exports.clearChat = async (req, res) => {
  try {
    const sessionId = req.session.chatSessionId;

    if (sessionId) {
      // Mark session as inactive
      const updateSessionQuery = 'UPDATE chat_sessions SET is_active = FALSE WHERE session_id = ?';
      db.query(updateSessionQuery, [sessionId], (err, result) => {
        if (err) {
          console.error('Error clearing chat session:', err);
        }
      });
    }

    // Clear session
    delete req.session.chatSessionId;

    res.json({
      success: true,
      message: 'Chat cleared successfully'
    });

  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get suggested questions for first-time users
exports.getSuggestedQuestions = (req, res) => {
  const suggestions = [
    "What is the difference between a Gho and Kira?",
    "What should I wear to a Bhutanese wedding?",
    "How do I care for silk traditional clothing?",
    "What size Gho should I order?",
    "What are the traditional colors for festivals?",
    "Can you help me find daily wear traditional clothing?"
  ];

  res.json({
    success: true,
    suggestions: suggestions
  });
};
