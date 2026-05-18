function calculatePriority(notifications) {
  const categoryScores = {
    'Result': 10,
    'Placement': 8,
    'Event': 3
  };

  const rankedNotifications = notifications.map(notification => {
    const categoryScore = (categoryScores[notification.Type] || 1) * 1.0;
    const readBonus = !notification.isRead ? 3 : 0;
    const finalPriority = categoryScore + readBonus;

    return {
      rank: 0,
      message: notification.Message,
      type: notification.Type,
      priority: parseFloat(finalPriority.toFixed(2))
    };
  });

  return rankedNotifications;
}

function getTopNotifications(notifications, topCount = 10) {
  const rankedNotifications = calculatePriority(notifications);
  
  const topTenList = rankedNotifications
    .sort((a, b) => b.priority - a.priority)
    .slice(0, topCount)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return topTenList;
}

module.exports = {
  calculatePriority,
  getTopNotifications
};
