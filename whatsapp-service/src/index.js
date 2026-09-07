const express = require("express");
const cors = require("cors");
const pino = require("pino");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.WHATSAPP_API_SECRET || "vidya-wa-secret-2026";
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, "../auth_info");

app.use(cors());
app.use(express.json());

// In-memory state
let sock = null;
let currentQrRaw = null;
let currentQrDataUrl = null;
let isConnected = false;
let connectedUser = null;
let connectionStatus = "initializing";

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      auth: state,
      browser: ["Vidya Home Tuitions", "Chrome", "1.0.0"],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrRaw = qr;
        connectionStatus = "qr_ready";
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 2 });
          console.log("📲 New WhatsApp QR Code generated! Scan at /qr");
        } catch (err) {
          console.error("Failed to generate QR data URL:", err);
        }
      }

      if (connection === "connecting") {
        connectionStatus = "connecting";
        console.log("⏳ Connecting to WhatsApp...");
      }

      if (connection === "open") {
        isConnected = true;
        currentQrRaw = null;
        currentQrDataUrl = null;
        connectionStatus = "connected";
        connectedUser = sock.user ? sock.user.id.split(":")[0] : "connected";
        console.log(`✅ WhatsApp Connected successfully as +${connectedUser}`);
      }

      if (connection === "close") {
        isConnected = false;
        connectedUser = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`❌ WhatsApp connection closed (code ${statusCode}). Reconnecting: ${shouldReconnect}`);
        connectionStatus = shouldReconnect ? "reconnecting" : "logged_out";

        if (shouldReconnect) {
          setTimeout(() => {
            connectToWhatsApp();
          }, 3000);
        } else {
          console.log("User logged out. Clearing credentials to allow re-scanning...");
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(AUTH_DIR, { recursive: true });
          } catch (e) {
            console.error("Error clearing auth dir:", e);
          }
          setTimeout(() => {
            connectToWhatsApp();
          }, 2000);
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize WhatsApp socket:", err);
    setTimeout(connectToWhatsApp, 5000);
  }
}

// Start WhatsApp connection
connectToWhatsApp();

// -------------------------------------------------------------
// HTTP Routes
// -------------------------------------------------------------

// Home page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Vidya WhatsApp Service</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
        .card { background: white; max-width: 480px; width: 100%; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: center; }
        h1 { color: #0f172a; margin-top: 0; font-size: 22px; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin: 12px 0; }
        .connected { background: #dcfce7; color: #15803d; }
        .disconnected { background: #fee2e2; color: #b91c1c; }
        .connecting { background: #fef3c7; color: #b45309; }
        .btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
        .btn:hover { background: #1eb954; }
        p { color: #64748b; font-size: 14px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Vidya Home Tuitions</h1>
        <p>Automated WhatsApp Dispatch Service</p>
        <div>
          <span class="badge ${isConnected ? 'connected' : (connectionStatus === 'connecting' ? 'connecting' : 'disconnected')}">
            ${isConnected ? '✅ Connected as +' + connectedUser : '⚠️ ' + connectionStatus.toUpperCase()}
          </span>
        </div>
        ${!isConnected ? '<a href="/qr" class="btn">📱 Scan QR Code to Link</a>' : '<p style="color: #15803d; font-weight: 600;">System is ready to send automated messages!</p>'}
      </div>
    </body>
    </html>
  `);
});

// Interactive QR Page
app.get("/qr", (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>WhatsApp Connected</title>
        <style>
          body { font-family: sans-serif; background: #f8fafc; padding: 40px 20px; text-align: center; }
          .card { background: white; max-width: 440px; margin: 0 auto; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .check { font-size: 54px; color: #16a34a; }
          h2 { color: #0f172a; margin: 12px 0 6px; }
          p { color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="check">✅</div>
          <h2>WhatsApp is Connected!</h2>
          <p>Linked Number: <strong>+${connectedUser}</strong></p>
          <p>Your backend can now send automated lead notifications seamlessly.</p>
        </div>
      </body>
      </html>
    `);
  }

  if (!currentQrDataUrl) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="3">
        <title>Generating QR...</title>
        <style>body { font-family: sans-serif; text-align: center; padding: 60px; color: #64748b; }</style>
      </head>
      <body>
        <h2>Generating WhatsApp QR Code...</h2>
        <p>Please wait 3 seconds. Page will refresh automatically.</p>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="20">
      <title>Link WhatsApp - Vidya Home Tuitions</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0fdf4; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
        .card { background: white; max-width: 420px; width: 100%; padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; }
        h1 { font-size: 20px; color: #0f172a; margin: 0 0 8px; }
        p.subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .qr-wrapper { display: inline-block; padding: 12px; border: 2px dashed #22c55e; border-radius: 12px; background: white; }
        img { display: block; max-width: 100%; height: auto; }
        .instructions { text-align: left; background: #f8fafc; border-radius: 10px; padding: 16px; margin-top: 24px; font-size: 13px; color: #334155; line-height: 1.6; }
        .instructions ol { margin: 0; padding-left: 20px; }
        .timer { font-size: 11px; color: #94a3b8; margin-top: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Link Your WhatsApp</h1>
        <p class="subtitle">Scan to connect automated lead dispatch</p>
        <div class="qr-wrapper">
          <img src="${currentQrDataUrl}" alt="WhatsApp QR Code" />
        </div>
        <div class="instructions">
          <strong>Steps on your phone:</strong>
          <ol>
            <li>Open <strong>WhatsApp</strong> on your phone</li>
            <li>Tap <strong>Settings</strong> or the <strong>3 Dots</strong></li>
            <li>Tap <strong>Linked Devices</strong></li>
            <li>Tap <strong>Link a Device</strong> & scan this QR code</li>
          </ol>
        </div>
        <div class="timer">QR Code refreshes automatically every 20 seconds</div>
      </div>
    </body>
    </html>
  `);
});

// Health check for Render
app.get(["/healthz", "/health"], (req, res) => {
  res.status(200).json({ ok: true, status: connectionStatus });
});

// JSON Status endpoint
app.get("/status", (req, res) => {
  res.json({
    connected: isConnected,
    user: connectedUser,
    status: connectionStatus,
    timestamp: new Date().toISOString(),
  });
});

// Send Message Endpoint (Called by Spring Boot Backend)
app.post("/send", async (req, res) => {
  const secret = req.headers["x-api-secret"] || req.body.secret;
  if (API_SECRET && secret !== API_SECRET) {
    return res.status(401).json({ error: "Unauthorized: Invalid API secret" });
  }

  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing required fields: 'to' and 'message'" });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      error: "WhatsApp service is not connected. Please visit /qr to link your device first.",
      status: connectionStatus,
    });
  }

  try {
    // Format recipient to standard WhatsApp JID (e.g. 918074470640@s.whatsapp.net)
    let cleanPhone = to.toString().replace(/[^0-9]/g, "");

    // If 10 digits (Indian mobile), prepend 91
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;

    const result = await sock.sendMessage(jid, { text: message });

    console.log(`📤 WhatsApp message dispatched to ${cleanPhone} (ID: ${result?.key?.id})`);

    return res.json({
      success: true,
      messageId: result?.key?.id,
      to: cleanPhone,
    });
  } catch (err) {
    console.error(`Failed to send WhatsApp message to ${to}:`, err);
    return res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Vidya WhatsApp Service listening on port ${PORT}`);
  console.log(`👉 Open http://localhost:${PORT}/qr in your browser to scan the QR code`);
});
