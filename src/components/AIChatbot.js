import React, { useState } from 'react';
import axios from 'axios';
import './AIChatbot.css';

function AIChatbot({ onSuggest, onAddTrip, trips }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: `You are a helpful travel assistant. Provide concise trip suggestions and details. 
You can also add or update trips in the database using the following formats:

To add a trip: [ACTION:{"type":"ADD_TRIP","trip":{"destination":"Paris","startDate":"2023-07-01","endDate":"2023-07-07","activities":"Visit Eiffel Tower, Louvre Museum"}}]

To update a trip: [ACTION:{"type":"UPDATE_TRIP","trip":{"id":1234567890,"destination":"Updated Destination","startDate":"2023-08-01","endDate":"2023-08-07","activities":"Updated activities"}}]

To suggest a trip without adding it to the database: [ACTION:{"type":"SUGGEST_TRIP","trip":{"destination":"Tokyo","startDate":"2023-09-01","endDate":"2023-09-07","activities":"Visit Tokyo Tower, Senso-ji Temple"}}]

Use these formats when the user asks to add, update, or suggest a trip.` },
              { role: "user", content: input }
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const aiResponse = response.data.choices[0].message.content;
        setMessages(prevMessages => [...prevMessages, { text: aiResponse, sender: 'ai' }]);

        const action = parseAction(aiResponse);
        if (action) {
          if (action.type === 'ADD_TRIP') {
            onAddTrip(action.trip);
            setMessages(prevMessages => [...prevMessages, { text: "Trip added successfully!", sender: 'system' }]);
          } else if (action.type === 'UPDATE_TRIP') {
            const updatedTrips = trips.map(trip => 
              trip.id === action.trip.id ? { ...trip, ...action.trip } : trip
            );
            onAddTrip(updatedTrips);
            setMessages(prevMessages => [...prevMessages, { text: "Trip updated successfully!", sender: 'system' }]);
          } else if (action.type === 'SUGGEST_TRIP') {
            onSuggest(action.trip);
          }
        }
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        setMessages(prevMessages => [...prevMessages, { text: "Sorry, I encountered an error. Please try again.", sender: 'ai' }]);
      } finally {
        setIsLoading(false);
      }

      setInput('');
    }
  };

  const parseAction = (response) => {
    const actionRegex = /\[ACTION:(.*?)\]/;
    const match = response.match(actionRegex);
    if (match) {
      const actionString = match[1];
      try {
        return JSON.parse(actionString);
      } catch (error) {
        console.error('Error parsing action:', error);
      }
    }
    return null;
  };

  return (
    <div className="ai-chatbot">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about trip details or to add/update trips..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default AIChatbot;
