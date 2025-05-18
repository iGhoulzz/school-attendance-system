// Settings.js
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path if necessary
import './Settings.css';
import { ThemeContext, themes } from '../utils/themeContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Switch,
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../utils/themeContext';

function Settings() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const themeContext = useTheme();
  
  // If themeContext is undefined, provide fallback values
  const theme = themeContext?.theme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => console.log('Theme toggle not available'));
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    handleMenuClose();
  };  const SettingsCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    marginBottom: theme.spacing(3),
    boxShadow: themeContext.theme === 'dark' ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    background: themeContext.theme === 'dark' 
      ? 'linear-gradient(145deg, #252a34, #1e222a)'
      : 'linear-gradient(145deg, #ffffff, #f5f7fa)',
  }));
  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '800px', 
      margin: '0 auto',
      color: themeContext.theme === 'dark' ? '#e6e6e6' : 'inherit'
    }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        {t('Settings')}
      </Typography>      <Typography variant="body1" sx={{ 
        mb: 4, 
        color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' 
      }}>
        {t('adjustPreferences')}
      </Typography>

      <SettingsCard>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit' }}>
            {t('appearance')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>            <ListItem>
              <ListItemIcon>
                {theme === 'dark' ? <DarkModeIcon style={{ color: themeContext.colors?.primary }} /> : <LightModeIcon style={{ color: themeContext.colors?.primary }} />}
              </ListItemIcon>
              <ListItemText 
                primary={t('theme')} 
                secondary={theme === 'dark' ? t('darkMode') : t('lightMode')} 
                primaryTypographyProps={{
                  color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit'
                }}
                secondaryTypographyProps={{
                  color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                }}
              />
              <ListItemSecondaryAction>
                <Switch 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme}                  color="primary" 
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: themeContext.colors?.primary,
                      '&:hover': {
                        backgroundColor: `rgba(${themeContext.theme === 'dark' ? '77, 125, 255' : '41, 99, 255'}, 0.08)`,
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: themeContext.colors?.primary,
                    },
                  }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </SettingsCard>

      <SettingsCard>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit' }}>
            {t('language')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            <ListItem>              <ListItemIcon>
                <LanguageIcon style={{ color: themeContext.theme === 'dark' ? themeContext.colors?.primary : undefined }} />
              </ListItemIcon><ListItemText 
                primary={t('interfaceLanguage')} 
                secondary={i18n.language === 'ar' ? 'العربية' : 'English'} 
                primaryTypographyProps={{
                  color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit'
                }}
                secondaryTypographyProps={{
                  color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                }}
              />
              <ListItemSecondaryAction>                <IconButton onClick={handleMenuOpen} sx={{
                  color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined
                }}>
                  <ArrowDropDownIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      backgroundColor: themeContext.theme === 'dark' ? themeContext.colors.background.paper : undefined,
                      color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                      boxShadow: themeContext.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : undefined,
                      minWidth: 120
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => handleLanguageChange('en')}
                    sx={{
                      backgroundColor: i18n.language === 'en' && themeContext.theme === 'dark' ? 'rgba(77, 125, 255, 0.1)' : undefined,
                      color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                      '&:hover': {
                        backgroundColor: themeContext.theme === 'dark' ? 'rgba(77, 125, 255, 0.15)' : undefined,
                      }
                    }}
                  >
                    English
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleLanguageChange('ar')}
                    sx={{
                      backgroundColor: i18n.language === 'ar' && themeContext.theme === 'dark' ? 'rgba(77, 125, 255, 0.1)' : undefined,
                      color: themeContext.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                      '&:hover': {
                        backgroundColor: themeContext.theme === 'dark' ? 'rgba(77, 125, 255, 0.15)' : undefined,
                      }
                    }}
                  >
                    العربية
                  </MenuItem>
                </Menu>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </SettingsCard>
    </Box>
  );
}

export default Settings;
