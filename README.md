# Home Automation

A lightweight, extensible Node.js-based automation framework designed to integrate with Home Assistant using its REST and WebSocket APIs. This project replaces select Node-RED flows wih organized, code-based logic for motion lighting, device scheduling, and custom automations.

---

## Features

-   🧠 Motion-activated lighting with time-based brightness and configurable delay.
-   🕰️ Scheduled automations using cron-style jobs.
-   📅 Time range enforcement for device states.
-   📬 NTFY-based push notifications for important events.
-   🧩 Modular design using per-room and per-scenario automation files.
-   🐳 Runs in Docker for easy deployment and persistence.

---

## Project Structure

```
homeAutomation/
├── Dockerfile
├── docker-compose.yml
├── index.js # Main entry point
├── config.js # Global config (e.g., Home Assistant + NTFY credentials)
├── automations/ # All logic grouped by category
│ ├── household/ # e.g., bedroom portable AC control
│ ├── motion_lights/ # Room-based motion light automation
│ └── schedules/ # Cron or enforced time range automations
├── lib/ # Utility modules
│ ├── ha-rest.js # Home Assistant REST API interface
│ ├── ha-websocket.js # WebSocket subscription manager
│ ├── ntfy.js # Notification handler for ntfy
│ └── utils.js # Timestamps, time ranges, cron scheduler
└── .gitignore
```

---

## Setup

### Prerequisites

-   A running instance of [Home Assistant](https://www.home-assistant.io/)
-   Node.js or Docker installed
-   Home Assistant long-lived access token
-   Optional: [ntfy](https://ntfy.sh/) server for push notifications

### Configuration

Create a `config.js` file in the root directory:

```js
export const HA = {
    BASE_URL: 'http://homeassistant.local:8123',
    TOKEN: 'YOUR_LONG_LIVED_ACCESS_TOKEN'
};

export const NTFY = {
    BASE_URL: 'https://ntfy.yourdomain.com',
    TOKEN: 'YOUR_NTFY_AUTH_TOKEN'
};
```

### Run with Node

```bash
npm install
node index.js
```

### Run with Docker

```bash
docker compose up -d
```

### Customization

-   Add new automation logic under `automations/`
-   Use `cronSchedule()` for daily/weekly time-based tasks
-   Use `enforceStateDuringRange()` to keep devices on/off between certain hours
-   Add motion lights using `setupMotionLightAutomation()` in `light_control.js`
-   Send NTFY messages via `ntfy(channel, message, title, priority, tags)`

### Example Automations

-   Turn on bedroom lights when motion is detected, then turn off after 5 minutes of inactivity.
-   Keep turtle tank lights on between 8:00–20:00, automatically turning them back on if someone turns them off.
-   Notify if the bedroom door is left open while the portable AC is on.

### License

MIT

### Author

Aaron Solenberg
