# Notification System

Simple notification system that ranks and shows top 10 notifications to students.

## How It Works

**Endpoint:** GET `/api/notifications/top-10?studentId=1042`

Returns 10 notifications ranked by:
1. Type (Placement = 8 points, Result = 10 points, Event = 3 points)
2. Read status (Unread gets +3 bonus)

**Example Response:**
```json
[
  {"rank": 1, "message": "Placement drive Friday", "type": "Placement", "priority": 11},
  {"rank": 2, "message": "Results posted", "type": "Result", "priority": 13},
  {"rank": 3, "message": "Tech talk today", "type": "Event", "priority": 6}
]
```

## Priority Calculation

- Placement messages: 8 points
- Result messages: 10 points  
- Event messages: 3 points
- Unread: +3 bonus
- Read: no bonus

Priority = Type Score + (3 if unread, 0 if read)

## Future Improvements

Could add:
- Database caching for faster loads
- Pagination for more notifications
- Email notifications to students
- Retry system for failed sends
| Result declared | Result | false | (10 × 1.0) + 3 | 13 |
| Workshop | Event | true | (3 × 1.0) + 0 | 3 |
| Interview | Placement | true | (8 × 1.0) + 0 | 8 |

---

## Implementation
See `notification_app_be/prioritizer.js` for implementation details.
