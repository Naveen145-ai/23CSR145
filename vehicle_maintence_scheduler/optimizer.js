function optimizeTasks(tasks, availableHours) {
  if (!tasks || tasks.length === 0) {
    return { selectedTasks: [], totalImpact: 0, totalHours: 0 };
  }

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
      selectedTasks.push({
        TaskID: task.TaskID,
        Duration: task.Duration,
        Impact: task.Impact
      });
      w -= task.Duration;
    }
  }

  return {
    selectedTasks: selectedTasks,
    totalImpact: dp[n][capacity],
    totalHours: availableHours - w
  };
}

module.exports = {
  optimizeTasks
};
