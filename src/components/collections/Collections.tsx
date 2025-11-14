import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  CircularProgress,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Lists from '../lists/Lists';
import ItineraryList from '../itineraries/ItineraryList';
import CreateListDialog from '../lists/CreateListDialog';
import { useAuth } from '../../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collections-tabpanel-${index}`}
      aria-labelledby={`collections-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `collections-tab-${index}`,
    'aria-controls': `collections-tabpanel-${index}`,
  };
}

const Collections: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [createListDialogOpen, setCreateListDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth.isAuthenticated, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateListSuccess = () => {
    setCreateListDialogOpen(false);
    // The Lists component will handle refreshing its data
  };

  const handleCreateItinerary = () => {
    navigate('/itineraries/create');
  };

  if (!auth.isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={2}
        >
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            fontWeight={600}
          >
            Colecciones
          </Typography>

          {/* Create Button - Different for each tab */}
          <Fab
            color={tabValue === 0 ? "primary" : "secondary"}
            aria-label={tabValue === 0 ? "add list" : "add itinerary"}
            onClick={tabValue === 0 ? () => setCreateListDialogOpen(true) : handleCreateItinerary}
            sx={{
              display: { xs: 'flex', md: 'none' }, // Show on mobile
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="collections tabs"
            variant={isMobile ? 'fullWidth' : 'standard'}
            centered={!isMobile}
            sx={{
              '& .MuiTab-root': {
                minHeight: isMobile ? 48 : 64,
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            }}
          >
            <Tab
              label="Listas"
              {...a11yProps(0)}
              icon={isMobile ? undefined : <Typography variant="h6">📋</Typography>}
              iconPosition="start"
            />
            <Tab
              label="Itinerarios"
              {...a11yProps(1)}
              icon={isMobile ? undefined : <Typography variant="h6">🗺️</Typography>}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Lists />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ItineraryList />
        </TabPanel>
      </Box>

      {/* Create List Dialog */}
      <CreateListDialog
        open={createListDialogOpen}
        onClose={() => setCreateListDialogOpen(false)}
        onSuccess={handleCreateListSuccess}
      />
    </Container>
  );
};

export default Collections;