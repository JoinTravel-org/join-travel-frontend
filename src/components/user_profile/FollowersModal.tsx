import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import userService from '../../services/user.service';
import type { User } from '../../types/user';
import { useNavigate } from 'react-router-dom';

interface FollowersModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  open,
  onClose,
  userId,
  type,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response =
          type === 'followers'
            ? await userService.getFollowers(userId, 100, 0)
            : await userService.getFollowing(userId, 100, 0);

        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError(response.message || 'Error al cargar usuarios');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, userId, type]);

  const handleUserClick = (clickedUserId: string) => {
    onClose();
    navigate(`/user/${clickedUserId}`);
  };

  const getAvatarUrl = (profilePicture?: string) => {
    if (profilePicture) {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      return `${baseUrl}/uploads/avatars/${profilePicture}`;
    }
    return undefined;
  };

  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              {type === 'followers'
                ? 'Aún no tienes seguidores'
                : 'Aún no sigues a nadie'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    py: 1.5,
                    px: 3,
                  }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <ListItemAvatar>
                    <Avatar src={getAvatarUrl(user.profilePicture)}>
                      {!user.profilePicture && <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || user.email}
                    secondary={
                      <>
                        {user.name && (
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <br />
                          </>
                        )}
                        {user.stats && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            Nivel {user.stats.level} - {user.stats.levelName}
                          </Typography>
                        )}
                      </>
                    }
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                {index < users.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
