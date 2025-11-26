import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, List as ListIcon } from '@mui/icons-material';
import type { List } from '../../types/list';
import ImagePreview from '../common/ImagePreview';

interface ListCardProps {
  list: List;
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onView?: (list: List) => void;
  compact?: boolean; // For search results, smaller image
}

const ListCard: React.FC<ListCardProps> = ({ list, onEdit, onDelete, onView, compact = false }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuJustClosed = React.useRef(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    menuJustClosed.current = true;
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

  // Get the first place for image preview
  const firstPlace = list.places.length > 0 ? list.places[0] : null;

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
      onClick={() => {
        if (menuJustClosed.current) {
          menuJustClosed.current = false;
          return;
        }
        onView?.(list);
      }}
    >
      <CardContent sx={compact ? { display: 'flex', alignItems: 'center', gap: 2 } : {}}>
        {compact ? (
          <React.Fragment>
            {/* Compact mode: horizontal layout */}
            <Box sx={{ flexShrink: 0, width: 200 }}>
              <ImagePreview
                src={firstPlace?.image || null}
                alt={firstPlace ? `Imagen de ${firstPlace.name}` : 'Sin imagen disponible'}
                width={200}
                height={150}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  mb: 0.5,
                  wordBreak: 'break-word'
                }}
              >
                {list.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {list.places.length} lugar{list.places.length !== 1 ? 'es' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Creado: {new Date(list.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
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
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* Full mode: vertical layout */}
            <Box sx={{ mb: 2 }}>
              <ImagePreview
                src={firstPlace?.image || null}
                alt={firstPlace ? `Imagen de ${firstPlace.name}` : 'Sin imagen disponible'}
                width={450}
                height={280}
              />
            </Box>
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
            {list.description && !compact && (
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

          {list.places.length > 0 && !compact && (
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
          </React.Fragment>
        )}
      </CardContent>

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
    </Card>
  );
};

export default ListCard;