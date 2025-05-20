import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { ThemeContext, themes } from '../utils/themeContext';
import apiService from '../services/apiService';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import storageUtils from '../utils/storageUtils';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  margin: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'visible',
  backgroundColor: themeMode?.theme === 'dark' 
    ? themes.dark.colors.background.paper 
    : themes.light.colors.background.paper,
  color: themeMode?.theme === 'dark' 
    ? themes.dark.colors.text.primary 
    : themes.light.colors.text.primary,
}));

const AdminManagement = () => {
  const { t } = useTranslation();
  const themeMode = useContext(ThemeContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = storageUtils.getToken();
      const response = await apiService.get('/admin-management/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });      // Handle different possible response formats
      // Note: Since apiService.get already returns response.data, we don't need to access .data again
      const adminData = Array.isArray(response) ? response :
                       response?.admins ? response.admins :
                       response || [];
                       
      setAdmins(adminData);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(t('errorFetchingAdmins'));
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }    try {
      setLoading(true);
      
      // Use apiService instead of direct axios call
      await apiService.post('/admin-management/create', {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password
      });

      setSuccess(t('adminCreatedSuccessfully'));
      setOpenDialog(false);
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || t('errorCreatingAdmin'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      setLoading(true);
      const token = storageUtils.getToken();
      await apiService.delete(`/admin-management/delete/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(t('adminDeletedSuccessfully'));
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || t('errorDeletingAdmin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>        <Typography variant="h4" fontWeight="bold" sx={{
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary
        }}>
          {t('adminManagement')}
        </Typography><Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 2,
            background: themeMode?.theme === 'dark' 
              ? 'linear-gradient(135deg, #4d7dff 0%, #3a67e0 100%)'
              : 'linear-gradient(135deg, #2963ff 0%, #1e4ecc 100%)',
            '&:hover': {
              background: themeMode?.theme === 'dark' 
                ? 'linear-gradient(135deg, #3a67e0 0%, #2854c8 100%)'
                : 'linear-gradient(135deg, #1e50e0 0%, #1a40b0 100%)',
            }
          }}
        >
          {t('addNewAdmin')}
        </Button>
      </Box>      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: themeMode?.theme === 'dark' ? 'rgba(211, 47, 47, 0.1)' : undefined,
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
            '& .MuiAlert-icon': {
              color: themeMode?.theme === 'dark' ? '#f44336' : undefined
            }
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            backgroundColor: themeMode?.theme === 'dark' ? 'rgba(46, 125, 50, 0.1)' : undefined,
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
            '& .MuiAlert-icon': {
              color: themeMode?.theme === 'dark' ? '#66bb6a' : undefined
            }
          }} 
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}<StyledCard themeMode={themeMode}>        <CardContent>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
            }}
          >
            <Table>
              <TableHead><TableRow><TableCell sx={{ 
                    fontWeight: 'bold',
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                  }}>{t('name')}</TableCell><TableCell sx={{ 
                    fontWeight: 'bold',
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                  }}>{t('email')}</TableCell><TableCell sx={{ 
                    fontWeight: 'bold',
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                  }}>{t('actions')}</TableCell></TableRow></TableHead><TableBody>{loading ? (<TableRow>
                    <TableCell colSpan={3} align="center" sx={{ 
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                    }}>
                      <CircularProgress size={24} sx={{ 
                        color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary 
                      }} />
                    </TableCell>
                  </TableRow>) : admins.length === 0 ? (<TableRow>
                    <TableCell colSpan={3} align="center" sx={{ 
                      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                    }}>
                      {t('noAdminsFound')}
                    </TableCell>
                  </TableRow>) : (admins.map((admin) => (<TableRow key={admin._id} sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: themeMode?.theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)' 
                          : 'rgba(0, 0, 0, 0.02)' 
                      },
                      '&:hover': { 
                        backgroundColor: themeMode?.theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.04)' 
                      } 
                    }}>
                      <TableCell sx={{ 
                        color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                      }}>{admin.name}</TableCell>
                      <TableCell sx={{ 
                        color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                      }}>{admin.email}</TableCell>
                      <TableCell>
                        <Tooltip title={t('deleteAdmin')}>
                          <span>
                            <IconButton
                              onClick={() => handleDeleteAdmin(admin._id)}
                              color="error"
                              size="small"
                              disabled={loading}
                              sx={{
                                color: themeMode?.theme === 'dark' ? '#f44336' : undefined
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
          }
        }}>
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          background: themeMode?.theme === 'dark' 
            ? 'linear-gradient(90deg, rgba(77, 125, 255, 0.1) 0%, rgba(77, 125, 255, 0.0) 100%)'
            : 'linear-gradient(90deg, rgba(41, 99, 255, 0.1) 0%, rgba(41, 99, 255, 0.0) 100%)' 
        }}>{t('addNewAdmin')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>            <TextField
              fullWidth
              label={t('name')}
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                },
              }}/>            <TextField
              fullWidth
              label={t('email')}
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                },
              }}/>            <TextField
              fullWidth
              label={t('password')}
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                },
              }}/>            <TextField
              fullWidth
              label={t('confirmPassword')}
              type="password"
              value={newAdmin.confirmPassword}
              onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                },
              }}/>
          </Box>
        </DialogContent>        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={loading}
            sx={{
              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '&:hover': {
                backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
              }
            }}
          >
            {t('cancel')}
          </Button>
          <Tooltip title={loading ? t('creating') : t('create')}>
            <span>
              <Button
                onClick={handleCreateAdmin}
                variant="contained"
                disabled={loading}
                sx={{ 
                  backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.9)' : undefined,
                  }
                }}
              >
                {loading ? t('creating') : t('create')}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
