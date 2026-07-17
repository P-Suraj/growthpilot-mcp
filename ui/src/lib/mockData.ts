import type { Company, ResearchResult, QualificationScore, Draft, Critique } from '../types/index.js';

export const mockCompanies: Company[] = [
  {
    id: "comp-saas-001",
    name: "SaaSify Solutions",
    location: "Bangalore, India",
    industry: "SaaS / DevTools",
    employeeCount: 45,
    website: "https://saasifysolutions.io",
    rating: 4.8
  },
  {
    id: "comp-saas-002",
    name: "Apex SaaS Corp",
    location: "Bangalore, India",
    industry: "SaaS / Fintech",
    employeeCount: 78,
    website: "https://apexsaascorp.io",
    rating: 4.5
  },
  {
    id: "comp-saas-003",
    name: "FlowSaaS Technologies",
    location: "Bangalore, India",
    industry: "SaaS / Productivity",
    employeeCount: 30,
    website: "https://flowsaastechnologies.io",
    rating: 4.2
  },
  {
    id: "comp-saas-004",
    name: "SaaS Labs",
    location: "Bangalore, India",
    industry: "SaaS / Analytics",
    employeeCount: 92,
    website: "https://saaslabs.co",
    rating: 4.9
  },
  {
    id: "comp-saas-005",
    name: "NextGen SaaS India",
    location: "Bangalore, India",
    industry: "SaaS / HRTech",
    employeeCount: 110,
    website: "https://nextgensaas.in",
    rating: 4.0
  }
];

export const mockResearch: Record<string, ResearchResult> = {
  "comp-saas-001": {
    companyId: "comp-saas-001",
    description: "SaaSify Solutions is an agile software developer suite provider based in Bangalore. They build automated Kubernetes orchestration tools, cloud deployment pipelines, and server monitoring widgets for mid-sized tech companies. Active hiring signals detected on LinkedIn for cloud engineers.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/saasify-solutions",
      github: "https://github.com/saasify-labs",
      twitter: "https://twitter.com/saasify_hq"
    },
    newsMentions: [
      { title: "SaaSify raises $2.5M seed funding led by Vertex Ventures", url: "#", date: "Jan 2026" },
      { title: "Top 10 cloud infrastructure startups to watch in India", url: "#", date: "Mar 2026" }
    ],
    dataSources: ["Google Places", "Homepage Scraper", "LinkedIn API", "Tavily Search"]
  },
  "comp-saas-002": {
    companyId: "comp-saas-002",
    description: "Apex SaaS Corp specialized in building digital ledger tech and automated invoice management plugins for local banks in Southeast Asia. Operating out of Bangalore's Outer Ring Road tech corridor. Active marketing campaigns running on LinkedIn Ads.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/apex-saas-corp",
      twitter: "https://twitter.com/apex_fintech"
    },
    newsMentions: [
      { title: "Apex SaaS partners with ICICI Bank for automated reconciliation", url: "#", date: "Feb 2026" }
    ],
    dataSources: ["Google Places", "Company Registry", "Tavily Search"]
  },
  "comp-saas-003": {
    companyId: "comp-saas-003",
    description: "FlowSaaS builds collaborative project canvases for distributed creative agencies. Operating as a remote-first company with registered offices in Indiranagar, Bangalore. The web scraper noted that they use NextJS and Tailwind on their primary portal.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/flowsaas",
      github: "https://github.com/flowsaas-dev"
    },
    newsMentions: [
      { title: "How FlowSaaS grew to 50k weekly active designers without advertising", url: "#", date: "May 2026" }
    ],
    dataSources: ["Google Places", "Tavily Search"]
  },
  "comp-saas-004": {
    companyId: "comp-saas-004",
    description: "SaaS Labs designs advanced data-pipeline connectors that automate Salesforce-to-Snowflake transformations. Boasting an ultra-high customer retention score. Product description mentions deep Postgres and Redis database engineering.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/saas-labs-analytics",
      github: "https://github.com/saaslabs-connect"
    },
    newsMentions: [
      { title: "SaaS Labs named Best Analytics Tool at India SaaS Awards", url: "#", date: "Apr 2026" }
    ],
    dataSources: ["Google Places", "LinkedIn Profile Scraper", "Tavily Search"]
  },
  "comp-saas-005": {
    companyId: "comp-saas-005",
    description: "NextGen SaaS India provides employee engagement scorecards and automated payroll reporting suites. Although their headquarters are in Mumbai, they have a large dev hub in Bangalore housing 100+ team members.",
    socialLinks: {
      linkedin: "https://linkedin.com/company/nextgen-saas-hr"
    },
    newsMentions: [],
    dataSources: ["Google Places", "Homepage Scraper"]
  }
};

