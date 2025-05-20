import './App.css';
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SchoolIcon from '@mui/icons-material/School';
import { ThemeContext } from './utils/themeContext';

// Home page component for the landing page
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  
  return (
    <ThemeContext.Provider value={themeContext}>
      <AuthProvider>
        <Box className="App">
      <Navbar />
      
      <HeroSection>
        <HeroBackgroundCircle
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          style={{ 
            width: '500px', 
            height: '500px', 
            right: '-150px', 
            top: '-150px' 
          }}
        />
        <HeroBackgroundCircle
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{ 
            width: '400px', 
            height: '400px', 
            left: '-100px', 
            bottom: '-100px' 
          }}
        />
        
        <HeroContent maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroTitle variant="h2" component="h1">
              {t('modernSchoolAttendanceSystem')}
            </HeroTitle>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroSubtitle>
              {t('homeHeroSubtitle')}
            </HeroSubtitle>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            sx={{ 
              flexDirection: { xs: 'column', sm: 'row' },
              '& > *': { mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              maxWidth: '500px',
              gap: 2
            }}>
              <HeroButton 
              variant="contained" 
              color="secondary"
              component={Link}
              to="/login"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                marginBottom: { xs: 2, sm: 0 }
              }}
            >
              {t('getStarted')}
            </HeroButton>
            
            <HeroButton 
              variant="outlined" 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  background: 'rgba(255, 255, 255, 0.25)',
                }
              }}
            >
              {t('learnMore')}
            </HeroButton>
            </Box>
          </motion.div>
        </HeroContent>
      </HeroSection>
      
      <FeatureSection maxWidth="lg">
        <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
          {t('designedForModernEducation')}
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="700px" mx="auto">
          {t('attendanceSystemHelps')}
        </Typography>
        
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              themeMode={themeContext}
            >
              <FeatureIcon themeMode={themeContext}>
                {feature.icon}
              </FeatureIcon>
              <Typography variant="h5" component="h3" fontWeight={600} mb={2} color={themeContext?.theme === 'dark' ? 'white' : 'inherit'}>
                {t(feature.title)}
              </Typography>
              <Typography variant="body1" color={themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                {t(feature.description)}
              </Typography>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeatureSection>
      
      <Footer />
    </Box>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

// Feature data
const features = [
  {
    title: "realTimeAttendance",
    description: "realTimeAttendanceDesc",
    icon: <SchoolIcon fontSize="large" />,
  },
  {
    title: "automatedNotifications",
    description: "automatedNotificationsDesc",
    icon: <SchoolIcon fontSize="large" />,
  },
  {
    title: "comprehensiveReports",
    description: "comprehensiveReportsDesc",
    icon: <SchoolIcon fontSize="large" />,
  },
  {
    title: "easyManagement",
    description: "easyManagementDesc",
    icon: <SchoolIcon fontSize="large" />,
  },
];

// Styled components for the homepage
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '80vh',
  background: 'linear-gradient(135deg, #2963ff 0%, #26cfac 100%)',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1.25rem',
  marginBottom: theme.spacing(5),
  maxWidth: '600px',
}));

const HeroBackgroundCircle = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.1)',
}));

const HeroButton = styled(Button)(({ theme }) => ({
  padding: '12px 28px',
  fontSize: '1.1rem',
  marginRight: { xs: 0, sm: theme.spacing(2) },
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.18)',
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    display: 'block',
    width: '100%',
  }
}));

const FeatureSection = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  textAlign: 'center',
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(6),
  marginTop: theme.spacing(8),
}));

const FeatureCard = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  background: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.8)' : 'white',
  borderRadius: 16,
  padding: theme.spacing(4),
  textAlign: 'left',
  boxShadow: themeMode?.theme === 'dark' ? 
    '0 8px 30px rgba(0, 0, 0, 0.2)' : 
    '0 8px 30px rgba(0, 0, 0, 0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backdropFilter: 'blur(10px)',
  border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
}));

const FeatureIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  background: themeMode?.theme === 'dark' ?
    'linear-gradient(135deg, #1a2840 0%, #0d1a33 100%)' :
    'linear-gradient(135deg, #2963ff 0%, #1e4ecc 100%)',
  width: 60,
  height: 60,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: 'white',
  boxShadow: themeMode?.theme === 'dark' ?
    '0 4px 15px rgba(0, 0, 0, 0.3)' :
    '0 4px 15px rgba(0, 0, 0, 0.1)',
}));

export default App;




