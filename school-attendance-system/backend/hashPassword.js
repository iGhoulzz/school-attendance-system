const bcrypt = require('bcrypt');

const password = 'adminPass'; // Replace this with the password you want for your admin
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
  }
});
