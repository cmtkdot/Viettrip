import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const AIChatbot = ({ onAddActivity }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add user message to chat
    setMessages([...messages, { type: 'user', content: input }]);

    // TODO: Replace this with actual AI processing
    const aiResponse = processInput(input);

    // Add AI response to chat
    setMessages(prevMessages => [...prevMessages, { type: 'ai', content: aiResponse }]);

    // Clear input
    setInput('');

    // If the AI suggested an activity, add it
    if (aiResponse.includes('Added activity:')) {
      const activity = aiResponse.split('Added activity:')[1].trim();
      onAddActivity(activity);
    }
  };

  // Simple input processing function (replace with actual AI later)
  const processInput = (input) => {
    const lowercaseInput = input.toLowerCase();
    if (lowercaseInput.includes('recommend') || lowercaseInput.includes('suggest')) {
      return "Here are some recommended activities: 1. Visit the Eiffel Tower, 2. Take a Seine River cruise, 3. Explore the Louvre Museum";
    } else if (lowercaseInput.includes('add')) {
      const activity = input.split('add')[1].trim();
      return `Added activity: ${activity}`;
    } else {
      return "I'm sorry, I didn't understand that. You can ask me to recommend activities or add an activity to your trip.";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Trip Planner AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px] overflow-y-auto space-y-2">
            {messages.map((message, index) => (
              <div key={index} className={`p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                {message.content}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for recommendations or add activities..."
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatbot;