export const mockQualifications: Record<string, QualificationScore> = {
  "comp-saas-001": {
    companyId: "comp-saas-001",
    score: 0.94,
    tier: "HIGH",
    reasoning: "Perfect target alignment: operating in the SaaS sector in Bangalore with 45 employees (target 20-100). High growth indicators from seed funding announcement and hiring status. High tech readiness index makes them extremely susceptible to automated deployment solutions.",
    confidence: 0.95,
    signals: [
      { name: "SaaS Vertical Alignment", value: "SaaS / DevTools", weight: 0.35, contribution: 0.35 },
      { name: "Employee Threshold Match", value: "45 employees", weight: 0.25, contribution: 0.25 },
      { name: "Geographical Accuracy", value: "Bangalore Office", weight: 0.2, contribution: 0.2 },
      { name: "Recent Funding Signal", value: "$2.5M Seed Round", weight: 0.2, contribution: 0.14 }
    ]
  },
  "comp-saas-002": {
    companyId: "comp-saas-002",
    score: 0.88,
    tier: "HIGH",
    reasoning: "Strong target alignment. Matches geographical and size filters (78 employees). High qualification score driven by active ads deployment showing search budget and technology tooling requirements. Slightly lower priority than SaaSify due to domain separation (FinTech focus).",
    confidence: 0.9,
    signals: [
      { name: "SaaS Vertical Alignment", value: "SaaS / Fintech", weight: 0.35, contribution: 0.3 },
      { name: "Employee Threshold Match", value: "78 employees", weight: 0.25, contribution: 0.25 },
      { name: "Geographical Accuracy", value: "Bangalore", weight: 0.2, contribution: 0.2 },
      { name: "Active Ads Signal", value: "LinkedIn Ads Active", weight: 0.2, contribution: 0.13 }
    ]
  },
  "comp-saas-003": {
    companyId: "comp-saas-003",
    score: 0.72,
    tier: "MEDIUM",
    reasoning: "Good fit. Fits parameters well (30 employees, Bangalore location). However, growth vectors are currently flat (no funding news or hires). Recommended for general nurture outreach rather than aggressive account engagement.",
    confidence: 0.8,
    signals: [
      { name: "SaaS Vertical Alignment", value: "SaaS / Productivity", weight: 0.35, contribution: 0.32 },
      { name: "Employee Threshold Match", value: "30 employees", weight: 0.25, contribution: 0.25 },
      { name: "Geographical Accuracy", value: "Bangalore", weight: 0.2, contribution: 0.15 }
    ]
  },
  "comp-saas-004": {
    companyId: "comp-saas-004",
    score: 0.96,
    tier: "HIGH",
    reasoning: "Highest score candidate. Fits target size perfectly (92 employees) and located in Bangalore. Deep engineering stack matches automated Kubernetes / server orchestration solution parameters. Award-winning credentials suggest strong product leadership.",
    confidence: 0.98,
    signals: [
      { name: "SaaS Vertical Alignment", value: "SaaS / Analytics", weight: 0.35, contribution: 0.35 },
      { name: "Employee Threshold Match", value: "92 employees", weight: 0.25, contribution: 0.25 },
      { name: "Geographical Accuracy", value: "Bangalore", weight: 0.2, contribution: 0.2 },
      { name: "Stack Match (Postgres/Redis)", value: "High", weight: 0.2, contribution: 0.16 }
    ]
  },
  "comp-saas-005": {
    companyId: "comp-saas-005",
    score: 0.48,
    tier: "BORDERLINE",
    reasoning: "Borderline fit. Although size (110 employees) is slightly over the target ceiling (100) and headquarters is in Mumbai, they hold a large Bangalore operation. Fits vertical alignment criteria. Flagged for review to inspect if Bangalore entity runs autonomously.",
    confidence: 0.75,
    signals: [
      { name: "SaaS Vertical Alignment", value: "SaaS / HRTech", weight: 0.35, contribution: 0.3 },
      { name: "Employee Threshold Match", value: "110 (Over Limit)", weight: 0.25, contribution: 0.08 },
      { name: "Geographical Accuracy", value: "Mumbai HQ / Bgl Hub", weight: 0.2, contribution: 0.1 }
    ]
  }
};

