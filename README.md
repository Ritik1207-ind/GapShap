# ✨ GapShap — Premium Real-Time Glassmorphism Chat

<div align="center">
  <img src="./client/public/chat_preview.png" alt="GapShap Chat Preview" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px;" />
  <br />
  <img src="./client/public/auth_preview.png" alt="GapShap Auth Preview" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

<br />

**GapShap** is a state-of-the-art, high-fidelity real-time chat application designed to deliver an immersive, premium communication experience. Built with a robust MERN stack (MongoDB, Express, React, Node.js) and powered by Socket.IO, GapShap seamlessly bridges high-performance real-time messaging with cutting-edge modern web aesthetics.

---

## 💎 The Glassmorphism Design System

Unlike traditional flat dark-mode applications, GapShap is engineered around a spectacular **Glassmorphism design language** that emphasizes depth, refraction, and dynamic lighting:

* **Living Canvas Backdrop**: The entire application floats above an ambient, animated canvas featuring drifting radial-gradient orbs (`float` physics) and a continuous 14-second `breathe` hue-rotation cycle.
* **Asymmetric Border Lighting**: Every panel simulates physical frosted glass (`backdrop-filter: blur(20px) saturate(180%)`) with top-left specular highlights and subtle bottom-right shadows, mimicking a natural top-down light source.
* **Tactile Message Physics**: Messages are treated as individual glass objects. Sent messages feature a vibrant purple-gradient glass tint (`msg-own`), while received messages use a clean white-frosted tint (`msg-other`). Hovering over any message lifts it against gravity (`translateY(-2px)`) with a directional glow.
* **Interactive Focus Rings**: The message input bar is a sleek frosted panel that springs forward on focus, gaining a glowing purple border ring and deep drop shadows to provide immediate, satisfying tactile feedback.
* **Flawless GPU Compositing**: Completely isolates background filter animations from the active UI layer, preventing WebKit/Blink rasterization conflicts and ensuring butter-smooth 60fps rendering.

---

## ⚡ Core Features & Architecture

### 💬 Multi-Room & Direct Messaging Infrastructure
* **Public Chat Rooms**: Users can create, browse, and join persistent, topic-based public chat rooms. Each room maintains its own isolated real-time socket broadcast channel and message history.
* **Instant Direct Messaging (DMs)**: Private 1-on-1 messaging threads feature real-time unread notification badges and instant participant state synchronization.
* **Global User Discovery**: An integrated **User Browser** modal allows users to search the entire registered database instantly by username and initiate private conversations with a single click.

### 🚀 High-Performance Real-Time Engine (Socket.IO)
* **Zero-Lag Mutable Ref Pattern**: To prevent React re-render cycles from dropping active WebSocket connections, socket listeners utilize advanced mutable ref bridging. This guarantees zero dropped messages even when rapidly switching between active rooms and DMs.
* **Live Typing Indicators**: Broadcasts real-time typing events (`typing_start` / `typing_stop`) across rooms and DMs, displaying animated, non-intrusive typing pills to keep conversations feeling active and alive.
* **Instant Online Presence**:: Dynamically tracks user disconnects and reconnects, keeping the right-hand `UserList` panel perfectly synchronized with active online counts.

### 🛡️ Bulletproof Frontend & Security
* **Rock-Solid Viewport Locking**: Engineered to bypass browser GPU compositing conflicts and flexbox collapse bugs, ensuring the UI stays rigidly locked to 100% viewport dimensions without unwanted scrollbars or clipping.
* **JWT Authentication**: Secure, token-based authentication flow with automated session cleanup on logout to prevent memory leaks or stale state caching.
* **100% Linter Compliant**: Completely clean, zero-warning codebase adhering to strict ESLint and React best practices.

---

## 📂 Project Structure

```text
gapshap/
├── client/                 # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/     # Glassmorphism UI Components (Sidebar, ChatWindow, etc.)
│   │   ├── hooks/          # Custom React Hooks (useSocket, useTyping, etc.)
│   │   ├── index.css       # Core Design Tokens & Glass Utilities
│   │   └── App.jsx         # Main Application & Stacking Context Controller
│   └── tailwind.config.js  # Tailwind Theme & Custom Animations
├── server/                 # Backend Node/Express Application
│   ├── models/             # Mongoose Schemas (User, Room, Message, DM)
│   ├── routes/             # REST API Endpoints (Auth, Rooms, Messages, DMs)
│   ├── middleware/         # JWT Auth Verification & Error Handling
│   └── server.js           # Express Server & Socket.IO Broadcast Controller
└── README.md               # Project Documentation
```

---

## 🛠️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gapshap
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Run the Application

Open two terminal tabs/windows:

**Terminal 1 (Backend Server):**
```bash
# From the root directory
npm run dev
```

**Terminal 2 (Frontend Vite Dev Server):**
```bash
cd client
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

---

## 📜 License

This project is licensed under the MIT License.
