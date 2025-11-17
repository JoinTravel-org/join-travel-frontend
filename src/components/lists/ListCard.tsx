import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { List } from '../../types/list';

interface ListCardProps {
  list: List;
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onView?: (list: List) => void;
}

const ListCard: React.FC<ListCardProps> = ({ list, onEdit, onDelete, onView }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    // Navigate to edit page
    window.location.href = `/list/${list.id}/edit`;
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(list.id);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={() => onView?.(list)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.2,
                mb: 1,
                wordBreak: 'break-word'
              }}
            >
              {list.title}
            </Typography>
            {list.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.4,
                  maxHeight: '2.8em', // 2 lines * 1.4 lineHeight
                  wordBreak: 'break-word'
                }}
              >
                {list.description}
              </Typography>
            )}
          </Box>
          <IconButton
            aria-label="more"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(e);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {list.places.length} lugar{list.places.length !== 1 ? 'es' : ''}
          </Typography>

          {list.places.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Lugares:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {list.places.slice(0, 5).map((place) => (
                  <Chip
                    key={place.id}
                    label={place.name}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {list.places.length > 5 && (
                  <Chip
                    label={`+${list.places.length - 5} más`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Creado: {new Date(list.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ListCard;