# Backend API - Campus Hiring System

## Overview
This backend implements two core APIs for the Affordmed Campus Hiring System:
1. **Vehicle Maintenance Scheduler** - Optimizes maintenance tasks using Dynamic Programming
2. **Notification System** - Prioritizes and ranks student notifications

---

## Project Structure

```
backend/
├── logging_middleware/
│   └── logger.js                    # Logging middleware with Affordmed API integration
├── vehicle_maintence_scheduler/
│   └── optimizer.js                 # Vehicle maintenance optimization algorithm
├── notification_app_be/
│   └── prioritizer.js               # Notification prioritization logic
├── notification_system_design.md    # Notification system design documentation
├── server.js                        # Main Express server
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## Installation

```bash
# Install dependencies
npm install

# Dependencies: express, axios
```

---

## Running the Server

```bash
npm start
```

**Output:**
```
[INFO] [controller] Backend server initializing
✅ Server running on http://localhost:3000

Available endpoints:
  POST /api/vehicle-scheduling/optimize
  GET  /api/notifications/top-10?studentId=1042
```

---

## API Endpoints

### 1. Vehicle Maintenance Scheduler

**Endpoint:** `POST /api/vehicle-scheduling/optimize`

**Description:** Optimizes vehicle maintenance tasks using 0/1 Knapsack algorithm to maximize impact within available hours.

**Request Body:**
```json
{
  "depotId": 1,
  "availableHours": 10
}
```

**Response:**
```json
{
  "selectedTasks": [
    {
      "TaskID": "T001",
      "Duration": 3,
      "Impact": 50
    },
    {
      "TaskID": "T002",
      "Duration": 5,
      "Impact": 80
    }
  ],
  "totalImpact": 130,
  "totalHours": 8
}
```

**Algorithm:** Dynamic Programming (0/1 Knapsack)
- Maximizes impact (value) within available hours (capacity)
- Time Complexity: O(n × hours)
- Space Complexity: O(n × hours)

---

### 2. Notification Top 10

**Endpoint:** `GET /api/notifications/top-10?studentId=1042`

**Description:** Returns top 10 notifications prioritized by type and read status.

**Query Parameters:**
- `studentId` (required): Student ID

**Response:**
```json
[
  {
    "rank": 1,
    "message": "Result declared",
    "type": "Result",
    "priority": 13
  },
  {
    "rank": 2,
    "message": "Placement drive scheduled",
    "type": "Placement",
    "priority": 11
  },
  {
    "rank": 3,
    "message": "Campus event",
    "type": "Event",
    "priority": 6
  }
]
```

**Priority Calculation:**
- `priority = (typeScore × recency) + unreadBonus`
- Type Scores: Result(10), Placement(8), Event(3)
- Unread Bonus: +3 if unread, +0 if read

---

## Logging Middleware

All requests and operations are logged using the Affordmed logging middleware.

**Log Format:**
```
[LEVEL] [PACKAGE] Message
```

**Valid Packages:**
- `controller` - Request handlers
- `service` - Business logic
- `route` - Route handling
- `cache` - Cache operations
- `db` - Database operations
- `domain` - Domain logic
- `cron_job` - Scheduled jobs

**Log Levels:**
- `debug` - Debug information
- `info` - General information
- `warn` - Warnings
- `error` - Errors
- `fatal` - Fatal errors

---

## Testing with Postman

### Test 1: Vehicle Scheduler
```
POST http://localhost:3000/api/vehicle-scheduling/optimize

Body (JSON):
{
  "depotId": 1,
  "availableHours": 10
}
```

### Test 2: Notifications
```
GET http://localhost:3000/api/notifications/top-10?studentId=1042
```

---

## Dependencies

- **express** - Web framework
- **axios** - HTTP client for external API calls

---

## Configuration

- **Port:** 3000 (or `process.env.PORT`)
- **External APIs:**
  - Vehicles: `http://4.224.186.213/evaluation-service/vehicles`
  - Notifications: `http://4.224.186.213/evaluation-service/notifications`
  - Logs: `http://4.224.186.213/evaluation-service/logs`

---

## Author
Campus Hiring Backend Team

## License
MIT
