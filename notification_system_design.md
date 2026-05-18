# System Design

What I built and how it works.

## Notification API

The notification system shows students their 10 most important notifications.

## How I Built It

1. Created an endpoint: GET `/api/notifications/top-10?studentId=1042`
2. Added logic to rank notifications by type and read status
3. Return top 10 ranked by priority

## Priority Logic

I decided:
- Placement news: 8 points (important for job search)
- Result news: 10 points (most important - grades)
- Event news: 3 points (less important)
- Unread messages: +3 bonus
- Read messages: no bonus

So unread result = 10 + 3 = 13 (highest priority)

## Example

Request: `GET /api/notifications/top-10?studentId=1042`

Response shows:
```
Rank 1: "Result posted" (Result, unread) = 13
Rank 2: "Job fair Friday" (Placement, unread) = 11  
Rank 3: "Tech talk" (Event, read) = 3
...
```

## Vehicle Scheduler

Similar approach - picks best maintenance tasks within time available.

Uses optimization algorithm to maximize work done in available hours.

## Code Files

- `prioritizer.js` - Ranks notifications
- `optimizer.js` - Picks best tasks
- `logger.js` - Logs all activities
- `server.js` - Main API server
