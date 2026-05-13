// ============================================================================
// PAID DIAGNOSTIC QUESTIONNAIRE - 30 QUESTIONS
// For AI Snapshot ($15) and AI System Blueprint ($99)
// ============================================================================

const PAID_DIAGNOSTIC_QUESTIONS = [
    // ========================================================================
    // SECTION 1: Business Goals & Context (5 questions)
    // ========================================================================
    {
        id: "business_goal_1",
        section: "Business Goals & Context",
        question: "What is your primary business objective for exploring AI?",
        type: "single-choice",
        options: [
            { value: "cost_reduction", label: "Reduce operational costs" },
            { value: "revenue_growth", label: "Increase revenue and sales" },
            { value: "customer_experience", label: "Improve customer experience" },
            { value: "innovation", label: "Drive innovation and competitive advantage" },
            { value: "efficiency", label: "Improve operational efficiency" }
        ]
    },
    {
        id: "business_goal_2",
        section: "Business Goals & Context",
        question: "What is your organization's annual revenue range?",
        type: "single-choice",
        options: [
            { value: "under_1m", label: "Under $1M" },
            { value: "1m_10m", label: "$1M - $10M" },
            { value: "10m_50m", label: "$10M - $50M" },
            { value: "50m_100m", label: "$50M - $100M" },
            { value: "over_100m", label: "Over $100M" }
        ]
    },
    {
        id: "business_goal_3",
        section: "Business Goals & Context",
        question: "Which industry best describes your organization?",
        type: "single-choice",
        options: [
            { value: "technology", label: "Technology / Software" },
            { value: "finance", label: "Finance / Banking" },
            { value: "healthcare", label: "Healthcare / Medical" },
            { value: "retail", label: "Retail / E-commerce" },
            { value: "manufacturing", label: "Manufacturing / Industrial" },
            { value: "services", label: "Professional Services" },
            { value: "other", label: "Other" }
        ]
    },
    {
        id: "business_goal_4",
        section: "Business Goals & Context",
        question: "What is your timeline for implementing AI solutions?",
        type: "single-choice",
        options: [
            { value: "immediate", label: "Immediate (0-3 months)" },
            { value: "short_term", label: "Short-term (3-6 months)" },
            { value: "medium_term", label: "Medium-term (6-12 months)" },
            { value: "long_term", label: "Long-term (12+ months)" },
            { value: "exploring", label: "Just exploring options" }
        ]
    },
    {
        id: "business_goal_5",
        section: "Business Goals & Context",
        question: "What is your expected ROI timeframe for AI investments?",
        type: "single-choice",
        options: [
            { value: "3_months", label: "Within 3 months" },
            { value: "6_months", label: "Within 6 months" },
            { value: "12_months", label: "Within 12 months" },
            { value: "18_months", label: "Within 18 months" },
            { value: "24_months_plus", label: "24+ months" }
        ]
    },

    // ========================================================================
    // SECTION 2: Processes & Operations (5 questions)
    // ========================================================================
    {
        id: "process_1",
        section: "Processes & Operations",
        question: "How would you describe your current business processes?",
        type: "single-choice",
        options: [
            { value: "manual", label: "Mostly manual and paper-based" },
            { value: "basic_digital", label: "Basic digital tools (spreadsheets, email)" },
            { value: "some_automation", label: "Some automation in place" },
            { value: "well_automated", label: "Well-automated with integrated systems" },
            { value: "fully_optimized", label: "Fully optimized and data-driven" }
        ]
    },
    {
        id: "process_2",
        section: "Processes & Operations",
        question: "Which business function has the most repetitive tasks?",
        type: "single-choice",
        options: [
            { value: "customer_service", label: "Customer Service / Support" },
            { value: "sales", label: "Sales / Lead Generation" },
            { value: "hr", label: "HR / Recruitment" },
            { value: "finance", label: "Finance / Accounting" },
            { value: "operations", label: "Operations / Supply Chain" },
            { value: "marketing", label: "Marketing / Content" }
        ]
    },
    {
        id: "process_3",
        section: "Processes & Operations",
        question: "How many hours per week are spent on repetitive manual tasks?",
        type: "single-choice",
        options: [
            { value: "under_10", label: "Under 10 hours" },
            { value: "10_25", label: "10-25 hours" },
            { value: "25_50", label: "25-50 hours" },
            { value: "50_100", label: "50-100 hours" },
            { value: "over_100", label: "Over 100 hours" }
        ]
    },
    {
        id: "process_4",
        section: "Processes & Operations",
        question: "Do you have documented standard operating procedures (SOPs)?",
        type: "single-choice",
        options: [
            { value: "none", label: "No documented procedures" },
            { value: "some", label: "Some key processes documented" },
            { value: "most", label: "Most processes documented" },
            { value: "all", label: "All processes well-documented" },
            { value: "optimized", label: "Documented and regularly optimized" }
        ]
    },
    {
        id: "process_5",
        section: "Processes & Operations",
        question: "How do you currently handle customer inquiries?",
        type: "single-choice",
        options: [
            { value: "manual_email", label: "Manual email responses" },
            { value: "ticketing", label: "Ticketing system" },
            { value: "basic_chatbot", label: "Basic chatbot + human handoff" },
            { value: "ai_assisted", label: "AI-assisted responses" },
            { value: "fully_automated", label: "Fully automated with AI" }
        ]
    },

    // ========================================================================
    // SECTION 3: Data & Technology Readiness (5 questions)
    // ========================================================================
    {
        id: "data_1",
        section: "Data & Technology Readiness",
        question: "Where is your business data currently stored?",
        type: "multiple-choice",
        options: [
            { value: "spreadsheets", label: "Spreadsheets (Excel, Google Sheets)" },
            { value: "local_files", label: "Local files and folders" },
            { value: "cloud_storage", label: "Cloud storage (Dropbox, Google Drive)" },
            { value: "databases", label: "Databases (SQL, NoSQL)" },
            { value: "crm", label: "CRM system (Salesforce, HubSpot)" },
            { value: "erp", label: "ERP system (SAP, Oracle)" }
        ]
    },
    {
        id: "data_2",
        section: "Data & Technology Readiness",
        question: "How would you rate your data quality?",
        type: "single-choice",
        options: [
            { value: "poor", label: "Poor - Inconsistent and incomplete" },
            { value: "fair", label: "Fair - Some gaps and inconsistencies" },
            { value: "good", label: "Good - Mostly accurate and complete" },
            { value: "very_good", label: "Very Good - High quality and well-maintained" },
            { value: "excellent", label: "Excellent - Enterprise-grade data governance" }
        ]
    },
    {
        id: "data_3",
        section: "Data & Technology Readiness",
        question: "Do you have APIs or integrations between your systems?",
        type: "single-choice",
        options: [
            { value: "none", label: "No integrations" },
            { value: "manual", label: "Manual data transfers only" },
            { value: "some_apis", label: "Some API integrations" },
            { value: "many_apis", label: "Many API integrations" },
            { value: "fully_integrated", label: "Fully integrated ecosystem" }
        ]
    },
    {
        id: "data_4",
        section: "Data & Technology Readiness",
        question: "What is your current cloud infrastructure setup?",
        type: "single-choice",
        options: [
            { value: "none", label: "No cloud infrastructure" },
            { value: "basic", label: "Basic cloud services (email, storage)" },
            { value: "moderate", label: "Moderate (some apps in cloud)" },
            { value: "advanced", label: "Advanced (most systems cloud-based)" },
            { value: "cloud_native", label: "Cloud-native architecture" }
        ]
    },
    {
        id: "data_5",
        section: "Data & Technology Readiness",
        question: "Do you have real-time data access and dashboards?",
        type: "single-choice",
        options: [
            { value: "none", label: "No dashboards or reporting" },
            { value: "manual_reports", label: "Manual reports generated periodically" },
            { value: "basic_dashboards", label: "Basic dashboards (weekly/monthly updates)" },
            { value: "real_time", label: "Real-time dashboards" },
            { value: "predictive", label: "Real-time + predictive analytics" }
        ]
    },

    // ========================================================================
    // SECTION 4: Team & Skills (5 questions)
    // ========================================================================
    {
        id: "team_1",
        section: "Team & Skills",
        question: "How many employees does your organization have?",
        type: "single-choice",
        options: [
            { value: "1_10", label: "1-10 employees" },
            { value: "11_50", label: "11-50 employees" },
            { value: "51_200", label: "51-200 employees" },
            { value: "201_500", label: "201-500 employees" },
            { value: "over_500", label: "Over 500 employees" }
        ]
    },
    {
        id: "team_2",
        section: "Team & Skills",
        question: "Do you have dedicated IT or technical staff?",
        type: "single-choice",
        options: [
            { value: "none", label: "No dedicated IT staff" },
            { value: "outsourced", label: "Outsourced IT support" },
            { value: "1_2", label: "1-2 IT staff members" },
            { value: "small_team", label: "Small IT team (3-5)" },
            { value: "full_department", label: "Full IT department (6+)" }
        ]
    },
    {
        id: "team_3",
        section: "Team & Skills",
        question: "Does your team have AI/ML expertise?",
        type: "single-choice",
        options: [
            { value: "none", label: "No AI/ML expertise" },
            { value: "basic_awareness", label: "Basic awareness only" },
            { value: "some_experience", label: "Some team members with experience" },
            { value: "dedicated_roles", label: "Dedicated AI/ML roles" },
            { value: "expert_team", label: "Expert AI/ML team" }
        ]
    },
    {
        id: "team_4",
        section: "Team & Skills",
        question: "How open is your team to adopting new technologies?",
        type: "single-choice",
        options: [
            { value: "resistant", label: "Resistant to change" },
            { value: "cautious", label: "Cautious but willing" },
            { value: "neutral", label: "Neutral / Mixed" },
            { value: "enthusiastic", label: "Enthusiastic and eager" },
            { value: "innovative", label: "Highly innovative culture" }
        ]
    },
    {
        id: "team_5",
        section: "Team & Skills",
        question: "What is your budget for AI initiatives in the next 12 months?",
        type: "single-choice",
        options: [
            { value: "under_10k", label: "Under $10,000" },
            { value: "10k_50k", label: "$10,000 - $50,000" },
            { value: "50k_100k", label: "$50,000 - $100,000" },
            { value: "100k_500k", label: "$100,000 - $500,000" },
            { value: "over_500k", label: "Over $500,000" }
        ]
    },

    // ========================================================================
    // SECTION 5: Pain Points & Opportunities (5 questions)
    // ========================================================================
    {
        id: "pain_1",
        section: "Pain Points & Opportunities",
        question: "What is your biggest operational challenge?",
        type: "single-choice",
        options: [
            { value: "slow_processes", label: "Slow manual processes" },
            { value: "high_costs", label: "High operational costs" },
            { value: "poor_customer_exp", label: "Poor customer experience" },
            { value: "data_silos", label: "Data silos and lack of insights" },
            { value: "scaling", label: "Difficulty scaling operations" },
            { value: "talent_shortage", label: "Talent shortage" }
        ]
    },
    {
        id: "pain_2",
        section: "Pain Points & Opportunities",
        question: "How much time is wasted on data entry and manual tasks?",
        type: "single-choice",
        options: [
            { value: "minimal", label: "Minimal (< 5% of time)" },
            { value: "some", label: "Some (5-15% of time)" },
            { value: "moderate", label: "Moderate (15-30% of time)" },
            { value: "significant", label: "Significant (30-50% of time)" },
            { value: "majority", label: "Majority (> 50% of time)" }
        ]
    },
    {
        id: "pain_3",
        section: "Pain Points & Opportunities",
        question: "What is your average customer response time?",
        type: "single-choice",
        options: [
            { value: "under_1h", label: "Under 1 hour" },
            { value: "1_4h", label: "1-4 hours" },
            { value: "4_24h", label: "4-24 hours" },
            { value: "1_3days", label: "1-3 days" },
            { value: "over_3days", label: "Over 3 days" }
        ]
    },
    {
        id: "pain_4",
        section: "Pain Points & Opportunities",
        question: "How do you currently identify business opportunities?",
        type: "single-choice",
        options: [
            { value: "intuition", label: "Intuition and experience" },
            { value: "basic_reports", label: "Basic reports and spreadsheets" },
            { value: "some_analytics", label: "Some analytics tools" },
            { value: "advanced_analytics", label: "Advanced analytics and BI" },
            { value: "ai_driven", label: "AI-driven insights" }
        ]
    },
    {
        id: "pain_5",
        section: "Pain Points & Opportunities",
        question: "What percentage of customer inquiries are repetitive?",
        type: "single-choice",
        options: [
            { value: "under_20", label: "Under 20%" },
            { value: "20_40", label: "20-40%" },
            { value: "40_60", label: "40-60%" },
            { value: "60_80", label: "60-80%" },
            { value: "over_80", label: "Over 80%" }
        ]
    },

    // ========================================================================
    // SECTION 6: AI Adoption & Culture (5 questions)
    // ========================================================================
    {
        id: "adoption_1",
        section: "AI Adoption & Culture",
        question: "Have you previously attempted to implement AI solutions?",
        type: "single-choice",
        options: [
            { value: "never", label: "Never attempted" },
            { value: "explored", label: "Explored but didn't implement" },
            { value: "pilot", label: "Ran a pilot project" },
            { value: "partial", label: "Partial implementation" },
            { value: "full", label: "Full implementation in production" }
        ]
    },
    {
        id: "adoption_2",
        section: "AI Adoption & Culture",
        question: "What is your biggest concern about AI adoption?",
        type: "single-choice",
        options: [
            { value: "cost", label: "Cost and ROI uncertainty" },
            { value: "complexity", label: "Technical complexity" },
            { value: "skills", label: "Lack of skills and expertise" },
            { value: "security", label: "Data security and privacy" },
            { value: "change_management", label: "Change management and adoption" },
            { value: "none", label: "No major concerns" }
        ]
    },
    {
        id: "adoption_3",
        section: "AI Adoption & Culture",
        question: "How does leadership view AI investments?",
        type: "single-choice",
        options: [
            { value: "skeptical", label: "Skeptical / Not a priority" },
            { value: "interested", label: "Interested but cautious" },
            { value: "supportive", label: "Supportive and engaged" },
            { value: "champion", label: "Actively championing AI" },
            { value: "strategic", label: "Core strategic priority" }
        ]
    },
    {
        id: "adoption_4",
        section: "AI Adoption & Culture",
        question: "Do you have a formal AI strategy or roadmap?",
        type: "single-choice",
        options: [
            { value: "none", label: "No strategy or roadmap" },
            { value: "informal", label: "Informal ideas and discussions" },
            { value: "draft", label: "Draft strategy in development" },
            { value: "approved", label: "Approved strategy and roadmap" },
            { value: "executing", label: "Actively executing roadmap" }
        ]
    },
    {
        id: "adoption_5",
        section: "AI Adoption & Culture",
        question: "How do you measure success for technology initiatives?",
        type: "single-choice",
        options: [
            { value: "no_metrics", label: "No formal metrics" },
            { value: "basic_metrics", label: "Basic metrics (usage, adoption)" },
            { value: "roi_focused", label: "ROI and cost savings" },
            { value: "comprehensive", label: "Comprehensive KPIs and dashboards" },
            { value: "data_driven", label: "Data-driven with continuous optimization" }
        ]
    }
];

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PAID_DIAGNOSTIC_QUESTIONS };
}
