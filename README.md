# Backend API

Simple backend with two main APIs for vehicle scheduling and notifications.

## Setup

```bash
npm install
npm start
```

Runs on port 3000.

## Folders

- `logging_middleware/` - Logger for API calls
- `vehicle_maintence_scheduler/` - Task optimization logic
- `notification_app_be/` - Notification ranking
- `server.js` - Main server file

## APIs

### 1. Vehicle Optimization

```
POST /api/vehicle-scheduling/optimize

Body: {"depotId": 1, "availableHours": 10}

Response: {"selectedTasks": [...], "totalImpact": 130, "totalHours": 8}
```

Picks the best tasks to do in available time.

### 2. Top 10 Notifications

```
GET /api/notifications/top-10?studentId=1042

Response: [
  {"rank": 1, "message": "...", "type": "Result", "priority": 13},
  ...
]
```

Returns 10 notifications ranked by priority. Placement > Result > Event. Unread gets +3 bonus.

---

## Author
Campus Hiring Backend Team

## License
MIT
