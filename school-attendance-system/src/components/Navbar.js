import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
  useScrollTrigger,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Translate as TranslateIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import i18n from 'i18next';
import { ThemeContext, themes } from '../utils/themeContext';

const safeStorage = {
  getItem: (key) => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
      console.warn('Local storage is not available:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Local storage is not available:', e);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Local storage is not available:', e);
    }
  }
};

const NavbarContainer = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  backgroundColor: themeMode?.theme === 'dark' 
    ? 'rgba(22, 28, 36, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark'
    ? themes.dark.colors.text.primary
    : theme.palette.text.primary,
}));

const NavbarToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 500,
  color: themeMode?.theme === 'dark'
    ? themes.dark.colors.text.primary
    : 'inherit',
}));

const LoginButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  background: 'linear-gradient(45deg, #2963ff, #1e4ecc)',
  boxShadow: '0 4px 15px rgba(41, 99, 255, 0.2)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(41, 99, 255, 0.3)',
    background: 'linear-gradient(45deg, #1e4ecc, #0a2468)',
  },
}));

// Styled components for theme toggle and language selector
const ThemeToggle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 16,
  padding: '4px 8px',
  borderRadius: 20,
  backgroundColor: themeMode?.theme === 'dark' ? 
    'rgba(255, 255, 255, 0.05)' : 
    'rgba(0, 0, 0, 0.05)',
}));

const LanguageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  textTransform: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: '0.95rem',
  fontWeight: 500,
  color: themeMode?.theme === 'dark' ?
    '#ffffff' :
    'inherit',
  backgroundColor: themeMode?.theme === 'dark' ? 
    'rgba(77, 125, 255, 0.15)' : 
    'rgba(0, 0, 0, 0.05)',
  border: themeMode?.theme === 'dark' ? '1px solid rgba(77, 125, 255, 0.3)' : 'none',
  minWidth: '120px',
  transition: 'all 0.2s ease',
  boxShadow: themeMode?.theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
  '&:hover': {
    backgroundColor: themeMode?.theme === 'dark' ?
      'rgba(77, 125, 255, 0.25)' : 
      'rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)',
    boxShadow: themeMode?.theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiButton-endIcon': {
    marginLeft: 4,
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  '& .MuiButton-startIcon': {
    marginRight: 6,
  },
}));

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Navbar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const themeMode = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(null);

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenu(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenu(null);
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    // Store language preference
    localStorage.setItem('language', language);
    // Set document direction for RTL support
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    handleLanguageMenuClose();
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { title: t('home'), path: '/' },
    { title: t('features'), path: '/#features' },
    { title: t('about'), path: '/#about' },
    { title: t('contact'), path: '/#contact' },
  ];
  return (
    <HideOnScroll>
      <NavbarContainer position="fixed" themeMode={themeMode}>
        <Container maxWidth="lg">
          <NavbarToolbar disableGutters>
            <Logo component={Link} to="/" sx={{ textDecoration: 'none' }}>
              <SchoolIcon fontSize="large" sx={{ color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                component="span" 
                fontWeight={700}
                sx={{ 
                  color: themeMode?.theme === 'dark' 
                    ? themes.dark.colors.text.primary 
                    : 'inherit'
                }}
              >
                {t('schoolAttendanceSystem')}
              </Typography>
            </Logo>

            {isMobile ? (
              <>
                <IconButton
                  edge="end"
                  color="primary"
                  aria-label="menu"
                  onClick={toggleDrawer}
                >
                  <MenuIcon />
                </IconButton>                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={toggleDrawer}
                  PaperProps={{
                    sx: { 
                      width: 280, 
                      padding: 2,
                      backgroundColor: themeMode?.theme === 'dark' 
                        ? themes.dark.colors.background.paper
                        : 'white',
                      color: themeMode?.theme === 'dark'
                        ? themes.dark.colors.text.primary
                        : 'inherit',
                    }
                  }}
                >
                  <List sx={{ mt: 2 }}>
                    {menuItems.map((item, index) => (
                      <ListItem 
                        button 
                        key={index} 
                        component={Link} 
                        to={item.path}
                        onClick={toggleDrawer}
                      >
                        <ListItemText primary={item.title} />
                      </ListItem>
                    ))}
                    
                    {/* Theme Toggle */}
                    <ListItem>
                      <ListItemText primary={t('darkMode')} />
                      <Switch 
                        checked={themeMode?.theme === 'dark'} 
                        onChange={themeMode?.toggleTheme} 
                        color="primary"
                        edge="end"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                    
                    {/* Language Selector */}
                    <ListItem button onClick={handleLanguageMenuOpen}>
                      <ListItemText primary={t('language')} />
                      <TranslateIcon fontSize="small" />
                    </ListItem>
                    
                    <ListItem 
                      button 
                      component={Link} 
                      to="/login"
                      onClick={toggleDrawer}
                      sx={{ 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        borderRadius: 2,
                        mt: 2,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }}
                    >
                      <ListItemText primary={t('login')} />
                    </ListItem>
                  </List>
                </Drawer>
              </>
            ) : (              <NavLinks>
                {menuItems.map((item, index) => (
                  <NavButton 
                    key={index} 
                    component={Link} 
                    to={item.path}
                    color="inherit"
                    themeMode={themeMode}
                  >
                    {item.title}
                  </NavButton>
                ))}
                
                {/* Theme Toggle */}
                <ThemeToggle themeMode={themeMode}>
                  {themeMode?.theme === 'dark' ? 
                    <LightModeIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} /> : 
                    <DarkModeIcon sx={{ color: 'rgba(0, 0, 0, 0.7)', mr: 1 }} />
                  }
                  <Switch 
                    checked={themeMode?.theme === 'dark'} 
                    onChange={themeMode?.toggleTheme} 
                    color="primary"
                    size="small"
                  />
                </ThemeToggle>
                
                {/* Language Selector */}                <LanguageButton
                  onClick={handleLanguageMenuOpen}
                  endIcon={<ArrowDownIcon sx={{ 
                    color: themeMode?.theme === 'dark' ? '#ffffff' : undefined,
                    transition: 'transform 0.2s ease',
                    transform: Boolean(languageMenu) ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />}
                  startIcon={<TranslateIcon sx={{ 
                    color: themeMode?.theme === 'dark' ? '#ffffff' : undefined
                  }} />}
                  themeMode={themeMode}
                >
                  {i18n.language === 'en' ? 'English' : 'العربية'}
                </LanguageButton>
                
                <LoginButton 
                  variant="contained" 
                  component={Link} 
                  to="/login"
                  themeMode={themeMode}
                >
                  {t('login')}
                </LoginButton>
              </NavLinks>
            )}              <Menu
              anchorEl={languageMenu}
              open={Boolean(languageMenu)}
              onClose={handleLanguageMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: { 
                  mt: 1.5, 
                  borderRadius: 2,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.3))',
                  boxShadow: themeMode?.theme === 'dark' 
                    ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.1)',
                  backgroundColor: themeMode?.theme === 'dark' 
                    ? 'rgba(37, 42, 52, 0.98)'
                    : 'white',
                  color: themeMode?.theme === 'dark'
                    ? '#ffffff'
                    : 'inherit',
                  backdropFilter: 'blur(12px)',
                  border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: 10,
                    height: 10,
                    bgcolor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.98)' : 'white',
                    transform: 'translate(-50%, -50%) rotate(45deg)',
                    borderTop: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    borderLeft: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    zIndex: 0,
                  },
                  '& .MuiMenuItem-root': {
                    padding: '12px 24px',
                    minWidth: '150px',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: themeMode?.theme === 'dark'
                      ? 'rgba(77, 125, 255, 0.18)'
                      : 'rgba(0, 0, 0, 0.05)',
                    transform: 'translateX(4px)',
                  }
                }
              }}
            >              <MenuItem 
                onClick={() => changeLanguage('en')}
                selected={i18n.language === 'en'}
                sx={{
                  backgroundColor: i18n.language === 'en' && themeMode?.theme === 'dark' ? 
                    'rgba(77, 125, 255, 0.25)' : i18n.language === 'en' ? 'rgba(25, 118, 210, 0.08)' : undefined,
                  color: i18n.language === 'en' && themeMode?.theme === 'dark' ? '#ffffff' : undefined,
                  fontWeight: i18n.language === 'en' ? 600 : 400,
                  borderRadius: 1,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.3)' : 'rgba(25, 118, 210, 0.12)',
                  },
                  '&.Mui-selected::before': {
                    content: '""',
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 4,
                    backgroundColor: themeMode?.theme === 'dark' ? '#4d7dff' : '#1976d2',
                    borderRadius: '50%',
                  }
                }}
              >
                English
              </MenuItem>
              <MenuItem 
                onClick={() => changeLanguage('ar')}
                selected={i18n.language === 'ar'}
                sx={{
                  backgroundColor: i18n.language === 'ar' && themeMode?.theme === 'dark' ? 
                    'rgba(77, 125, 255, 0.25)' : i18n.language === 'ar' ? 'rgba(25, 118, 210, 0.08)' : undefined,
                  color: i18n.language === 'ar' && themeMode?.theme === 'dark' ? '#ffffff' : undefined,
                  fontWeight: i18n.language === 'ar' ? 600 : 400,
                  borderRadius: 1,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.3)' : 'rgba(25, 118, 210, 0.12)',
                  },
                  '&.Mui-selected::before': {
                    content: '""',
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 4,
                    backgroundColor: themeMode?.theme === 'dark' ? '#4d7dff' : '#1976d2',
                    borderRadius: '50%',
                  }
                }}
              >
                العربية
              </MenuItem>
            </Menu>
          </NavbarToolbar>
        </Container>
      </NavbarContainer>
    </HideOnScroll>
  );
}

export default Navbar;

