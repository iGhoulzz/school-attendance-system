# Security Configuration Guide

This guide explains how to properly configure security settings for the School Attendance System.

## Environment Variables

### Required Backend Variables (.env in backend folder)

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5001
NODE_ENV=development # Change to 'production' for production deployment

# MongoDB
MONGO_URI=mongodb://localhost:27017/school-management
# Replace with your MongoDB connection string in production

# JWT Authentication 
JWT_SECRET=your-secure-jwt-secret # Use a strong random string in production
JWT_EXPIRY=1h # Token expiry time
JWT_REFRESH_EXPIRY=7d # Refresh token expiry time

# CSRF Protection
CSRF_SECRET=your-secure-csrf-secret # Use a different strong random string

# Email Configuration (for password reset)
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_FROM=noreply@yourschool.com

# Cross-Origin Resource Sharing
FRONTEND_URL=http://localhost:3000 # Frontend URL (for CORS)
BACKEND_URL=http://localhost:5001 # Backend URL
```

### Required Frontend Variables (.env in root folder)

Create a `.env` file in the project root with the following variables:

```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

For production, create a `.env.production` file:

```
REACT_APP_API_URL=https://api.yourproductiondomain.com/api
REACT_APP_FRONTEND_URL=https://yourproductiondomain.com
```

## Security Best Practices

### Generating Secure Secrets

For JWT_SECRET and CSRF_SECRET, generate secure random strings:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Setting Up HTTPS

In production, ensure your application uses HTTPS:

1. Obtain an SSL certificate (Let's Encrypt is free)
2. Configure your web server (Nginx/Apache) as a reverse proxy
3. Set NODE_ENV to 'production' to enforce secure cookies

Example Nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name yourproductiondomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Security

1. Create a dedicated MongoDB user with restricted permissions
2. Enable MongoDB authentication
3. Use connection string with credentials:
   ```
   MONGO_URI=mongodb://username:password@localhost:27017/school-management
   ```

### Email Configuration

For password reset functionality, configure a secure email provider:

1. Use application-specific passwords if using Gmail
2. Consider using a transactional email service like SendGrid or Mailgun

### Regular Updates

Keep dependencies updated to fix security vulnerabilities:

```bash
npm audit
npm update
```

## Testing Security Configuration

Run the following test to verify your security configuration:

```bash
cd backend
node security-test.js
```

This will check your environment variables and security settings.
