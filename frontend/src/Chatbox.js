import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Box, Paper } from '@mui/material';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './Chatbox.css';

function Chatbox() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: question, type: 'user' },
      { content: '', type: 'bot' },
    ]);
  
    const response = await fetch('https://mrraquarious-bug-free-invention-rrq95w795v925vrw-5000.preview.app.github.dev/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
  
    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
  
      const processText = async ({ done, value }) => {
        if (done) {
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { content: responseText, type: 'bot' },
          ]);
          return;
        }
  
        responseText += decoder.decode(value, { stream: true });
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { content: responseText, type: 'bot' },
        ]);
  
        reader.read().then(processText);
      };
  
      reader.read().then(processText);
    }
  
    setQuestion('');
  };
  
  
  
  return (
    <Box component="div" flexGrow={1} display="flex" flexDirection="column" justifyContent="space-between">
      <Paper
        elevation={3}
        sx={{
          height: '60%',
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <TransitionGroup>
        {messages.map((message, index) => (
          <CSSTransition key={index} timeout={500} classNames="message-transition">
            <div className="message-container">
              <div className={`message ${message.type}`}>{message.content}</div>
            </div>
          </CSSTransition>
        ))}
        </TransitionGroup>
        <div ref={messagesEndRef} />
        </Paper>
      <form onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <TextField
          variant="outlined"
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question"
          sx={{ mt: 1 }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 1, ml: 1 }}>
          Send
        </Button>
      </form>
    </Box>
  );
}

export default Chatbox;