require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const app = express();

// Configuração de views
app.set('view engine', 'ejs');

// Arquivos estáticos
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

// Sessão
app.use(session({
  secret: 'segredo',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

let users = [];

// Google Auth
passport.use(new GoogleStrategy({
    
    

clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    let user = users.find(u => u.googleId === profile.id);

    if (!user) {
      user = {
        googleId: profile.id,
        name: profile.displayName
      };
      users.push(user);
    }

    return done(null, user);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Rotas
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

app.listen(3000, () => {
  console.log('Rodando em http://localhost:3000');
});