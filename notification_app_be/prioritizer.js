function calculatePriority(notifications) {
  const typeWeights = {
    'Result': 10,
    'Placement': 8,
    'Event': 3
  };

  const withPriority = notifications.map(n => {
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

  return withPriority;
}

function getTopNotifications(notifications, topCount = 10) {
  const withPriority = calculatePriority(notifications);
  
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
