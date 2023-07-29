import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function FileUploader() {
  const handleChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://mrraquarious-bug-free-invention-rrq95w795v925vrw-5000.preview.app.github.dev/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <Box component="div" sx={{ height: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload your file
      </Typography>
      <Button
        variant="contained"
        component="label"
        color="primary"
        startIcon={<CloudUploadIcon />}
      >
        Upload File
        <input type="file" hidden onChange={handleChange} />
      </Button>
    </Box>
  );
}

export default FileUploader;