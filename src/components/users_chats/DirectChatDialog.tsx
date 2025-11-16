import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../contexts/AuthContext";
import directMessageService, {
  type DirectMessage,
} from "../../services/directMessage.service";
import socketService from "../../services/socket.service";
import UserAvatar from "../common/UserAvatar";

interface DirectChatDialogProps {
  open: boolean;
  onClose: () => void;
  otherUserId: string;
  otherUserEmail: string;
  otherUserName?: string;
  otherUserProfilePicture?: string;
}

export const DirectChatDialog: React.FC<DirectChatDialogProps> = ({
  open,
  onClose,
  otherUserId,
  otherUserEmail,
  otherUserName,
  otherUserProfilePicture,
}) => {
  const authContext = useContext(AuthContext);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Obtener el ID del usuario actual del contexto de autenticación
  const currentUserId = authContext?.user?.id || null;

  const loadConversationHistory = React.useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      try {
        const response = await directMessageService.getConversationHistory(
          otherUserId
        );
        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [otherUserId]
  );

  // Load conversation history when dialog opens
  useEffect(() => {
    if (open && otherUserId) {
      loadConversationHistory();
    }
  }, [open, otherUserId, loadConversationHistory]);

  // Subscribe to new direct messages via websocket
  useEffect(() => {
    if (!open || !otherUserId) return;

    const unsubscribe = socketService.onNewMessage((message: DirectMessage) => {
      // Only add messages from or to this conversation
      if (
        message.senderId === otherUserId ||
        message.receiverId === otherUserId
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    return unsubscribe;
  }, [open, otherUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      // Send via websocket if connected, otherwise fallback to HTTP
      if (socketService.isConnected()) {
        socketService.sendDirectMessage(otherUserId, messageToSend);
        
        // Add message optimistically (will show immediately)
        const optimisticMessage: DirectMessage = {
          id: `temp-${Date.now()}`, // Temporary ID
          senderId: currentUserId!,
          receiverId: otherUserId,
          content: messageToSend,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
      } else {
        const response = await directMessageService.sendMessage(
          otherUserId,
          messageToSend
        );
        if (response.success && response.data) {
          setMessages((prev) => [...prev, response.data!]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restaurar el mensaje en caso de error
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }

    // Mantener el foco en el input después de enviar
    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          py: 2,
        }}
        component="div"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <UserAvatar
            user={{
              email: otherUserEmail,
              name: otherUserName,
              profilePicture: otherUserProfilePicture,
            }}
            size={40}
          />
          <Typography variant="h6" component="h2">
            Chat con {otherUserName || otherUserEmail}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
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
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography color="text.secondary">
              No hay mensajes aún. ¡Inicia la conversación!
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((message, index) => {
              // Convertir ambos a string para comparar correctamente
              const isOwnMessage =
                String(message.senderId) === String(currentUserId);
              const senderName = isOwnMessage
                ? "Tú"
                : message.senderEmail || otherUserEmail;

              // Debug: log para verificar la comparación
              console.log("Message:", {
                senderId: message.senderId,
                senderIdType: typeof message.senderId,
                currentUserId,
                currentUserIdType: typeof currentUserId,
                isOwnMessage,
                content: message.content.substring(0, 20),
              });

              return (
                <Box
                  key={message.id || index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isOwnMessage ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      color: "text.secondary",
                      mb: 0.5,
                      px: 1,
                    }}
                  >
                    {senderName}
                  </Typography>
                  <Paper
                    elevation={isOwnMessage ? 2 : 1}
                    sx={{
                      p: 1.5,
                      maxWidth: "70%",
                      backgroundColor: isOwnMessage
                        ? "#1976d2" // Azul más fuerte para mensajes propios
                        : "#e0e0e0", // Gris para mensajes recibidos
                      color: isOwnMessage ? "#ffffff" : "#000000",
                      borderRadius: isOwnMessage
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        wordBreak: "break-word",
                        fontSize: "0.95rem",
                      }}
                    >
                      {message.content}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mt: 0.5,
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.8,
                          fontSize: "0.65rem",
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Typography>
                      {isOwnMessage && (
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: "0.65rem",
                          }}
                        >
                          {message.isRead ? "✓✓" : "✓"}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
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
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
          size="small"
          inputRef={messageInputRef}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          endIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{ minWidth: "100px" }}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