export const mockDrafts: Record<string, Draft> = {
  "comp-saas-001": {
    companyId: "comp-saas-001",
    version: 2,
    subject: "Accelerating SaaSify Solutions' Cloud Orchestration Pipelines",
    body: `Hi SaaSify team,

I came across SaaSify Solutions' recent seed funding announcement—congratulations on the $2.5M raise to scale your Kubernetes orchestration tools! 

We've been helping developers in Bangalore automate deployment monitoring. Based on your active postings for cloud engineers, we thought you might find it useful to eliminate manually configuration scripts for Kubernetes.

Would you be open to a quick chat this Thursday to see how we automate this in under 5 minutes?

Best,
Suraj from GrowthPilot`
  },
  "comp-saas-002": {
    companyId: "comp-saas-002",
    version: 1,
    subject: "Improving Apex SaaS Corp's Invoice Automation Systems",
    body: `Hi Apex team,

I noticed Apex SaaS Corp's recent partnership with ICICI Bank to automate ledgers. It is impressive how you reconcile invoice streams.

We built a micro-service connector that links core ledgers to real-time reconciliation systems. With your active ad campaigns, scaling this pipeline safely is probably top of mind.

Could we jump on a brief 10-minute call next Tuesday?

Best,
Suraj from GrowthPilot`
  },
  "comp-saas-003": {
    companyId: "comp-saas-003",
    version: 1,
    subject: "Personalized collaboration setup for FlowSaaS",
    body: `Hi FlowSaaS team,

I love your collaborative design canvas product. The remote-first culture you've built out of Indiranagar is stellar.

If you are expanding NextJS deployment instances, optimizing resource loading could help reduce latency.

Are you free for a quick sync next week?

Best,
Suraj from GrowthPilot`
  },
  "comp-saas-004": {
    companyId: "comp-saas-004",
    version: 1,
    subject: "Optimizing SaaS Labs' Database Transformation Pipelines",
    body: `Hi SaaS Labs team,

Congrats on winning the India SaaS Awards for Best Analytics Tool! The Salesforce-to-Snowflake connectors you've built are game-changing.

For companies scaling Snowflake transactions, query latency can quickly spiral. We optimize Redis/Postgres pipelines to slash these query delays by 40%.

Would you be open to looking at a 2-minute demo next Wednesday?

Best,
Suraj from GrowthPilot`
  },
  "comp-saas-005": {
    companyId: "comp-saas-005",
    version: 1,
    subject: "Scaling NextGen SaaS's engagement tracking platform",
    body: `Hi NextGen team,

I was looking at your payroll engagement tools. I saw that you have a growing engineering division in Bangalore.

If you are coordinating engagement scorecards, automating payroll reporting delivery is critical.

Let me know if you have 5 minutes for a quick introduction call.

Best,
Suraj from GrowthPilot`
  }
};

export const mockCritiques: Record<string, Critique> = {
  "comp-saas-001": {
    score: 0.92,
    approved: true,
    issues: [
      { category: "personalization", severity: "low", description: "Vague opening in paragraph 2, improved after revision by targeting seed funding details." }
    ],
    suggestions: [
      "No critical issues found. The copy is highly tailored and includes a clear, single CTA."
    ]
  },
  "comp-saas-002": {
    score: 0.86,
    approved: true,
    issues: [],
    suggestions: [
      "Subject line is clear. Personalized hook on ICICI partnership is strong."
    ]
  },
  "comp-saas-003": {
    score: 0.68,
    approved: false,
    issues: [
      { category: "grammar", severity: "medium", description: "Awkward phrasing: 'collaboration setup for FlowSaaS' should use title casing or more specific terminology." },
      { category: "personalization", severity: "high", description: "Generic NextJS references feel like boilerplate." }
    ],
    suggestions: [
      "Incorporate their remote design canvas capabilities directly into the hook."
    ]
  },
  "comp-saas-004": {
    score: 0.95,
    approved: true,
    issues: [],
    suggestions: [
      "Excellent personalization hook. Direct alignment between Snowflake analytics scaling and product capabilities."
    ]
  },
  "comp-saas-005": {
    score: 0.74,
    approved: false,
    issues: [
      { category: "personalization", severity: "high", description: "Greeting is too generic ('Hi NextGen team') instead of targeting specific individuals or regional leaders." }
    ],
    suggestions: [
      "Revise to target the Bangalore development team specifically."
    ]
  }
};
