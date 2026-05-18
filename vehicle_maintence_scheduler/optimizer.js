function optimizeTasks(tasks, availableHours) {
  if (!tasks || tasks.length === 0) {
    return { selectedTasks: [], totalImpact: 0, totalHours: 0 };
  }

  const taskCount = tasks.length;
  const maxCapacity = Math.floor(availableHours);
  
  const matrix = Array(taskCount + 1).fill(null).map(() => Array(maxCapacity + 1).fill(0));

  for (let row = 1; row <= taskCount; row++) {
    const currentTask = tasks[row - 1];
    const taskDuration = currentTask.Duration;
    const taskImpact = currentTask.Impact;

    for (let col = 0; col <= maxCapacity; col++) {
      matrix[row][col] = matrix[row - 1][col];
      if (taskDuration <= col) {
        matrix[row][col] = Math.max(matrix[row][col], matrix[row - 1][col - taskDuration] + taskImpact);
      }
    }
  }

  const selectedTasks = [];
  let remainingCapacity = maxCapacity;
  for (let row = taskCount; row > 0 && remainingCapacity > 0; row--) {
    if (matrix[row][remainingCapacity] !== matrix[row - 1][remainingCapacity]) {
      const currentTask = tasks[row - 1];
      selectedTasks.push({
        TaskID: currentTask.TaskID,
        Duration: currentTask.Duration,
        Impact: currentTask.Impact
      });
      remainingCapacity -= currentTask.Duration;
    }
  }

  return {
    selectedTasks: selectedTasks,
    totalImpact: matrix[taskCount][maxCapacity],
    totalHours: availableHours - remainingCapacity
  };
}

module.exports = {
  optimizeTasks
};
