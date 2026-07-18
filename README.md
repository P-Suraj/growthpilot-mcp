# GrowthPilot MCP Server 🚀

GrowthPilot is an **AI-powered B2B outbound sales automation pipeline**, exposed as an **MCP (Model Context Protocol) server**. 

By orchestrating multiple external APIs through a robust 7-stage workflow, GrowthPilot transforms a simple goal like *"Find SaaS companies in Bangalore with 20-100 employees"* into actionable intelligence and personalized, ready-to-send emails.

## 🧠 Why MCP? (The "Deep Research" Difference)
Standard LLMs with "Deep Research" capabilities can browse the web and answer questions. GrowthPilot takes this further:
* **Deep Research answers questions; GrowthPilot completes tasks.** It generates actionable deliverables (qualified lead lists + drafted emails).
* **Orchestration, not conversation:** It uses a 7-stage pipeline where specialized agents plan, discover, validate, research, qualify, draft, and critique with self-correcting feedback loops.
* **Structured APIs:** Instead of just web browsing, GrowthPilot integrates Google Places and Tavily to get structured business metadata and deterministic validation.
* **Composable Infrastructure:** As an MCP server, GrowthPilot isn't an app—it's a backend tool that *any* AI client (Claude Desktop, custom agents, ChatGPT) can plug into.

## 🏗️ Architecture

```mermaid
graph LR
    A["🎯 Goal Input"] --> B["📋 Planner"]
    B --> C["🔍 Discovery (Google Places)"]
    C --> D["✅ Validator (Zero-Cost Filter)"]
    D --> E["🔬 Research (Tavily)"]
    E --> F["📊 Qualification (Gemini)"]
    F --> G["✉️ Draft (Gemini)"]
    G --> H["🧪 Critic (Gemini)"]
    H -->|"score < 0.8"| G
```

### The 7-Stage Pipeline
1. **Planner:** Parses user goals into structured campaign parameters.
2. **Discovery:** Finds target businesses via Google Places API.
3. **Validator:** Deterministic, zero-cost keyword and type filtering.
4. **Research:** Scrapes online presence via Tavily.
5. **Qualification:** LLM-based scoring and tier assignment.
6. **Draft:** Generates hyper-personalized cold outreach emails.
7. **Critic:** Audits email drafts (tone, placeholders, length) and revises automatically up to 3 times if quality isn't met.

## 🚀 Setup & Execution

### 1. Prerequisites
- Node.js 20+
- A `.env` file based on `.env.example` with valid keys for Gemini, Google Maps, and Tavily (or use `LIVE_MODE=false` for mocked data).

### 2. Installation
```bash
npm install
```

### 3. Running the Server (Development)
Start the MCP server using the Nitrostack CLI:
```bash
npm run dev
```

### 4. Testing the Code
Run the test suite (validating the NLP extraction algorithms):
```bash
npm run test
```

## 🛠️ MCP Primitives Implemented

GrowthPilot provides a complete suite of MCP primitives:
- **Tools:** 9 tools, including `gp_run_pipeline` for full execution, and individual tools for each pipeline stage.
- **Resources:** `growthpilot://system/status` exposes real-time status and active providers.
- **Prompts:** `gp_campaign_brainstorm` to help users brainstorm new B2B sales goals based on industry.
