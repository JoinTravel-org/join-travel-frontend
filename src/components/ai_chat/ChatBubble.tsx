import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Box, Fab, Typography, TextField, Button, List, ListItem, ListItemText, Avatar, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import apiService from '../../services/api.service';

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
  const messageInputRef = useRef<HTMLInputElement>(null);
  const lastTimestampRef = useRef<number>(0);
  const pollingIntervalRef = useRef<number | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
  const rateLimitCheckIntervalRef = useRef<number | null>(null);

  // Welcome message
  const welcomeMessage: Message = {
    id: 'welcome',
    text: '¡Hola! Soy Viajitus 👋✨\n Puedo ayudarte con tus necesidades de viaje 🌍✈️\n¡Pregúntame sobre lugares increíbles 🏖️, reseñas 📝 o qué destinos se adaptan mejor a ti!',
    sender: 'ai',
    timestamp: Date.now(),
  };

  // Effect to check and update rate limit status
  useEffect(() => {
    const checkRateLimitExpiration = () => {
      if (rateLimitEndTime && Date.now() >= rateLimitEndTime) {
        setIsRateLimited(false);
        setRateLimitMessage('');
        setRateLimitEndTime(null);
        // Clear the interval when rate limit expires
        if (rateLimitCheckIntervalRef.current) {
          clearInterval(rateLimitCheckIntervalRef.current);
          rateLimitCheckIntervalRef.current = null;
        }
      }
    };

    // If we have a rate limit end time, start checking every second
    if (rateLimitEndTime && !rateLimitCheckIntervalRef.current) {
      rateLimitCheckIntervalRef.current = window.setInterval(checkRateLimitExpiration, 1000);
    }

    // Cleanup interval on unmount
    return () => {
      if (rateLimitCheckIntervalRef.current) {
        clearInterval(rateLimitCheckIntervalRef.current);
        rateLimitCheckIntervalRef.current = null;
      }
    };
  }, [rateLimitEndTime]);

  useEffect(() => {
    if (isOpen && authContext?.user) {
      loadChatHistory();
    }
  }, [isOpen, authContext?.user]);

  // Periodic polling for new messages when chat is open
  useEffect(() => {
    if (isOpen && authContext?.user) {
      const pollForNewMessages = async () => {
        try {
          const response = await apiService.getChatHistory({ limit: 50 });
          if (response.success && response.messages) {
            const newMessages: Message[] = [];
            response.messages.forEach((msg: ChatMessage) => {
              // Only add messages newer than our last timestamp
              if (new Date(msg.createdAt).getTime() > lastTimestampRef.current) {
                // Add user message
                newMessages.push({
                  id: msg.id + '_user',
                  text: msg.message,
                  sender: 'user',
                  timestamp: new Date(msg.createdAt).getTime(),
                });
                // Add AI response if exists
                if (msg.response) {
                  newMessages.push({
                    id: msg.id + '_ai',
                    text: msg.response,
                    sender: 'ai',
                    timestamp: new Date(msg.createdAt).getTime() + 1000,
                  });
                }
              }
            });

            if (newMessages.length > 0) {
              setMessages(prev => {
                const combined = [...prev, ...newMessages];
                // Remove duplicates and sort
                const unique = combined.filter((msg, index, self) =>
                  index === self.findIndex(m => m.id === msg.id)
                );
                unique.sort((a, b) => a.timestamp - b.timestamp);
                // Update last timestamp
                if (unique.length > 0) {
                  lastTimestampRef.current = unique[unique.length - 1].timestamp;
                }
                return unique;
              });
            }
          }
        } catch (error) {
          console.error('Failed to poll for new messages:', error);
        }
      };

      // Start polling every 1.5 seconds
      pollingIntervalRef.current = window.setInterval(pollForNewMessages, 1500);

      // Cleanup on unmount or when chat closes
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    } else {
      // Clear polling when chat is closed or user not authenticated
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
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
        // Update last timestamp for polling
        if (formattedMessages.length > 0) {
          lastTimestampRef.current = formattedMessages[formattedMessages.length - 1].timestamp;
        }
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
      lastTimestampRef.current = 0;
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
      lastTimestampRef.current = 0;
      // Clear rate limit status
      setIsRateLimited(false);
      setRateLimitMessage('');
      setRateLimitEndTime(null);
    } catch (error) {
      console.error('Failed to start new chat:', error);
      // On error, still show welcome message
      setMessages([welcomeMessage]);
      setConversationId(null);
      setInputMessage('');
      lastTimestampRef.current = 0;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !authContext?.user || isRateLimited) return;

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
          setMessages(prev => {
            const updated = [...prev, aiMessage];
            // Update last timestamp
            lastTimestampRef.current = aiMessage.timestamp;
            return updated;
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Handle rate limit errors
      if (error?.rateLimit) {
        setIsRateLimited(true);
        setRateLimitMessage(error.message);
        if (error.rateLimit.blockedUntil) {
          setRateLimitEndTime(new Date(error.rateLimit.blockedUntil).getTime());
        }
      }

      // Add error message
      const errorMessage: Message = {
        id: (timestamp + 1).toString(),
        text: error?.rateLimit ? error.message : 'Perdona, hubo un error. Intenta de nuevo!',
        sender: 'ai',
        timestamp: timestamp + 1000,
      };
      setMessages(prev => {
        const updated = [...prev, errorMessage];
        // Update last timestamp
        lastTimestampRef.current = errorMessage.timestamp;
        return updated;
      });
    } finally {
      setIsLoading(false);
      // Mantener el foco en el input después de enviar
      requestAnimationFrame(() => {
        messageInputRef.current?.focus();
      });
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
      {/* Toast Text Above Chat Bubble */}
      <Box
        onClick={handleToggleChat}
        sx={{
          position: 'fixed',
          bottom: 104,
          right: 16,
          zIndex: 1000,
          bgcolor: 'var(--color-primary)',
          color: 'var(--color-primary-contrast)',
          px: 2,
          py: 1,
          borderRadius: 3,
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: 120,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.4), 0 0 20px var(--color-primary)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            right: 20,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid var(--color-primary)',
          },
        }}
      >
        Te ayudo en algo?
      </Box>

      {/* Chat Bubble Button */}
      <Fab
        ref={fabRef}
        aria-label="chat"
        onClick={handleToggleChat}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          width: 80,
          height: 80,
          bgcolor: 'transparent',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover > div': {
            border: '2px solid var(--color-primary)',
          },
        }}
      >
        <Box sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}>
          <video
            src="/viajitus_idle.webm"
            autoPlay
            loop
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </Fab>

      {/* Chat Interface */}
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              height: "600px",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
            }}
            component="div"
          >
            <Typography variant="h6">Viajitus ✨</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Iniciar nuevo chat">
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
              <IconButton onClick={() => setIsOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {authContext?.isAuthenticated && authContext?.user ? (
              <List>
                {messages.map((message) => (
                  <ListItem key={message.id} sx={{ alignItems: 'flex-start', px: 0 }}>
                    <Avatar src={message.sender === 'ai' ? '/viajitus.png' : undefined} sx={{ mr: 1, bgcolor: message.sender === 'ai' ? 'transparent' : 'secondary.main' }}>
                      {message.sender === 'ai' ? '' : 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <ListItemText
                        primary={
                          message.sender === 'ai' ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <Typography variant="body1" sx={{ margin: 0 }}>{children}</Typography>,
                                strong: ({ children }) => <Typography component="span" sx={{ fontWeight: 'bold' }}>{children}</Typography>,
                                em: ({ children }) => <Typography component="span" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          ) : (
                            message.text
                          )
                        }
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
                    </Box>
                  </ListItem>
                ))}

                {/* AI Thinking Indicator */}
                {isLoading && (
                  <ListItem sx={{ alignItems: 'flex-start', px: 0 }}>
                    <Avatar src="/viajitus.png" sx={{ mr: 1 }}>
                    </Avatar>
                    <Box sx={{
                      bgcolor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '@keyframes bounce': {
                        '0%, 80%, 100%': {
                          transform: 'scale(0)',
                        },
                        '40%': {
                          transform: 'scale(1)',
                        },
                      },
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Pensando
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            animation: 'bounce 1.4s ease-in-out infinite both',
                            animationDelay: '0s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            animation: 'bounce 1.4s ease-in-out infinite both',
                            animationDelay: '0.16s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            animation: 'bounce 1.4s ease-in-out infinite both',
                            animationDelay: '0.32s',
                          }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                )}

                <div ref={messagesEndRef} />
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Por favor inicie sesión para poder hablar con Viajitus ✨
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Debes estar logeado para usar esta característica.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              borderTop: 1,
              borderColor: "divider",
              p: 2,
              gap: 1,
            }}
          >
            {authContext?.isAuthenticated && authContext?.user && (
              <>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder={isRateLimited ? rateLimitMessage : "Escribe un mensaje..."}
                  value={inputMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  inputRef={messageInputRef}
                  disabled={isRateLimited}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: isRateLimited ? 'grey.100' : 'transparent',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || isRateLimited}
                  endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{ minWidth: "100px" }}
                >
                  Enviar
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ChatBubble;