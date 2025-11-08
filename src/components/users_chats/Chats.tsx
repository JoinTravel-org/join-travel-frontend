import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Paper,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { Person as PersonIcon, Group as GroupIcon } from "@mui/icons-material";
import directMessageService, {
  type Conversation,
} from "../../services/directMessage.service";
import groupService from "../../services/group.service";
import groupMessageService from "../../services/groupMessage.service";
import type { Group } from "../../types/group";
import { DirectChatDialog } from "./DirectChatDialog";
import { GroupChatDialog } from "../groups/GroupChatDialog";

// Extended Group type with last message
interface GroupWithLastMessage extends Group {
  lastMessage?: {
    content: string;
    senderEmail: string;
    createdAt: string;
  };
}

const Chats: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<GroupWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [groupChatOpen, setGroupChatOpen] = useState(false);

  useEffect(() => {
    if (tabValue === 0) {
      loadConversations();
    } else {
      loadGroups();
    }
  }, [tabValue]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await directMessageService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError("Error al cargar conversaciones");
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.getGroups();
      if (response.success && response.data) {
        // Cargar último mensaje de cada grupo
        const groupsWithLastMessage = await Promise.all(
          response.data.map(async (group) => {
            try {
              const messages = await groupMessageService.getMessages(group.id, 1, 0);
              const lastMsg = messages.data?.messages[0];
              return {
                ...group,
                lastMessage: lastMsg
                  ? {
                      content: lastMsg.content,
                      senderEmail: lastMsg.senderEmail,
                      createdAt: lastMsg.createdAt,
                    }
                  : undefined,
              };
            } catch {
              return { ...group, lastMessage: undefined };
            }
          })
        );
        setGroups(groupsWithLastMessage);
      } else {
        setError("Error al cargar grupos");
      }
    } catch (err) {
      console.error("Error loading groups:", err);
      setError("Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setGroupChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    // Reload conversations to update unread counts
    loadConversations();
  };

  const handleCloseGroupChat = () => {
    setGroupChatOpen(false);
    loadGroups();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Mensajes
      </Typography>

      {/* Tabs for Direct Messages and Groups */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Mensajes Directos" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Grupos" icon={<GroupIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : tabValue === 0 ? (
        // Direct Messages Tab
        conversations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes conversaciones aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visita el perfil de otro usuario y presiona "Mensaje" para iniciar
              una conversación
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List sx={{ p: 0 }}>
              {conversations.map((conversation, index) => (
                <React.Fragment key={conversation.conversationId}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleConversationClick(conversation)}
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount}
                          color="error"
                          invisible={conversation.unreadCount === 0}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <PersonIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight:
                                conversation.unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {conversation.otherUser.email}
                          </Typography>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight:
                                  conversation.unreadCount > 0 ? 500 : 400,
                              }}
                            >
                              {truncateMessage(conversation.lastMessage.content)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 2, flexShrink: 0 }}
                            >
                              {formatTime(conversation.lastMessage.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < conversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )
      ) : (
        // Groups Tab
        groups.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No eres miembro de ningún grupo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea o únete a un grupo para chatear con varios miembros
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List sx={{ p: 0 }}>
              {groups.map((group, index) => (
                <React.Fragment key={group.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleGroupClick(group)}
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "secondary.main" }}>
                          <GroupIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {group.name}
                          </Typography>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {group.lastMessage
                                ? `${group.lastMessage.senderEmail}: ${truncateMessage(group.lastMessage.content)}`
                                : "Sin mensajes aún"}
                            </Typography>
                            {group.lastMessage && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 2, flexShrink: 0 }}
                              >
                                {formatTime(group.lastMessage.createdAt)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < groups.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )
      )}

      {/* Direct Chat Dialog */}
      {selectedConversation && (
        <DirectChatDialog
          open={chatOpen}
          onClose={handleCloseChat}
          otherUserId={selectedConversation.otherUser.id}
          otherUserEmail={selectedConversation.otherUser.email}
        />
      )}

      {/* Group Chat Dialog */}
      {selectedGroup && (
        <GroupChatDialog
          open={groupChatOpen}
          onClose={handleCloseGroupChat}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}
    </Container>
  );
};

export default Chats;
