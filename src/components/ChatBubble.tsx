import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Fab, Paper, Typography, TextField, Button, List, ListItem, ListItemText, Avatar, CircularProgress, IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
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
  createdAt: string;
}

const ChatBubble: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome message
  const welcomeMessage: Message = {
    id: 'welcome',
    text: '¡Hola! 👋✨\n Puedo ayudarte con tus necesidades de viaje 🌍✈️\n¡Pregúntame sobre lugares increíbles 🏖️, reseñas 📝 o qué destinos se adaptan mejor a ti!',
    sender: 'ai',
    timestamp: Date.now(),
  };

  useEffect(() => {
    if (isOpen && authContext?.user) {
      loadChatHistory();
    }
  }, [isOpen, authContext?.user]);

  // Separate effect to show welcome message immediately when chat opens
  useEffect(() => {
    if (isOpen && authContext?.isAuthenticated && authContext?.user && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen, authContext?.isAuthenticated, authContext?.user, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatRef.current &&
        fabRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        !fabRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory({ limit: 50 });
      if (response.success && response.messages) {
        const formattedMessages: Message[] = [];
        response.messages.forEach((msg: ChatMessage) => {
          // Add user message
          formattedMessages.push({
            id: msg.id + '_user',
            text: msg.message,
            sender: 'user',
            timestamp: new Date(msg.createdAt).getTime(),
          });
          // Add AI response if exists
          if (msg.response) {
            formattedMessages.push({
              id: msg.id + '_ai',
              text: msg.response,
              sender: 'ai',
              timestamp: new Date(msg.createdAt).getTime() + 1000, // Slight delay for AI response
            });
          }
        });
        // Sort messages by timestamp (oldest first)
        formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(formattedMessages);
        // Set conversation ID from the first message if available
        if (response.messages.length > 0 && response.messages[0].conversationId) {
          setConversationId(response.messages[0].conversationId);
        }
      } else {
        // No chat history, show welcome message for authenticated users
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // On error, show welcome message
      setMessages([welcomeMessage]);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    // Clear messages when closing chat
    if (isOpen) {
      setMessages([]);
    }
  };

  const handleNewChat = async () => {
    try {
      // Delete all chat history for the user
      await apiService.deleteAllChatHistory();
      // Clear messages and conversation ID, show welcome message
      setMessages([welcomeMessage]);
      setConversationId(null);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to start new chat:', error);
      // On error, still show welcome message
      setMessages([welcomeMessage]);
      setConversationId(null);
      setInputMessage('');
    }
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
            timestamp: new Date(response.message.createdAt).getTime() + 1000,
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (timestamp + 1).toString(),
        text: 'Perdona, hubo un error. Intenta de nuevo!',
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
        ref={fabRef}
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
          ref={chatRef}
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 400,
            height: 550,
            borderRadius: 2,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI Chat Assistant</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Start New Chat">
                <IconButton
                  onClick={handleNewChat}
                  size="medium"
                  color="primary"
                  disabled={isLoading || !authContext?.isAuthenticated}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.400',
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Messages or Login Prompt */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {authContext?.isAuthenticated && authContext?.user ? (
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
                <div ref={messagesEndRef} />
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Por favor inicie sesión para poder usar el AI Chat Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Debes estar logeado para usar esta característica.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Input */}
          {authContext?.isAuthenticated && authContext?.user && (
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
          )}
        </Paper>
      )}
    </>
  );
};

export default ChatBubble;