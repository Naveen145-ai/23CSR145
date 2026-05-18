
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
    
    logger.info('controller', `Optimizing location ${depotId}`);

    const vehicles = [
      {
        DepotID: 1,
        Tasks: [
          { TaskID: 'OIL_CHANGE', Duration: 3, Impact: 50 },
          { TaskID: 'BRAKE_SERVICE', Duration: 5, Impact: 80 },
          { TaskID: 'FILTER_REPLACE', Duration: 2, Impact: 30 }
        ]
      },
      {
        DepotID: 2,
        Tasks: [
          { TaskID: 'TIRE_ROTATION', Duration: 4, Impact: 60 },
          { TaskID: 'ENGINE_CHECK', Duration: 6, Impact: 100 }
        ]
      }
    ];

    logger.info('service', `Fetched ${vehicles.length} vehicles`);

    const tasks = vehicles
      .filter(v => v.DepotID === depotId)
      .flatMap(v => v.Tasks || []);

    if (tasks.length === 0) {
      logger.warn('route', `No tasks found at location ${depotId}`);
      return res.json({ selectedTasks: [], totalImpact: 0, totalHours: 0 });
    }

    logger.info('service', `Found ${tasks.length} maintenance tasks`);

    const taskCount = tasks.length;
    const maxCapacity = Math.floor(availableHours);
    const matrix = Array(taskCount + 1).fill(null).map(() => Array(maxCapacity + 1).fill(0));

    for (let row = 1; row <= taskCount; row++) {
      const task = tasks[row - 1];
      const duration = task.Duration;
      const impact = task.Impact;

      for (let col = 0; col <= maxCapacity; col++) {
        matrix[row][col] = matrix[row - 1][col];
        if (duration <= col) {
          matrix[row][col] = Math.max(matrix[row][col], matrix[row - 1][col - duration] + impact);
        }
      }
    }

    const selectedTasks = [];
    let remainingCapacity = maxCapacity;
    for (let row = taskCount; row > 0 && remainingCapacity > 0; row--) {
      if (matrix[row][remainingCapacity] !== matrix[row - 1][remainingCapacity]) {
        const task = tasks[row - 1];
        selectedTasks.push({ TaskID: task.TaskID, Duration: task.Duration, Impact: task.Impact });
        remainingCapacity -= task.Duration;
      }
    }

    const response = {
      selectedTasks,
      totalImpact: matrix[taskCount][maxCapacity],
      totalHours: availableHours - remainingCapacity
    };

    logger.info('service', `Scheduled ${selectedTasks.length} tasks successfully`);

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
      { Message: 'Job fair this Friday', Type: 'Placement', isRead: false },
      { Message: 'Semester marks uploaded', Type: 'Result', isRead: false },
      { Message: 'Tech talk at 3pm', Type: 'Event', isRead: true },
      { Message: 'Company interview call', Type: 'Placement', isRead: false },
      { Message: 'Transcript ready', Type: 'Result', isRead: true },
      { Message: 'Coding competition open', Type: 'Event', isRead: false },
      { Message: 'Selected for offer', Type: 'Placement', isRead: true },
      { Message: 'Grade appeal processed', Type: 'Result', isRead: false },
      { Message: 'Guest speaker visit', Type: 'Event', isRead: false },
      { Message: 'Internship at Google', Type: 'Placement', isRead: false },
      { Message: 'Final exams schedule', Type: 'Result', isRead: false },
      { Message: 'Hackfest signup live', Type: 'Event', isRead: true }
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