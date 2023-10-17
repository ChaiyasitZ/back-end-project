const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
// const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const { User, Order } = require('./models'); // Import your Sequelize models
const sequelize = require('./db'); // Import your Sequelize configuration

const app = express();

// const generateRandomKey = (length) => {
//     return crypto.randomBytes(length).toString('hex');
//   };
  
// const secretKey = generateRandomKey(32);

// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());
// app.use(passport.session());

// Session configuration
// app.use(session({
//     secret: secretKey,
//     resave: false,
//     saveUninitialized: false,
// }));

// Passport configuration
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const user = await User.create({ username, email, password: hashedPassword });
    res.json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful', user: req.user });
});

// Create an Order (require authentication)
app.post('/orders', (req, res) => {
  if (req.isAuthenticated()) {
    const { product, quantity } = req.body;
    Order.create({ userId: req.user.id, product, quantity })
      .then((order) => {
        res.json({ message: 'Order created successfully', order });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Order creation failed' });
      });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
});

// Get Orders for the Logged-In User (require authentication)
app.get('/orders', (req, res) => {
  if (req.isAuthenticated()) {
    Order.findAll({ where: { userId: req.user.id } })
      .then((orders) => {
        res.json(orders);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Error fetching orders' });
      });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

// Start the server
const PORT = process.env.PORT || 8080;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost${PORT}`);
  });
});
