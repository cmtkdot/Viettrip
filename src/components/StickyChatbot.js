import React, { useState } from 'react';
import AIChatbot from './AIChatbot';
import './StickyChatbot.css';

function StickyChatbot({ trips, onAddTrip, onUpdateTrip }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sticky-chatbot ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <AIChatbot
          onSuggest={onAddTrip}
          onAddTrip={onAddTrip}
          onUpdateTrip={onUpdateTrip}
          trips={trips}
        />
      )}
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      </button>
    </div>
  );
}

export default StickyChatbot;
