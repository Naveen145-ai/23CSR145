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

## Registration & Authentication

### 1. Register with Affordmed

Send student details to register:

```
POST http://4.224.186.213/evaluation-service/register

Body:
{
  "email": "naveensrinivas145@gmail.com",
  "rollNo": "23CSR145",
  "name": "Naveen",
  "mobileNo": "6379453853",
  "githubUsername": "Naveen145-ai",
  "accessCode": "RyZBcy"
}

Response (200 OK):
{
  "clientID": "b0b55d5f-8f16-40e2-a536-d4d80cedfb54",
  "clientSecret": "XRUPAfbgZXhYNjZC"
}
```

Save the `clientID` and `clientSecret` for next step.

### 2. Get Authorization Token

Use the credentials from registration to get token:

```
POST http://4.224.186.213/evaluation-service/auth

Body:
{
  "clientID": "b0b55d5f-8f16-40e2-a536-d4d80cedfb54",
  "clientSecret": "XRUPAfbgZXhYNjZC",
  "name": "Naveen"
}

Response (200 OK):
{
  "token": "your-auth-token-here",
  "expiresIn": 3600
}
```

Use this token for API calls requiring authentication.

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
