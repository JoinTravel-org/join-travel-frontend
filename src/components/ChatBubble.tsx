import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Fab, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Avatar, CircularProgress } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import apiService from '../services/api.service';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response?: string;
  conversationId?: string;
  timestamp: number;
}

const ChatBubble: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && authContext?.user) {
      loadChatHistory();
    }
  }, [isOpen, authContext?.user]);

  // Only show chat bubble if user is authenticated
  if (!authContext?.isAuthenticated || !authContext?.user) {
    return null;
  }

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(authContext.user!.id, { limit: 50 });
      if (response.success && response.messages) {
        const formattedMessages: Message[] = [];
        response.messages.forEach((msg: ChatMessage) => {
          // Add user message
          formattedMessages.push({
            id: msg.id + '_user',
            text: msg.message,
            sender: 'user',
            timestamp: msg.timestamp,
          });
          // Add AI response if exists
          if (msg.response) {
            formattedMessages.push({
              id: msg.id + '_ai',
              text: msg.response,
              sender: 'ai',
              timestamp: msg.timestamp + 1000, // Slight delay for AI response
            });
          }
        });
        setMessages(formattedMessages);
        // Set conversation ID from the first message if available
        if (response.messages.length > 0 && response.messages[0].conversationId) {
          setConversationId(response.messages[0].conversationId);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !authContext.user) return;

    const timestamp = Date.now();
    setIsLoading(true);

    const userMessage: Message = {
      id: timestamp.toString(),
      text: inputMessage,
      sender: 'user',
      timestamp,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      // Send message to API
      const response = await apiService.sendChatMessage({
        userId: authContext.user.id,
        message: messageToSend,
        conversationId: conversationId || undefined,
        timestamp,
      });

      if (response.success && response.message) {
        // Set conversation ID if this is the first message
        if (!conversationId && response.message.conversationId) {
          setConversationId(response.message.conversationId);
        }

        // Add AI response to messages
        if (response.message.response) {
          const aiMessage: Message = {
            id: response.message.id + '_ai',
            text: response.message.response,
            sender: 'ai',
            timestamp: response.message.timestamp + 1000,
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (timestamp + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: timestamp + 1000,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleToggleChat}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Interface */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 350,
            height: 500,
            borderRadius: 2,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">AI Chat Assistant</Typography>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <List>
              {messages.map((message) => (
                <ListItem key={message.id} sx={{ alignItems: 'flex-start', px: 0 }}>
                  <Avatar sx={{ mr: 1, bgcolor: message.sender === 'ai' ? 'primary.main' : 'secondary.main' }}>
                    {message.sender === 'ai' ? 'AI' : 'U'}
                  </Avatar>
                  <ListItemText
                    primary={message.text}
                    secondary={new Date(message.timestamp).toLocaleTimeString()}
                    sx={{
                      '& .MuiListItemText-primary': {
                        bgcolor: message.sender === 'ai' ? 'grey.100' : 'primary.light',
                        p: 1,
                        borderRadius: 1,
                        color: message.sender === 'ai' ? 'text.primary' : 'white',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{ ml: 1 }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatBubble;