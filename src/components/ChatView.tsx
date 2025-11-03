import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Conversation, ChatMessage, ChatUser } from '../types/chat';

/**
 * Mock data para testing (sin persistencia)
 */
const mockUsers: ChatUser[] = [
  { id: '1', name: 'Usuario A', avatar: undefined },
  { id: '2', name: 'Usuario B', avatar: undefined },
  { id: '3', name: 'María García', avatar: undefined },
  { id: '4', name: 'Juan Pérez', avatar: undefined },
];

const createMockConversations = (currentUserId: string): Conversation[] => [
  {
    id: 'conv-1',
    participants: [
      { id: currentUserId, name: 'Tú', avatar: undefined },
      mockUsers[0],
    ],
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: mockUsers[0].id,
      text: 'Ok, nos vemos mañana!',
      timestamp: Date.now() - 3600000, // 1 hora atrás
    },
    unreadCount: 0,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'conv-2',
    participants: [
      { id: currentUserId, name: 'Tú', avatar: undefined },
      mockUsers[1],
    ],
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: mockUsers[1].id,
      text: 'Genial, me parece bien.',
      timestamp: Date.now() - 86400000, // 1 día atrás
    },
    unreadCount: 2,
    updatedAt: Date.now() - 86400000,
  },
];

/**
 * Vista principal de chat con lista de conversaciones y área de mensajes
 */
const ChatView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const auth = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth.isAuthenticated, navigate]);

  // Cargar conversaciones mock
  useEffect(() => {
    if (auth.user) {
      const mockConvs = createMockConversations(auth.user.id);
      setConversations(mockConvs);
    }
  }, [auth.user]);

  // Scroll automático al final de los mensajes cuando se debe
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Cargar mensajes de la conversación seleccionada (mock)
  useEffect(() => {
    if (selectedConversation) {
      // Mock de mensajes para la conversación
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-' + Math.random(),
          conversationId: selectedConversation.id,
          senderId: selectedConversation.participants[1].id,
          text: '¡Hola! ¿Confirmamos el plan de mañana?',
          timestamp: Date.now() - 7200000,
        },
        {
          id: 'msg-' + Math.random(),
          conversationId: selectedConversation.id,
          senderId: auth.user?.id || 'current',
          text: 'Sí, perfecto. ¿A qué hora te viene bien?',
          timestamp: Date.now() - 3900000,
        },
        {
          id: 'msg-' + Math.random(),
          conversationId: selectedConversation.id,
          senderId: selectedConversation.participants[1].id,
          text: selectedConversation.lastMessage?.text || 'Mensaje',
          timestamp: selectedConversation.lastMessage?.timestamp || Date.now(),
        },
      ];
      setMessages(mockMessages);
      // Hacer scroll al cambiar de conversación
      setShouldScrollToBottom(true);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, auth.user]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowMobileChat(true);
    }
    // Marcar como leída
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedConversation || !auth.user) return;

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      conversationId: selectedConversation.id,
      senderId: auth.user.id,
      text: inputMessage.trim(),
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    
    // Actualizar última conversación
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, updatedAt: Date.now() }
          : conv
      )
    );

    // Limpiar el input y mantener el foco
    setInputMessage('');
    // Hacer scroll cuando el usuario envía un mensaje
    setShouldScrollToBottom(true);
    
    // Usar requestAnimationFrame para asegurar que el foco se aplique después de que React actualice el DOM
    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddUser = (user: ChatUser) => {
    // Mock: crear nueva conversación
    if (!auth.user) return;

    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      participants: [
        { id: auth.user.id, name: 'Tú', avatar: undefined },
        user,
      ],
      unreadCount: 0,
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setShowAddUserDialog(false);
    handleSelectConversation(newConv);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const date = new Date(timestamp);

    if (diff < 86400000) {
      // Menos de 1 día
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) {
      // Menos de 1 semana
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getOtherParticipant = (conversation: Conversation): ChatUser => {
    return conversation.participants.find((p) => p.id !== auth.user?.id) || conversation.participants[0];
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        px: { xs: 1, sm: 2, md: 3 },
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Lista de conversaciones */}
        <Box
          sx={{
            width: { xs: '100%', md: '360px' },
            borderRight: { md: '1px solid' },
            borderColor: 'divider',
            display: { xs: showMobileChat ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
          }}
        >
          {/* Header de la lista */}
          <Box
            sx={{
              p: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(129, 199, 132, 0.3)',
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Chats recientes
            </Typography>
            <IconButton
              color="primary"
              onClick={() => setShowAddUserDialog(true)}
              aria-label="Agregar persona"
            >
              <PersonAddIcon />
            </IconButton>
          </Box>

          {/* Lista de conversaciones */}
          <List
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 0,
            }}
          >
            {conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay conversaciones aún. ¡Inicia una conversación!
                </Typography>
              </Box>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                return (
                  <React.Fragment key={conversation.id}>
                    <ListItemButton
                      onClick={(e) => {
                        handleSelectConversation(conversation);
                        e.currentTarget.blur();
                      }}
                      sx={{
                        py: 2,
                        backgroundColor: selectedConversation?.id === conversation.id
                          ? (theme.palette.mode === 'dark'
                              ? 'rgba(25, 118, 210, 0.18)'
                              : 'rgba(25, 118, 210, 0.40)')
                          : 'transparent',
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount}
                          color="error"
                          overlap="circular"
                        >
                          <Avatar
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            sx={{ bgcolor: theme.palette.primary.main }}
                          >
                            {otherUser.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={conversation.unreadCount > 0 ? 700 : 400}>
                            {otherUser.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {conversation.lastMessage?.text || 'Sin mensajes'}
                          </Typography>
                        }
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {conversation.lastMessage && formatTimestamp(conversation.lastMessage.timestamp)}
                      </Typography>
                    </ListItemButton>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })
            )}
          </List>
        </Box>

        {/* Área de mensajes */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: showMobileChat || !isMobile ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(129, 199, 132, 0.3)',
                }}
              >
                {isMobile && (
                  <IconButton onClick={handleBackToList} aria-label="Volver a la lista">
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Avatar
                  src={getOtherParticipant(selectedConversation).avatar}
                  alt={getOtherParticipant(selectedConversation).name}
                  sx={{ bgcolor: theme.palette.primary.main }}
                >
                  {getOtherParticipant(selectedConversation).name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {getOtherParticipant(selectedConversation).name}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowAddUserDialog(true)}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Agregar gente
                </Button>
              </Box>

              {/* Mensajes */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                }}
              >
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === auth.user?.id;
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          maxWidth: { xs: '85%', sm: '70%' },
                          p: 1.5,
                          backgroundColor: isCurrentUser
                            ? theme.palette.primary.main
                            : theme.palette.mode === 'dark'
                            ? 'rgba(46, 125, 50, 0.8)'
                            : 'rgba(56, 142, 60, 0.85)',
                          color: isCurrentUser ? theme.palette.primary.contrastText : '#ffffff',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: 'right',
                          }}
                        >
                          {formatTimestamp(message.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input de mensaje */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-end',
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Escribe un mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                  inputRef={messageInputRef}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  aria-label="Enviar mensaje"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '&.Mui-disabled': {
                      backgroundColor: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2,
                p: 3,
              }}
            >
              <Typography variant="h5" color="text.secondary" textAlign="center">
                Selecciona una conversación para empezar a chatear
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowAddUserDialog(true)}
              >
                Iniciar nueva conversación
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Dialog para agregar usuarios (mock) */}
      <Dialog open={showAddUserDialog} onClose={() => setShowAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar persona al chat</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona un usuario para iniciar una conversación (mock data):
          </Typography>
          <List>
            {mockUsers.map((user) => (
              <ListItem
                key={user.id}
                disablePadding
                sx={{ mb: 1 }}
              >
                <ListItemButton
                  onClick={() => handleAddUser(user)}
                  sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Chip
            label="Nota: Búsqueda de usuarios será implementada en otra user story"
            color="info"
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddUserDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChatView;
