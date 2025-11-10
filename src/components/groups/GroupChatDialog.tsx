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
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../contexts/AuthContext";
import groupMessageService from "../../services/groupMessage.service";
import socketService from "../../services/socket.service";
import type { GroupMessage } from "../../types/groupMessage";

interface GroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  open,
  onClose,
  groupId,
  groupName,
}) => {
  const authContext = useContext(AuthContext);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = authContext?.user?.id || null;

  const loadMessages = React.useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await groupMessageService.getMessages(groupId);
        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar los mensajes");
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [groupId]
  );

  // Load messages when dialog opens
  useEffect(() => {
    if (open && groupId) {
      loadMessages();
      // Join the group room to receive real-time messages
      socketService.joinGroup(groupId);
    }

    return () => {
      // Leave the group room when dialog closes
      if (groupId) {
        socketService.leaveGroup(groupId);
      }
    };
  }, [open, groupId, loadMessages]);

  // Subscribe to new group messages via websocket
  useEffect(() => {
    if (!open || !groupId) return;

    const unsubscribe = socketService.onNewGroupMessage(groupId, (message) => {
      setMessages((prev) => {
        // Check if this is a real message replacing an optimistic one
        const optimisticIndex = prev.findIndex((m) =>
          m.id.startsWith('temp-') &&
          m.senderId === message.senderId &&
          m.content === message.content &&
          m.groupId === message.groupId
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real message
          const newMessages = [...prev];
          newMessages[optimisticIndex] = message;
          return newMessages;
        } else {
          // Only add if it's not already in the list (avoid duplicates)
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        }
      });
    });

    return unsubscribe;
  }, [open, groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      // Send via websocket if connected, otherwise fallback to HTTP
      if (socketService.isConnected()) {
        socketService.sendGroupMessage(groupId, messageToSend);

        // Add message optimistically (will show immediately)
        const optimisticId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticMessage: GroupMessage = {
          id: optimisticId, // Unique temporary ID
          groupId: groupId,
          senderId: currentUserId!,
          senderEmail: authContext?.user?.email || "",
          content: messageToSend,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
      } else {
        const response = await groupMessageService.sendMessage(groupId, {
          content: messageToSend,
        });
        if (response.success && response.data) {
          setMessages((prev) => [...prev, response.data!]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setNewMessage(messageToSend);
      } else {
        setError("Error al enviar el mensaje");
        setNewMessage(messageToSend);
      }
    } finally {
      setSending(false);
    }

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
        }}
        component="div"
      >
        <Typography variant="h6" component="h2">
          {groupName}
        </Typography>
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
        ) : error && messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Alert severity="error">{error}</Alert>
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
              const isOwnMessage =
                String(message.senderId) === String(currentUserId);
              const senderName = isOwnMessage ? "Tú" : message.senderEmail;

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
                      backgroundColor: isOwnMessage ? "#1976d2" : "#e0e0e0",
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
                        mt: 0.5,
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
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>
      </DialogActions>
    </Dialog>
  );
};
