import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/ChatbotPage.css';
import chatbot from "../assets/ChatBot.png";

// Base URL for the API
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to format the time
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ChatbotPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState(null);

  // Fetch FAQs from backend on component mount
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/faqs`);
        setFaqs(response.data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        setError('Failed to load FAQs.');
      }
    };

    fetchFAQs();
  }, []);

  // Handle clicking on an FAQ
  const handleFAQClick = (faq) => {
    const timestamp = new Date().toISOString();
    setShowChat(true);
    setMessages([
      { type: 'user', text: faq.question, timestamp },
      {
        type: 'bot',
        text: `Here's information about: ${faq.question}`,
        details: faq.answer,
        image: faq.imageUrl,
        timestamp,
      }
    ]);
  };

  // Handle the search action (on button click)
const handleSearch = async () => {
  const timestamp = new Date().toISOString();
  try {
    const response = await axios.get(`${API_BASE_URL}/faqs`);
    const filteredFAQ = response.data.find(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredFAQ) {
      setShowChat(true);
      setMessages([
        { type: 'user', text: searchQuery, timestamp },
        {
          type: 'bot',
          text: `Here's information about ${filteredFAQ.question}:`,
          details: filteredFAQ.answer,
          image: filteredFAQ.imageUrl,
          timestamp,
        }
      ]);
    } else {
      setMessages([
        { type: 'user', text: searchQuery, timestamp },
        { type: 'bot', text: `No Fruit found for "${searchQuery}".`, timestamp }
      ]);
    }
  } catch (error) {
    console.error('Failed to search FAQs:', error);
    setError('Failed to search FAQs.');
  } finally {
    // Clear the input field after the search is performed
    setSearchQuery('');
  }
};


  return (
    <div className="chatbot-page">
      <header className="header">
        {/* <img src={chatbot} alt="Chatbot Logo" className="logo" /> */}
        <h1 className="chatbot-name">Chatbot</h1>
      </header>

      <div className="chatbot-container">
        {error && <p className="error-message">{error}</p>}
        {showChat ? (
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.type === 'user' && <p>{msg.text}</p>}
                {msg.type === 'bot' && (
                  <div className="message-content">
                    <p className="question">{msg.text}</p>
                    <p className="answer">{msg.details}</p>
                    {msg.image && (
                      <img
                        src={`http://localhost:5000/${msg.image}`} // Add base URL for images
                        alt="Detail"
                        className="message-image"
                        onError={(e) => {
                          e.target.src = 'http://localhost:5000/uploads/default-image.jpg'; // Fallback image
                        }}
                      />
                    )}
                  </div>
                )}
                <span className="timestamp">{formatTime(msg.timestamp)}</span> {/* Display time */}
              </div>
            ))}
          </div>
        ) : (
          <div className="content-list">
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-card"
                  onClick={() => handleFAQClick(faq)}
                >
                  <p className="faq-question">{faq.question}</p>
                  {faq.imageUrl && (
                    <img
                      src={`http://localhost:5000/${faq.imageUrl}`} // Add base URL for images
                      alt={faq.question}
                      className="faq-image"
                      onError={(e) => {
                        e.target.src = 'http://localhost:5000/uploads/default-image.jpg'; // Fallback image
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <input
          type="text"
          placeholder="Type a question..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="send-button" onClick={handleSearch}>Send</button>
      </footer>
    </div>
  );
};

export default ChatbotPage;
