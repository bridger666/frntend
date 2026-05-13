/**
 * AIVORY INTELLIGENCE ENGINE V2
 * 30-Question Structured Snapshot Diagnostic
 * 
 * Structure:
 * - Section A: Business Objective (5 questions)
 * - Section B: Workflow Maturity (8 questions, 0-4 scale)
 * - Section C: Data Infrastructure (7 questions, 0-4 scale)
 * - Section D: Automation Exposure (5 questions, 0-4 scale)
 * - Section E: Organizational Readiness (5 questions, 0-4 scale)
 * 
 * Only Q6-Q30 contribute to readiness score (25 questions × 4 = 100 max)
 */

const SNAPSHOT_DIAGNOSTIC_QUESTIONS = [
    // ========================================================================
    // SECTION A: BUSINESS OBJECTIVE (5 questions)
    // ========================================================================
    {
        id: "primary_objective",
        category: "Business Objective",
        question: "What is your primary business objective for AI?",
        options: [
            "Increase Revenue",
            "Improve Efficiency",
            "Reduce Costs",
            "Improve Response Times",
            "Scale Without Hiring",
            "Improve Decision Speed",
            "Improve Data Visibility",
            "Exploratory / Not Sure"
        ],
        enum_values: [
            "increase_revenue",
            "improve_efficiency",
            "reduce_cost",
            "improve_response_time",
            "scale_without_hiring",
            "improve_decision_speed",
            "improve_data_visibility",
            "exploratory"
        ]
    },
    {
        id: "secondary_objective",
        category: "Business Objective",
        question: "What is your secondary objective? (Optional)",
        options: [
            "None / Not Applicable",
            "Increase Revenue",
            "Improve Efficiency",
            "Reduce Costs",
            "Improve Response Times",
            "Scale Without Hiring",
            "Improve Decision Speed",
            "Improve Data Visibility"
        ],
        enum_values: [
            "none",
            "increase_revenue",
            "improve_efficiency",
            "reduce_cost",
            "improve_response_time",
            "scale_without_hiring",
            "improve_decision_speed",
            "improve_data_visibility"
        ]
    },
    {
        id: "target_department",
        category: "Business Objective",
        question: "Which department will benefit most?",
        options: [
            "Sales",
            "Marketing",
            "Operations",
            "Finance",
            "Customer Support",
            "Executive / Leadership",
            "Cross-Functional / Multiple"
        ],
        enum_values: [
            "sales",
            "marketing",
            "operations",
            "finance",
            "support",
            "executive",
            "cross_functional"
        ]
    },
    {
        id: "timeline",
        category: "Business Objective",
        question: "What is your implementation timeline?",
        options: [
            "30 days or less",
            "60 days",
            "90+ days",
            "Flexible / No rush"
        ],
        enum_values: [
            "30_days",
            "60_days",
            "90_plus",
            "flexible"
        ]
    },
    {
        id: "success_metric",
        category: "Business Objective",
        question: "How will you measure success?",
        options: [
            "Revenue Growth",
            "Cost Reduction",
            "Time Saved",
            "KPI Visibility",
            "Customer Satisfaction (CSAT)",
            "Not Yet Defined"
        ],
        enum_values: [
            "revenue_growth",
            "cost_reduction",
            "time_saved",
            "kpi_visibility",
            "csat",
            "undefined"
        ]
    },

    // ========================================================================
    // SECTION B: WORKFLOW MATURITY (8 questions, 0-4 scale)
    // ========================================================================
    {
        id: "workflows_documented",
        category: "Workflow Maturity",
        question: "Are your workflows documented?",
        options: [
            "0 - No documentation exists",
            "1 - Minimal / tribal knowledge only",
            "2 - Some key processes documented",
            "3 - Most processes documented",
            "4 - Comprehensive documentation"
        ],
        scale: true
    },
    {
        id: "manual_tasks_percentage",
        category: "Workflow Maturity",
        question: "What percentage of tasks are manual?",
        options: [
            "0 - Fully automated (0-10%)",
            "1 - Mostly automated (10-30%)",
            "2 - Half manual (30-50%)",
            "3 - Mostly manual (50-80%)",
            "4 - Fully manual (80-100%)"
        ],
        scale: true,
        reverse_score: true // Higher manual = lower maturity
    },
    {
        id: "sop_standardization",
        category: "Workflow Maturity",
        question: "How standardized are your SOPs?",
        options: [
            "0 - No SOPs exist",
            "1 - Ad-hoc / inconsistent",
            "2 - Some standardization",
            "3 - Mostly standardized",
            "4 - Fully standardized across teams"
        ],
        scale: true
    },
    {
        id: "bottlenecks_frequency",
        category: "Workflow Maturity",
        question: "How often do bottlenecks occur?",
        options: [
            "0 - Constantly / daily",
            "1 - Multiple times per week",
            "2 - Weekly",
            "3 - Occasionally / monthly",
            "4 - Rarely / never"
        ],
        scale: true,
        reverse_score: true
    },
    {
        id: "escalation_clarity",
        category: "Workflow Maturity",
        question: "How clear are escalation paths?",
        options: [
            "0 - No defined escalation",
            "1 - Unclear / ad-hoc",
            "2 - Somewhat defined",
            "3 - Mostly clear",
            "4 - Crystal clear / documented"
        ],
        scale: true
    },
    {
        id: "cross_team_visibility",
        category: "Workflow Maturity",
        question: "How visible are workflows across teams?",
        options: [
            "0 - No visibility / siloed",
            "1 - Minimal visibility",
            "2 - Some visibility",
            "3 - Good visibility",
            "4 - Full transparency"
        ],
        scale: true
    },
    {
        id: "cycle_time_tracking",
        category: "Workflow Maturity",
        question: "Do you track cycle times?",
        options: [
            "0 - No tracking",
            "1 - Manual / inconsistent tracking",
            "2 - Some automated tracking",
            "3 - Mostly automated tracking",
            "4 - Real-time automated tracking"
        ],
        scale: true
    },
    {
        id: "output_quality_measurement",
        category: "Workflow Maturity",
        question: "How do you measure output quality?",
        options: [
            "0 - No measurement",
            "1 - Subjective / ad-hoc",
            "2 - Some metrics defined",
            "3 - Clear metrics tracked",
            "4 - Automated quality monitoring"
        ],
        scale: true
    },

    // ========================================================================
    // SECTION C: DATA INFRASTRUCTURE (7 questions, 0-4 scale)
    // ========================================================================
    {
        id: "data_centralized",
        category: "Data Infrastructure",
        question: "Is your data centralized?",
        options: [
            "0 - Completely siloed / scattered",
            "1 - Mostly siloed",
            "2 - Partially centralized",
            "3 - Mostly centralized",
            "4 - Fully centralized / single source"
        ],
        scale: true
    },
    {
        id: "crm_usage_maturity",
        category: "Data Infrastructure",
        question: "How mature is your CRM usage?",
        options: [
            "0 - No CRM",
            "1 - Basic CRM / underutilized",
            "2 - Moderate usage",
            "3 - Well-utilized",
            "4 - Fully integrated / optimized"
        ],
        scale: true
    },
    {
        id: "api_accessibility",
        category: "Data Infrastructure",
        question: "How accessible is your data via APIs?",
        options: [
            "0 - No API access",
            "1 - Limited / manual exports only",
            "2 - Some APIs available",
            "3 - Most systems have APIs",
            "4 - Full API coverage"
        ],
        scale: true
    },
    {
        id: "dashboard_maturity",
        category: "Data Infrastructure",
        question: "How mature are your dashboards?",
        options: [
            "0 - No dashboards",
            "1 - Basic / static reports",
            "2 - Some interactive dashboards",
            "3 - Real-time dashboards",
            "4 - AI-powered predictive dashboards"
        ],
        scale: true
    },
    {
        id: "data_accuracy_confidence",
        category: "Data Infrastructure",
        question: "How confident are you in data accuracy?",
        options: [
            "0 - Very low confidence",
            "1 - Low confidence",
            "2 - Moderate confidence",
            "3 - High confidence",
            "4 - Very high confidence"
        ],
        scale: true
    },
    {
        id: "data_ownership_clarity",
        category: "Data Infrastructure",
        question: "How clear is data ownership?",
        options: [
            "0 - No ownership defined",
            "1 - Unclear / disputed",
            "2 - Somewhat defined",
            "3 - Mostly clear",
            "4 - Crystal clear / documented"
        ],
        scale: true
    },
    {
        id: "historical_data_volume",
        category: "Data Infrastructure",
        question: "How much historical data do you have?",
        options: [
            "0 - No historical data",
            "1 - Less than 3 months",
            "2 - 3-12 months",
            "3 - 1-3 years",
            "4 - 3+ years"
        ],
        scale: true
    },

    // ========================================================================
    // SECTION D: AUTOMATION EXPOSURE (5 questions, 0-4 scale)
    // ========================================================================
    {
        id: "existing_automation_tools",
        category: "Automation Exposure",
        question: "What automation tools do you currently use?",
        options: [
            "0 - No automation tools",
            "1 - Basic tools (email, calendar)",
            "2 - Some workflow automation",
            "3 - Multiple automation tools",
            "4 - Advanced automation platform"
        ],
        scale: true
    },
    {
        id: "tool_integrations_maturity",
        category: "Automation Exposure",
        question: "How integrated are your tools?",
        options: [
            "0 - No integrations / disconnected",
            "1 - Minimal integrations",
            "2 - Some key integrations",
            "3 - Most tools integrated",
            "4 - Fully integrated ecosystem"
        ],
        scale: true
    },
    {
        id: "manual_repetitive_tasks",
        category: "Automation Exposure",
        question: "How frequent are manual repetitive tasks?",
        options: [
            "0 - Constantly / all day",
            "1 - Multiple times daily",
            "2 - Daily",
            "3 - Weekly",
            "4 - Rarely / automated"
        ],
        scale: true,
        reverse_score: true
    },
    {
        id: "ticket_lead_volume",
        category: "Automation Exposure",
        question: "What is your ticket/lead volume scale?",
        options: [
            "0 - Very low (< 10/day)",
            "1 - Low (10-50/day)",
            "2 - Moderate (50-200/day)",
            "3 - High (200-1000/day)",
            "4 - Very high (1000+/day)"
        ],
        scale: true
    },
    {
        id: "process_duplication",
        category: "Automation Exposure",
        question: "How often do you duplicate processes?",
        options: [
            "0 - Constantly / every task",
            "1 - Very frequently",
            "2 - Sometimes",
            "3 - Rarely",
            "4 - Never / fully reusable"
        ],
        scale: true,
        reverse_score: true
    },

    // ========================================================================
    // SECTION E: ORGANIZATIONAL READINESS (5 questions, 0-4 scale)
    // ========================================================================
    {
        id: "leadership_ai_support",
        category: "Organizational Readiness",
        question: "How supportive is leadership of AI?",
        options: [
            "0 - Resistant / opposed",
            "1 - Skeptical / cautious",
            "2 - Neutral / open",
            "3 - Supportive",
            "4 - Championing / driving"
        ],
        scale: true
    },
    {
        id: "ai_literacy_level",
        category: "Organizational Readiness",
        question: "What is your team's AI literacy level?",
        options: [
            "0 - No AI knowledge",
            "1 - Minimal awareness",
            "2 - Basic understanding",
            "3 - Good understanding",
            "4 - Advanced / expert"
        ],
        scale: true
    },
    {
        id: "budget_allocated",
        category: "Organizational Readiness",
        question: "Is budget allocated for AI?",
        options: [
            "0 - No budget / unfunded",
            "1 - Exploring budget",
            "2 - Small budget allocated",
            "3 - Significant budget allocated",
            "4 - Dedicated AI budget line"
        ],
        scale: true
    },
    {
        id: "change_resistance",
        category: "Organizational Readiness",
        question: "How resistant is your team to change?",
        options: [
            "0 - Highly resistant",
            "1 - Somewhat resistant",
            "2 - Neutral",
            "3 - Open to change",
            "4 - Embracing change"
        ],
        scale: true,
        reverse_score: true
    },
    {
        id: "dedicated_system_owner",
        category: "Organizational Readiness",
        question: "Do you have a dedicated system owner?",
        options: [
            "0 - No owner identified",
            "1 - Unclear ownership",
            "2 - Part-time owner",
            "3 - Dedicated owner",
            "4 - Dedicated team"
        ],
        scale: true
    }
];

// Total: 30 questions
// Section A (Q1-Q5): Business context (not scored)
// Section B (Q6-Q13): Workflow Maturity (8 questions, 0-4 scale)
// Section C (Q14-Q20): Data Infrastructure (7 questions, 0-4 scale)
// Section D (Q21-Q25): Automation Exposure (5 questions, 0-4 scale)
// Section E (Q26-Q30): Organizational Readiness (5 questions, 0-4 scale)
// Total scoring questions: 25 × 4 = 100 max points
