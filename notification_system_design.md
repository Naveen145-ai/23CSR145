# Notification System Design

## Overview
The notification system prioritizes and ranks notifications for students based on type and read status.

---

## Stage 1: Data Collection
**Source:** External Notification API
- Collects all notifications from: `http://4.224.186.213/evaluation-service/notifications`
- Each notification contains: `{Message, Type, isRead}`
- Types: `Result`, `Placement`, `Event`

---

## Stage 2: Priority Calculation
**Formula:** `priority = (typeScore × recency) + unreadBonus`

### Type Weights:
| Type | Score |
|------|-------|
| Result | 10 |
| Placement | 8 |
| Event | 3 |

### Unread Bonus:
- If `isRead = false`: +3 points
- If `isRead = true`: +0 points

### Example:
```
Notification: "Placement drive scheduled" (Type: Placement, isRead: false)
priority = (8 × 1.0) + 3 = 11.0
```

---

## Stage 3: Sorting
Sort notifications by priority in **descending order**

---

## Stage 4: Ranking
Assign rank starting from 1 for highest priority

---

## Stage 5: Top N Selection
Select top 10 notifications (or specified limit)

---

## Stage 6: Response
Return array with: `{rank, message, type, priority}`

---

## API Endpoint

**GET** `/api/notifications/top-10?studentId=1042`

**Response:**
```json
[
  {
    "rank": 1,
    "message": "Placement drive scheduled",
    "type": "Placement",
    "priority": 11
  },
  {
    "rank": 2,
    "message": "Result declared",
    "type": "Result",
    "priority": 10
  }
]
```

---

## Priority Examples

| Message | Type | isRead | Calculation | Priority |
|---------|------|--------|-------------|----------|
| Placement drive | Placement | false | (8 × 1.0) + 3 | 11 |
| Result declared | Result | false | (10 × 1.0) + 3 | 13 |
| Workshop | Event | true | (3 × 1.0) + 0 | 3 |
| Interview | Placement | true | (8 × 1.0) + 0 | 8 |

---

## Implementation
See `notification_app_be/prioritizer.js` for implementation details.
