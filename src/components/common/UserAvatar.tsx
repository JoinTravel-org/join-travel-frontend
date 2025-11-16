import React from 'react';
import { Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface UserAvatarProps {
  user?: {
    name?: string;
    email?: string;
    profilePicture?: string;
  };
  size?: number;
  sx?: object;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 40, sx = {} }) => {
  const getAvatarUrl = () => {
    if (user?.profilePicture) {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      return `${baseUrl}/uploads/avatars/${user.profilePicture}`;
    }
    return undefined;
  };

  const getInitial = () => {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.trim()[0].toUpperCase();
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email.trim()[0].toUpperCase();
    }
    return undefined;
  };

  const avatarUrl = getAvatarUrl();
  const initial = getInitial();

  return (
    <Avatar
      src={avatarUrl}
      alt={user?.name || user?.email}
      sx={{
        width: size,
        height: size,
        bgcolor: !avatarUrl && initial ? 'primary.main' : 'grey.400',
        fontSize: size * 0.5,
        fontWeight: 600,
        ...sx,
      }}
    >
      {!avatarUrl && initial ? initial : !avatarUrl && <PersonIcon sx={{ fontSize: size * 0.6 }} />}
    </Avatar>
  );
};

export default UserAvatar;
