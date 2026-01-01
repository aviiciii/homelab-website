# HomeLab Dashboard

Terminal-style minimal dashboard. Built with Next.js 15.

## Features

- Dark/Light (Paper Terminal) theme with persistent storage

- Real-time service status: ONLINE, OFFLINE, TIMEOUT

 ## Keyboard navigation:

- ↑/↓ → navigate

- Enter → open service

- Ctrl+Shift+M → toggle theme

- ? → help


## Setup

```
git clone https://github.com/yourusername/homelab-dashboard.git
cd homelab-dashboard
npm install
npm run dev
```

## Configuration

Edit services in app/page.tsx:
```
const SERVICES = [
  { name: "Jellyfin", url: "http://192.168.1.200:8096", address: "192.168.1.200:8096" },
  { name: "qBittorrent", url: "http://192.168.1.200:8080", address: "192.168.1.200:8080" },
]
```
