
const express = require('express');
const axios = require('axios');
const logger = require('./logging_middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger.expressMiddleware());

logger.info('controller', 'Backend server initializing');

app.post('/api/vehicle-scheduling/optimize', async (req, res) => {
  try {
    const { depotId, availableHours } = req.body;
    
    logger.info('controller', `Optimizing depot ${depotId}`);

    const vehicles = [
      {
        DepotID: 1,
        Tasks: [
          { TaskID: 'T001', Duration: 3, Impact: 50 },
          { TaskID: 'T002', Duration: 5, Impact: 80 },
          { TaskID: 'T003', Duration: 2, Impact: 30 }
        ]
      },
      {
        DepotID: 2,
        Tasks: [
          { TaskID: 'T004', Duration: 4, Impact: 60 },
          { TaskID: 'T005', Duration: 6, Impact: 100 }
        ]
      }
    ];

    logger.info('service', `Fetched ${vehicles.length} vehicles`);

    const tasks = vehicles
      .filter(v => v.DepotID === depotId)
      .flatMap(v => v.Tasks || []);

    if (tasks.length === 0) {
      logger.warn('route', `No tasks found for depot ${depotId}`);
      return res.json({ selectedTasks: [], totalImpact: 0, totalHours: 0 });
    }

    logger.info('service', `Found ${tasks.length} tasks`);

    const n = tasks.length;
    const capacity = Math.floor(availableHours);
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const task = tasks[i - 1];
      const duration = task.Duration;
      const impact = task.Impact;

      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i - 1][w];
        if (duration <= w) {
          dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - duration] + impact);
        }
      }
    }

    const selectedTasks = [];
    let w = capacity;
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        const task = tasks[i - 1];
        selectedTasks.push({ TaskID: task.TaskID, Duration: task.Duration, Impact: task.Impact });
        w -= task.Duration;
      }
    }

    const response = {
      selectedTasks,
      totalImpact: dp[n][capacity],
      totalHours: availableHours - w
    };

    logger.info('service', `Optimization complete: ${selectedTasks.length} tasks selected`);

    res.json(response);

  } catch (error) {
    logger.error('route', `Error in optimization: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/top-10', async (req, res) => {
  try {
    const { studentId } = req.query;

    logger.info('controller', `Fetching top 10 for student ${studentId}`);

    if (!studentId) {
      logger.error('route', 'studentId parameter missing');
      return res.status(400).json({ error: 'studentId required' });
    }

    const allNotifications = [
      { Message: 'Placement drive scheduled', Type: 'Placement', isRead: false },
      { Message: 'Result declared', Type: 'Result', isRead: false },
      { Message: 'Campus event', Type: 'Event', isRead: true },
      { Message: 'Interview scheduled', Type: 'Placement', isRead: false },
      { Message: 'Mark sheet available', Type: 'Result', isRead: true },
      { Message: 'Workshop registration open', Type: 'Event', isRead: false },
      { Message: 'Final placement list', Type: 'Placement', isRead: true },
      { Message: 'Grade correction submitted', Type: 'Result', isRead: false },
      { Message: 'Seminar alert', Type: 'Event', isRead: false },
      { Message: 'Internship opportunity', Type: 'Placement', isRead: false },
      { Message: 'Exam schedule released', Type: 'Result', isRead: false },
      { Message: 'Hackathon registration', Type: 'Event', isRead: true }
    ];

    logger.info('service', `Retrieved ${allNotifications.length} notifications`);

    const withPriority = allNotifications.map(n => {
      const typeWeights = { 'Result': 10, 'Placement': 8, 'Event': 3 };
      const typeScore = (typeWeights[n.Type] || 1) * 1.0;
      const unreadBonus = !n.isRead ? 3 : 0;
      const priority = typeScore + unreadBonus;

      return {
        rank: 0,
        message: n.Message,
        type: n.Type,
        priority: parseFloat(priority.toFixed(2))
      };
    });

    const topTen = withPriority
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10)
      .map((n, i) => ({ ...n, rank: i + 1 }));

    logger.info('service', `Top 10 prepared: ${topTen.length} notifications`);

    res.json(topTen);

  } catch (error) {
    logger.error('route', `Error fetching top 10: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  logger.error('route', err.message);
  res.status(500).json({ error: err.message });
});

app.use((req, res) => {
  logger.warn('route', `${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info('controller', `Backend server started on port ${PORT}`);
  console.log(`\n✅ Server running on http://localhost:${PORT}\n`);
  console.log('Available endpoints:');
  console.log('  POST /api/vehicle-scheduling/optimize');
  console.log('  GET  /api/notifications/top-10?studentId=1042\n');
});

module.exports = app;