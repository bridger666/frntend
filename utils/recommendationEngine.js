export function getUpgradeRecommendation(data) {
    if (data.score < 40) return "snapshot";
    if (data.orgSize === "enterprise") return "enterprise";
    if (data.automationPotential > 70) return "acceleration";
    if (data.score > 70) return "acceleration";
    return "deep";
}

export function getRecommendationDetails(tier, score) {
    const recommendations = {
        snapshot: {
            title: "AI Snapshot",
            price: "$49",
            reason: `Your score of ${Math.round(score)} indicates you need quick clarity on AI readiness. Get actionable insights in 24 hours.`,
            cta: "Get AI Snapshot"
        },
        deep: {
            title: "AI Deep Diagnostic",
            price: "$149",
            reason: `Your score of ${Math.round(score)} shows potential. A deep diagnostic will map specific opportunities across your organization.`,
            cta: "Run Deep Diagnostic"
        },
        acceleration: {
            title: "Acceleration Plan",
            price: "$500/month",
            reason: `Your score of ${Math.round(score)} shows strong readiness. Accelerate your AI transformation with ongoing optimization and strategy.`,
            cta: "Upgrade to Acceleration"
        },
        enterprise: {
            title: "Enterprise AI Audit",
            price: "Starting $5,000",
            reason: "Your organization needs a comprehensive transformation blueprint with executive roadmap and change strategy.",
            cta: "Request Enterprise Audit"
        }
    };
    return recommendations[tier];
}
