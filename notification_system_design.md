# Notification System Design

## Overview
The notification system prioritizes and ranks notifications for students based on type and read status.

---

## Stage 1: REST API Design

### Approach
Frontend developer has asked for REST API endpoints to display notifications to users. We need to design clear, consistent endpoints using predictable naming conventions.

### Endpoints Designed

**GET** `/api/notifications/top-10?studentId={studentId}`
- Retrieve top 10 prioritized notifications for a student
- Query Parameters: `studentId` (required)
- Response: Array of notifications ranked by priority
- Status: 200 OK

**GET** `/api/notifications?studentId={studentId}&limit=20`
- Retrieve notifications with custom limit
- Query Parameters: `studentId` (required), `limit` (optional, default 10)
- Response: Array of notifications

**GET** `/api/notifications/by-type?studentId={studentId}&type=Placement`
- Filter notifications by type (Result, Placement, Event)
- Query Parameters: `studentId` (required), `type` (required)

### JSON Schema
```json
{
  "rank": 1,
  "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
  "message": "Placement drive scheduled",
  "type": "Placement",
  "priority": 11,
  "timestamp": "2026-04-22 17:51:30"
}
```

---

## Stage 2: Database Schema Design

### Choice: PostgreSQL (Relational Database)

### Why PostgreSQL?
- Structured data (notifications have defined fields)
- ACID compliance for data integrity
- Excellent for complex queries with JOINs
- Scales well for read-heavy operations
- Native JSON support for flexible fields

### Schema

**Table: notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  studentID INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_studentID (studentID),
  INDEX idx_type (type),
  INDEX idx_isRead (isRead),
  INDEX idx_studentID_isRead (studentID, isRead)
);

CREATE TABLE notificationPriority (
  id UUID PRIMARY KEY,
  notificationID UUID UNIQUE REFERENCES notifications(id),
  typeWeight INT,
  unreadBonus INT,
  priority DECIMAL(5,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Performance Concerns with Growth
- **50,000 students × 5,000,000 notifications**
- Without indexes: O(n) scans = millions of rows scanned per query
- **Solution:** Add composite indexes on frequently queried columns

### Index Strategy
```sql
-- Primary lookup index
CREATE INDEX idx_notifications_studentID_createdAt 
ON notifications(studentID, createdAt DESC);

-- Unread notifications index
CREATE INDEX idx_notifications_studentID_isRead 
ON notifications(studentID, isRead, createdAt DESC);

-- Type filtering index
CREATE INDEX idx_notifications_type_studentID 
ON notifications(type, studentID);
```

---

## Stage 3: Query Optimization

### Original Slow Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

**Problem:** Scans 50,000+ rows for each student to find ~100 unread

### Optimized Query with Indexes
```sql
SELECT id, message, type, isRead, timestamp
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 100;
```

**Improvement:** Uses `idx_notifications_studentID_isRead` index
- Estimated: 100x faster
- From 50,000 row scans → Direct index lookup + sort

### Query for Last 7 Days Placements
```sql
SELECT id, message, type, timestamp
FROM notifications
WHERE studentID = 1042 
  AND type = 'Placement'
  AND createdAt >= NOW() - INTERVAL '7 days'
ORDER BY createdAt DESC;
```

### Add Indexes Advice
**Is adding indexes on every column safe?** 
- ✅ YES for columns frequently filtered/sorted
- ❌ NO for rarely used columns (wastes storage)
- ✅ Composite indexes better than individual

---

## Stage 4: Performance Optimization Strategy

### Problem
Notifications fetched on every page load → Bad UX (slow page loads)
Database overwhelmed with concurrent queries

### Solutions Proposed

**1. Caching Strategy**
- Cache top 10 for each student (Redis)
- TTL: 5 minutes
- Invalidate on new notification
- Reduces DB hits by 95%

**2. Pagination**
- Load 20 per page instead of all
- User scrolls → fetch next 20
- Reduces memory usage and network

**3. Async Processing**
- Don't fetch all notifications on page load
- Load top 10 immediately
- Fetch rest in background
- Better perceived performance

**4. Read Replicas**
- Primary DB for writes
- Read replicas for notification queries
- Distribute read load across multiple servers
- Scale horizontally

### Recommended Approach
**Combine all 4:**
- Cache + Async + Pagination + Read Replicas = Best performance

---

## Stage 5: Bulk Notification Broadcast

### Problem
Send notifications to 50,000 students simultaneously

### Pseudocode
```pseudocode
function notify_all(student_ids: array, message: string):
  failed_emails = []
  failed_db = []
  
  for each batch of 1000 student_ids:
    // Parallel execution for speed
    email_results = send_email_batch(batch, message)
    db_results = save_to_db_batch(batch, message)
    
    // Track failures
    failed_emails += email_results.failures
    failed_db += db_results.failures
  
  // Retry failed operations
  if failed_emails.length > 0:
    retry_email_batch(failed_emails, message)
  
  if failed_db.length > 0:
    retry_db_batch(failed_db, message)
  
  return {
    successful: 50000 - failed_emails.length,
    failed: failed_emails.length
  }
```

### Implementation Issues

**Original Problem:** Sequential processing
- Send email → Save to DB → Send next
- Time: 50,000 × 2 operations = Slow

**What went wrong?**
- 200 emails failed midway
- Process stopped, leaving 49,800 students without notification
- No retry mechanism

### Redesigned Solution

1. **Batch Processing:** Process 1,000 at a time
2. **Parallel Execution:** Email + DB save in parallel
3. **Error Tracking:** Log all failures
4. **Retry Logic:** Automatically retry failed operations
5. **Monitoring:** Track success/failure metrics

### Code Implementation
```javascript
async function notifyAll(studentIds, message) {
  const BATCH_SIZE = 1000;
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
    const batch = studentIds.slice(i, i + BATCH_SIZE);
    
    // Parallel: send email AND save to DB simultaneously
    const [emailResults, dbResults] = await Promise.all([
      sendEmailBatch(batch, message),
      saveToDBBatch(batch, message)
    ]);
    
    totalSuccess += emailResults.success;
    totalFailed += emailResults.failed;
  }
  
  return { totalSuccess, totalFailed };
}
```

### Performance
- Sequential: ~5-10 hours
- Parallel batching: ~30 minutes
- **Speedup: 10-20x faster**

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
