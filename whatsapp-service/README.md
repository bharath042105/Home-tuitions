# Vidya WhatsApp Service

Lightweight, self-hosted WhatsApp notification worker for Vidya Home Tuitions built with `@whiskeysockets/baileys`.

## Features
- **100% Free**: Zero per-message or subscription costs.
- **Linked Devices QR Scan**: Works just like WhatsApp Web on your laptop.
- **REST API (`POST /send`)**: Called automatically by the Spring Boot backend when leads, inquiries, and tutor applications are submitted.
- **Persistent Session**: Auto-reconnects when restarted without needing to re-scan.

## Quick Start (Local Run)
```bash
npm install
npm start
```
Then open [http://localhost:3001/qr](http://localhost:3001/qr) and scan the QR code with WhatsApp on your phone (**Linked Devices**).

## Deployment on Render (Free Web Service)
1. Go to **Render Dashboard** ➔ **New +** ➔ **Web Service**.
2. Select the `Home-tuitions` GitHub repository.
3. Configure:
   - **Root Directory**: `whatsapp-service`
   - **Runtime**: `Node` (or `Docker`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. After deploy, visit `https://your-service.onrender.com/qr` and scan the QR code.
5. In your Backend Web Service on Render, add:
   - `WHATSAPP_SERVICE_URL` = `https://your-service.onrender.com`
