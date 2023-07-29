import React from 'react';
import FileUploader from './FileUploader';
import Chatbox from './Chatbox';
import { Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <FileUploader />
      <Chatbox />
    </Container>
  );
}

export default App;
