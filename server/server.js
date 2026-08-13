require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const { supabase } = require('./config/db');

// ── Crash Guards ─────────────────────────────────────────────────────────────
// Prevent the entire process from dying on an unhandled error.
// Log the error and keep running — critical for 24/7 uptime.
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception (process kept alive):', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection (process kept alive):', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // disabled so the API can be consumed by any frontend
}));

// ── CORS — allow localhost (dev) + any Vercel/localtunnel deployment ──────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
  'https://pdd-2-ld6v.onrender.com',
  'https://pdd-1-we4e.onrender.com',
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.loca\.lt$/,
  /^https:\/\/.*\.onrender\.com$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body Parsing with size limits ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Keep-alive for long-lived connections ─────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global limiter — 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/api/health', // never rate-limit health checks
});

// Strict limiter for auth routes — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
});

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Root & Health Endpoints ───────────────────────────────────────────────────
app.get(['/', '/api-info'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'LifeLink Smart Organ & Blood Donation API Server',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      publicStats: '/api/stats',
      searchDonors: '/api/donors/search',
      searchBlood: '/api/inventory/blood',
      searchOrgans: '/api/inventory/organs',
      aiMatching: '/api/ai/match-donors',
      aiChatbot: '/api/ai/chat'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'LifeLink Smart Donation API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/download-apk', (req, res) => {
  res.download(path.join(__dirname, '..', 'LifeLink-app-debug.apk'), 'LifeLink.apk');
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must have exactly 4 args to be recognized as error middleware by Express.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Express Error:', err.message);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please try again.'
      : err.message,
  });
});

// ── HTTP Server & WebSocket ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Attach wss to app for controllers
app.set('wss', wss);

const broadcastRealtimeEvent = (type, payload = {}) => {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('WS send error:', err.message);
      }
    }
  });
};

app.set('broadcast', broadcastRealtimeEvent);

wss.on('connection', (ws, req) => {
  console.log('⚡ New WebSocket client connected');

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    payload: { message: 'Connected to LifeLink Realtime Notification Feed' },
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Echo back to all clients (broadcast chat/events from client)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error('WS message parse error:', err.message);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err.message);
  });

  ws.on('close', () => {
    console.log('⚡ WebSocket client disconnected');
  });
});

// ── Live Realtime Event Simulator ────────────────────────────────────────────
// Broadcasts realistic events every 5–12 seconds to keep UI dashboards alive.
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGANS      = ['Kidney', 'Liver', 'Heart', 'Cornea', 'Lung', 'Pancreas'];
const CITIES      = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const HOSPITALS   = ['Apollo Hospital', 'AIIMS', 'Fortis Healthcare', 'Max Super Speciality', 'Narayana Health', 'Manipal Hospital'];
const DONOR_NAMES = ['Arjun Sharma', 'Priya Patel', 'Rahul Gupta', 'Anjali Singh', 'Vikram Nair', 'Deepa Menon', 'Ravi Kumar', 'Sneha Iyer'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const LIVE_EVENTS = [
  () => ({
    type: 'BLOOD_DONATED',
    payload: {
      title: '🩸 New Blood Donation',
      message: `${pick(DONOR_NAMES)} donated ${pick(BLOOD_GROUPS)} blood at ${pick(HOSPITALS)}, ${pick(CITIES)}`,
      units: rand(1, 3),
      city: pick(CITIES),
    }
  }),
  () => ({
    type: 'EMERGENCY_REQUEST',
    payload: {
      title: '🚨 EMERGENCY Blood Request',
      message: `Urgent: ${pick(BLOOD_GROUPS)} blood needed at ${pick(HOSPITALS)}, ${pick(CITIES)} — ${rand(1, 5)} units`,
      urgency: 'CRITICAL',
      city: pick(CITIES),
    }
  }),
  () => ({
    type: 'DONOR_ONLINE',
    payload: {
      title: '✅ Donor Now Available',
      message: `${pick(DONOR_NAMES)} (${pick(BLOOD_GROUPS)}) is now available in ${pick(CITIES)}`,
      city: pick(CITIES),
    }
  }),
  () => ({
    type: 'ORGAN_AVAILABLE',
    payload: {
      title: '💚 Organ Available',
      message: `${pick(ORGANS)} now available at ${pick(HOSPITALS)}, ${pick(CITIES)}`,
      organ: pick(ORGANS),
      city: pick(CITIES),
    }
  }),
  () => ({
    type: 'REQUEST_FULFILLED',
    payload: {
      title: '🎉 Request Fulfilled',
      message: `A blood donation request was fulfilled at ${pick(HOSPITALS)} — life saved!`,
      city: pick(CITIES),
    }
  }),
  () => ({
    type: 'NEW_DONOR_REGISTERED',
    payload: {
      title: '👤 New Donor Joined',
      message: `${pick(DONOR_NAMES)} joined LifeLink as a ${pick(['Blood', 'Organ'])} donor in ${pick(CITIES)}`,
      city: pick(CITIES),
    }
  }),
];

function scheduleLiveEvent() {
  const delay = rand(5000, 12000);
  setTimeout(() => {
    try {
      if (wss.clients.size > 0) {
        const event = pick(LIVE_EVENTS)();
        broadcastRealtimeEvent(event.type, event.payload);
        console.log(`📡 Live event: ${event.type} → ${event.payload.message}`);
      }
    } catch (err) {
      console.error('Live event error:', err.message);
    }
    scheduleLiveEvent(); // recurse
  }, delay);
}

server.listen(PORT, () => {
  console.log(`🚀 LifeLink Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}`);
  console.log(`📊 Public stats: http://localhost:${PORT}/api/stats`);
  console.log(`🛡️  Security: Helmet + Rate Limiting enabled`);
  console.log(`🔰 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start live event simulator after a short delay
  setTimeout(scheduleLiveEvent, 3000);
});
