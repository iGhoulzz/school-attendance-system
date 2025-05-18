// Footer.js
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { ThemeContext, themes } from '../utils/themeContext';

const FooterContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  backgroundColor: themeMode?.theme === 'dark' ? '#050c1b' : '#0a2468',
  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'rgba(255, 255, 255, 0.8)',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: themeMode?.theme === 'dark' 
      ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%232963ff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
      : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%232963ff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    zIndex: 0,
  }
}));

const FooterLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
}));

const FooterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
}));

const SocialIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  width: 36,
  height: 36,
  
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: themeMode?.theme === 'dark' ? 
      '0 4px 8px rgba(0, 0, 0, 0.3)' : 
      '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const FooterLink = styled(MuiLink, {
  shouldForwardProp: (prop) => prop !== 'isRTL'
})(({ theme, isRTL }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  display: 'block',
  marginBottom: theme.spacing(1.5),
  textAlign: isRTL ? 'right' : 'left',
  
  '&:hover': {
    color: '#fff',
    transform: isRTL ? 'translateX(-5px)' : 'translateX(5px)',
  },
}));

const ContactItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRTL'
})(({ theme, isRTL }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  flexDirection: isRTL ? 'row-reverse' : 'row',
  textAlign: isRTL ? 'right' : 'left',
}));

const Copyright = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
}));

function Footer() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const themeMode = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRTL = i18n.language === 'ar';
  
  const year = new Date().getFullYear();
  return (
    <FooterContainer themeMode={themeMode}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FooterSection>              <FooterLogo sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <SchoolIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: 'primary.main' 
                  }} 
                />
                <Typography variant="h5" fontWeight={700} color="white">
                  {t('schoolAttendanceSystem')}
                </Typography>
              </FooterLogo>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 3, 
                  maxWidth: 300,
                  textAlign: isRTL ? 'right' : 'left',
                  marginLeft: isRTL ? 'auto' : 'initial',
                  marginRight: isRTL ? 'initial' : 'auto'
                }}
              >
                {t('footerDescription')}
              </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <SocialIconButton aria-label="facebook" themeMode={themeMode}>
                  <FacebookIcon fontSize="small" />
                </SocialIconButton>
                <SocialIconButton aria-label="twitter" themeMode={themeMode}>
                  <TwitterIcon fontSize="small" />
                </SocialIconButton>
                <SocialIconButton aria-label="instagram" themeMode={themeMode}>
                  <InstagramIcon fontSize="small" />
                </SocialIconButton>
                <SocialIconButton aria-label="linkedin" themeMode={themeMode}>
                  <LinkedInIcon fontSize="small" />
                </SocialIconButton>
              </Box>
            </FooterSection>
          </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <Typography 
                variant="h6" 
                color="white" 
                fontWeight={600} 
                sx={{ 
                  mb: 3, 
                  textAlign: isRTL ? 'right' : 'left',
                  width: '100%' 
                }}
              >
                {t('quickLinks')}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <FooterLink component={Link} to="/" isRTL={isRTL}>
                  {t('home')}
                </FooterLink>
              <FooterLink component={Link} to="/login" isRTL={isRTL}>
                {t('login')}
              </FooterLink>
              <FooterLink component={Link} to="/#features" isRTL={isRTL}>
                {t('features')}
              </FooterLink>
              <FooterLink component={Link} to="/#about" isRTL={isRTL}>
                {t('about')}
              </FooterLink>              <FooterLink component={Link} to="/#contact" isRTL={isRTL}>
                {t('contact')}
              </FooterLink>
              </Box>
            </FooterSection>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FooterSection>
              <Typography 
                variant="h6" 
                color="white" 
                fontWeight={600} 
                sx={{ 
                  mb: 3, 
                  textAlign: isRTL ? 'right' : 'left',
                  width: '100%' 
                }}
              >
                {t('support')}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <FooterLink href="#help-center" isRTL={isRTL}>
                  {t('helpCenter')}
                </FooterLink>
              <FooterLink href="#faq" isRTL={isRTL}>
                {t('faq')}
              </FooterLink>
              <FooterLink href="#privacy-policy" isRTL={isRTL}>
                {t('privacyPolicy')}
              </FooterLink>              <FooterLink href="#terms" isRTL={isRTL}>
                {t('termsConditions')}
              </FooterLink>
              </Box>
            </FooterSection>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FooterSection>
              <Typography 
                variant="h6" 
                color="white" 
                fontWeight={600} 
                sx={{ 
                  mb: 3, 
                  textAlign: isRTL ? 'right' : 'left',
                  width: '100%' 
                }}
              >
                {t('contactUs')}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <ContactItem isRTL={isRTL}>
                <LocationIcon sx={{ 
                  marginRight: isRTL ? 0 : theme.spacing(2),
                  marginLeft: isRTL ? theme.spacing(2) : 0, 
                  color: 'primary.main' 
                }} />
                <Typography variant="body2">
                  {t('address')}
                </Typography>
              </ContactItem>
              
              <ContactItem isRTL={isRTL}>
                <EmailIcon sx={{ 
                  marginRight: isRTL ? 0 : theme.spacing(2),
                  marginLeft: isRTL ? theme.spacing(2) : 0, 
                  color: 'primary.main' 
                }} />
                <Typography variant="body2">
                  info@schoolattendance.com
                </Typography>
              </ContactItem>
                <ContactItem isRTL={isRTL}>
                <PhoneIcon sx={{ 
                  marginRight: isRTL ? 0 : theme.spacing(2),
                  marginLeft: isRTL ? theme.spacing(2) : 0, 
                  color: 'primary.main' 
                }} />
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </ContactItem>
              </Box>
            </FooterSection>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 2, mb: 3 }} />
        
        <Copyright variant="body2">
          © {year} {t('schoolAttendanceSystem')}. {t('allRightsReserved')}
        </Copyright>
      </Container>
    </FooterContainer>
  );
}

export default Footer;





