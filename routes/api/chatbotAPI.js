// routes/api/chatbotAPI.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../../controllers/chatbotController');

// Send message to chatbot
router.post('/chat/message', chatbotController.sendMessage);

// Get chat history
router.get('/chat/history', chatbotController.getChatHistory);

// Clear chat session
router.post('/chat/clear', chatbotController.clearChat);

// Get suggested questions
router.get('/chat/suggestions', chatbotController.getSuggestedQuestions);

module.exports = router;
