# Home Automation

A lightweight, extensible Node.js-based automation framework designed to integrate with Home Assistant using its REST and WebSocket APIs. This project replaces select Node-RED flows with organized, code-based logic for motion lighting, device scheduling, and custom automations.

---

## Features

-   🧠 Motion-activated lighting with time-based brightness and configurable delay
-   🕰️ Scheduled automations using cron-style jobs
-   ⏱️ Enforced runtime windows for devices (e.g., aquariums, lights)
-   📬 NTFY-based push notifications for key events
-   🧩 Modular automation per room or device
-   🔐 Supports action-based notifications with mobile app replies
-   🐳 Runs in Docker for easy deployment and persistence

---

## Project Structure

```
homeAutomation/
├── index.js                 # Main entry point
├── config.js                # Loads .env variables
├── README.md
├── lib/                     # Core logic
│   ├── ha-rest.js           # REST API wrapper for Home Assistant
│   ├── ha-websocket.js      # WebSocket connection and state subscriptions
│   ├── ntfy.js              # Push notification logic
│   ├── utils.js             # Time helpers, cron, and state enforcement
│   ├── logger.js            # Winston-based logging with rotation
│   └── action_notifications.js # Actionable notification handler
├── automations/            # Modular automation files
│   ├── motion_lights/       # Organized by area (bedrooms, main floor, etc.)
│   ├── household/           # Mailbox, front door, portable AC
│   └── schedules/           # Cron-based toggles (e.g., motion sensor enable/disable)
├── harness/                # For standalone dev/testing scripts
│   ├── harness.js           # Test runner
│   └── bootstrap.js         # Loads .env explicitly
├── .env                    # Environment variables (not committed)
├── Dockerfile
└── docker-compose.yml
```

---

## Setup

### Prerequisites

-   A running instance of [Home Assistant](https://www.home-assistant.io/)
-   Node.js or Docker installed
-   Home Assistant long-lived access token
-   Optional: [ntfy](https://ntfy.sh/) server for push notifications

### Configuration

Create a `.env` file at the root level:

```
HA_URL=http://homeassistant.local:8123
HA_TOKEN=your_home_assistant_token
NTFY_URL=https://ntfy.yourdomain.com
NTFY_TOKEN=your_ntfy_token
LOG_LEVEL=info
```

No need to modify `config.js` — it pulls directly from `.env`.

### Run with Node

```bash
npm install
node index.js
```

### Run with Docker

```bash
docker compose up -d
```

---

## Usage & Customization

-   Add motion light automations with `setupMotionLightAutomation()`
-   Enforce device on/off windows using `enforceStateDuringRange()`
-   Schedule services with `cronScheduleService()` or `cronScheduleFn()`
-   Push alerts via `ntfy({ channel, message, title, priority, tags })`
-   Register response handlers via `onAction('ACTION_NAME', handlerFn)`

---

## Example Automations

-   🔆 Bedroom lights turn on at night when motion is detected, dimmed to time-appropriate brightness.
-   🐢 Turtle tank lights stay on from 8:00–20:00, enforced even if turned off manually.
-   🌡️ Sends a prompt asking if the portable AC should run, then controls it based on time, override switches, and door state.
-   📬 Detects when mail is delivered or collected, and resets flags at 04:00 daily.
-   🔒 Locks the front door automatically 30 seconds after it closes, with NTFY alerts on lock state changes.

---

## License

MIT

---

## Author

Aaron Solenberg
