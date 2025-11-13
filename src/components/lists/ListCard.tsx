import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { List } from '../../types/list';

interface ListCardProps {
  list: List;
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onView: (list: List) => void;
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
    onEdit(list);
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
      onClick={() => onView(list)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" component="h2" gutterBottom>
              {list.title}
            </Typography>
            {list.description && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
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

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Chip
            label={`${list.places.length} lugares`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(list.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ListCard;