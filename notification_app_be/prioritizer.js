/**
 * Notification Prioritizer - Calculates priority for notifications
 * Priority = (typeScore × recency) + unreadBonus
 */

/**
 * Calculate priority for notifications
 * @param {Array} notifications - List of notifications
 * @returns {Array} Notifications with priority and rank
 */
function calculatePriority(notifications) {
  const typeWeights = {
    'Result': 10,
    'Placement': 8,
    'Event': 3
  };

  // Add priority to each notification
  const withPriority = notifications.map(n => {
    const typeScore = (typeWeights[n.Type] || 1) * 1.0; // recency = 1.0
    const unreadBonus = !n.isRead ? 3 : 0;
    const priority = typeScore + unreadBonus;

    return {
      rank: 0,
      message: n.Message,
      type: n.Type,
      priority: parseFloat(priority.toFixed(2))
    };
  });

  return withPriority;
}

/**
 * Get top N notifications by priority
 * @param {Array} notifications - List of notifications
 * @param {number} topCount - Number of top notifications to return (default 10)
 * @returns {Array} Top N notifications with rank
 */
function getTopNotifications(notifications, topCount = 10) {
  const withPriority = calculatePriority(notifications);
  
  // Sort by priority descending and get top N
  const topN = withPriority
    .sort((a, b) => b.priority - a.priority)
    .slice(0, topCount)
    .map((n, i) => ({ ...n, rank: i + 1 }));

  return topN;
}

module.exports = {
  calculatePriority,
  getTopNotifications
};
