# Column Operation Software

Column Operation Software is a full-stack web app for creating and solving column-style math worksheets. Teachers can generate a problem, choose which cells to hide, publish a shareable student link, and students can submit answers with instant feedback and step-by-step explanations.

## Features

- Supports `+`, `-`, `*`, and `/` column operations
- Author mode for teachers
- Generate worksheet templates
- Select exact cells to hide
- Preview what students will see
- Override final answer and explanation steps
- Publish a unique share link
- Student mode
- Open worksheet from a link
- Fill missing boxes
- Submit answers for instant validation
- View correct answer, full template, and solution steps when incorrect
- Persists templates in SQLite using unique IDs

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: SQLite (`sqlite3`)
- Tests: Jest, Supertest

## Project Structure

```text
.
├── backend
│   ├── src
│   ├── tests
│   └── data/templates.db
└── frontend
    └── src
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ recommended
- npm

### 2. Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` by default.

Optional backend environment variables:

- `PORT` (default: `4000`)
- `TEMPLATES_DB_PATH` (default: `backend/data/templates.db`)

### 3. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` by default.

Optional frontend environment variable:

- `REACT_APP_API_BASE_URL` (default: `http://localhost:4000`)

## How It Works

1. Open author mode at `/author`
2. Enter prompt, operation, and operands
3. Generate template and choose cells to hide
4. Publish template and copy the generated student link
5. Student opens `/student/:templateId`, fills blanks, and submits
6. App returns `Correct` or `False` with the correct answer, completed template, and explanation steps

## API Overview

### Math

- `POST /api/math/solve` - Validate student answer against generated result

### Templates

- `POST /api/templates/preview` - Generate a template preview without saving
- `POST /api/templates` - Create and store a template
- `GET /api/templates/:id/student` - Return masked template for student view
- `POST /api/templates/:id/submit` - Evaluate student answers for a template

Legacy compatibility endpoint:

- `POST /api/math/template`

## Example Payload (Create Template)

```json
{
  "prompt": "Fill in the missing number:",
  "operation": "*",
  "operand1": 12,
  "operand2": 34,
  "missing": [
    { "row": "top", "indexFromRight": 1 },
    { "row": "result", "indexFromRight": 2 }
  ],
  "override": {
    "result": "408",
    "steps": ["12 x 4 = 48", "12 x 30 = 360", "360 + 48 = 408"]
  }
}
```

## Running Tests

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

## Notes

- Division supports decimal results in answer validation.
- Inputs for operands are restricted to non-negative integers.
- Student answer cells accept one character (`0-9` or `.`).
