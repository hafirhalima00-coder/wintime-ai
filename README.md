# Wintime AI

> AI-powered code analysis tool that surfaces bugs, security risks, and missing test coverage — instantly.

Built for the **IBM Bob 2.0 Hackathon**. Wintime AI sends a bundled demo project to IBM Bob's inference API, which performs a security and quality audit and returns a structured list of issues grouped by severity.

## Video Demo

**[Watch the demo on YouTube](https://youtu.be/TxTrMjqqTEM)**

---

## Features

- **One-click analysis** — click a single button to run a full audit against the demo Node.js/Express project
- **Severity-grouped results** — issues are categorised as `critical`, `high`, `medium`, or `low`
- **Suggested fixes** — each issue includes a concrete, actionable fix recommendation
- **IBM Bob powered** — uses the OpenAI-compatible IBM Bob inference API with Granite models
- **Dark UI** — responsive Next.js 14 app styled with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| AI Backend | IBM Bob inference API (Granite) |
| Runtime | Node.js (server-side API routes) |

---

## Project Structure

```
wintime-ai/
├── app/
│   ├── layout.tsx              # Root layout (dark background, metadata)
│   ├── page.tsx                # Main page — idle / loading / success / error states
│   └── api/analyze/
│       └── route.ts            # POST /api/analyze — orchestrates the analysis pipeline
├── components/
│   ├── IssueCard.tsx           # Renders a single issue with severity badge + fix
│   ├── ResultsPanel.tsx        # Summary bar + issues grouped by severity
│   └── LoadingSpinner.tsx      # Loading state UI
├── lib/
│   ├── analyzer.ts             # Reads demo project files from disk
│   └── bobClient.ts            # Calls IBM Bob's chat completions endpoint
├── types/
│   └── analysis.ts             # TypeScript interfaces: Issue, AnalysisResult, SourceFile
└── public/
    └── demo-project/           # Seeded Node.js/Express project used as the analysis target
        ├── src/server.js
        ├── src/routes/api.js
        ├── src/db.js
        └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An IBM Bob API key ([IBM Bob documentation](https://bob.ibm.com))

### 1. Clone and install

```bash
git clone https://github.com/hafirhalima00-coder/wintime-ai.git
cd wintime-ai
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Your IBM Bob API key
BOB_API_KEY=your_api_key_here

# Key type: "general" (default) requires BOB_TEAM_ID; "inference" does not
BOB_KEY_TYPE=general
BOB_TEAM_ID=your_team_id_here

# Optional overrides (defaults shown)
BOB_API_BASE_URL=https://api.us-east.bob.ibm.com/inference/v1
BOB_MODEL=ibm/granite-3-3-8b-instruct
```

> **General vs Inference keys**
> - **General key** (`BOB_KEY_TYPE=general`) — requires both `BOB_API_KEY` and `BOB_TEAM_ID`
> - **Inference key** (`BOB_KEY_TYPE=inference`) — requires only `BOB_API_KEY`

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Analyze Demo Project**.

---

## How It Works

```
Browser  ->  POST /api/analyze
               -> lib/analyzer.ts
                    -> Reads files from public/demo-project/
               -> lib/bobClient.ts
                    -> Builds a structured prompt
                    -> Calls Bob /chat/completions
                    -> Parses and validates the JSON response
               -> Returns { issues[], summary } to the UI
```

1. The **analyzer** recursively collects `.js`, `.ts`, `.json`, `.env`, and `.md` files from `public/demo-project/`.
2. The **Bob client** builds a prompt instructing the model to return strict JSON, then calls the IBM Bob chat completions endpoint with `temperature: 0.1` for deterministic output.
3. The response is parsed, schema-validated, and returned to the frontend as an `AnalysisResult`.
4. The **UI** renders a summary bar and per-severity issue cards, each showing the title, affected file + line, description, and a suggested fix.

---

## API Reference

### `POST /api/analyze`

Triggers analysis of the demo project.

**Response `200`**
```json
{
  "issues": [
    {
      "id": 1,
      "severity": "critical",
      "file": "src/db.js",
      "line": 12,
      "title": "Hardcoded database password",
      "description": "The database password is hardcoded in plain text.",
      "fix": "Move credentials to environment variables and load them via process.env."
    }
  ],
  "summary": {
    "total": 8,
    "bySeverity": { "critical": 1, "high": 2, "medium": 3, "low": 2 }
  }
}
```

**Response `500`**
```json
{ "error": "Human-readable error message" }
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `BOB_API_KEY` | yes | — | IBM Bob API key |
| `BOB_KEY_TYPE` | no | `general` | `general` or `inference` |
| `BOB_TEAM_ID` | yes if general | — | IBM Bob team ID |
| `BOB_API_BASE_URL` | no | `https://api.us-east.bob.ibm.com/inference/v1` | Bob API base URL |
| `BOB_MODEL` | no | `ibm/granite-3-3-8b-instruct` | Model name to use |

---

## License

Private — IBM Bob 2.0 Hackathon project.