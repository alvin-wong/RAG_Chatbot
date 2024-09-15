'use client';
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Optional: Support GitHub-Flavored Markdown (like tables, strikethrough, etc.)

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi! I am the University of Florida Student Advisor Chatbot! How can I help you today?'
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" } // Placeholder for the assistant's response
    ]);

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text, // Update message content incrementally
          }
        ];
      });
      return reader.read().then(processText);
    });
  };

  return (
    <Box width='100vw' height='100vh' display='flex' flexDirection='column' alignItems='center' justifyContent='center' bgcolor='#cf692c'>
      <Typography variant="h4" color="white" mb={2}>
        University of Florida Chat Support
      </Typography>
      <Stack direction='column' width='600px' height='700px' border='1px solid #0021A5' borderRadius={4} bgcolor='white' p={2} spacing={3} boxShadow={3}>
        <Stack direction='column' spacing={2} flexGrow={2} overflow="auto" maxHeight="100%">
          {
            messages.map((message, index) => (
              <Box key={index} display='flex' justifyContent={message.role === 'assistant' ? "flex-start" : 'flex-end'}>
                <Box
                  bgcolor={message.role === 'assistant' ? "#2d5396" : '#cf692c'}
                  color='white'
                  borderRadius={5}
                  p={3}
                  maxWidth='70%'
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <Typography {...props} />,
                      strong: ({ node, ...props }) => <Typography component="span" fontWeight="bold" {...props} />,
                      li: ({ node, ...props }) => <Typography component="li" {...props} style={{ marginLeft: '20px' }} />, // Customize list styling if needed
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction='row' spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevents the default behavior of adding a new line
                sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{ bgcolor: '#cf692c', '&:hover': { bgcolor: '#D84513' } }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
