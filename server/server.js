require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const apiRoutes = require('./routes/api');
const { supabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow localhost (dev) + any Vercel deployment (production)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/,   // any Vercel preview/production URL
  /^https:\/\/.*\.loca\.lt$/,      // localtunnel (for mobile testing)
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded documents / assets mock if any
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api', apiRoutes);

// Root & API Info Endpoints
app.get(['/', '/api-info'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'LifeLink Smart Organ & Emergency Blood Donation API Server',
    webAppUrl: 'http://localhost:5175',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'LifeLink Smart Donation API',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP Server & WebSocket for Real-time events
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
      client.send(message);
    }
  });
};

app.set('broadcast', broadcastRealtimeEvent);

wss.on('connection', (ws) => {
  console.log('⚡ New WebSocket client connected');

  // Send initial connection confirmation + current stats
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    payload: { message: 'Connected to LifeLink Realtime Notification Feed' },
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error('WS Error:', err);
    }
  });

  ws.on('close', () => {
    console.log('⚡ WebSocket client disconnected');
  });
});

// ============================================================
// LIVE REALTIME EVENT SIMULATOR
// Broadcasts real-world-style events every few seconds so that
// the UI counters and notification feed always update live.
// ============================================================
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

// Broadcast a random live event every 5–12 seconds
function scheduleLiveEvent() {
  const delay = rand(5000, 12000);
  setTimeout(() => {
    if (wss.clients.size > 0) {
      const event = pick(LIVE_EVENTS)();
      broadcastRealtimeEvent(event.type, event.payload);
      console.log(`📡 Live event: ${event.type} → ${event.payload.message}`);
    }
    scheduleLiveEvent(); // recurse
  }, delay);
}

server.listen(PORT, () => {
  console.log(`🚀 LifeLink Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}`);
  console.log(`📊 Public stats: http://localhost:${PORT}/api/stats`);

  // Start live event simulator after a short delay
  setTimeout(scheduleLiveEvent, 3000);
});
