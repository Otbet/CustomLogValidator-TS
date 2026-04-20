# CustomLogValidator

CustomLogValidator is a lightweight, purely TypeScript-based CLI tool that parses two lists of test names and checks whether each test appears inside four separate log files: **base**, **before**, **after**, and **post_agent_patch**.

---

## Features

| | Feature | Description |
|---|---|---|
| ✅ | **Accurate Parsing** | Handles empty lines and trailing spaces seamlessly |
| ⚡ | **Fast Execution** | Raw text reads with fast substring matching |
| 🔷 | **Strictly Typed** | Built entirely in TypeScript |
| 🐳 | **Dockerized** | Ready to run in isolated containers |
| 🧪 | **Tested** | High coverage using Jest |

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** (bundled with Node.js)
- **Docker** *(optional — for containerized execution)*

---

## Setup & Installation

**1. Clone the repository:**

```bash
git clone https://github.com/yourusername/CustomLogValidator.git
cd CustomLogValidator
```

**2. Install dependencies:**

```bash
npm install
```

---

## Usage

### Step 1 — Build

```bash
npm run build
```

This compiles TypeScript into the `dist/` directory.

### Step 2 — Run

Pass six named flags (order does not matter):

| Flag | Description |
|---|---|
| `--main_tests` | Text file listing main-log test names (one per line) |
| `--report_tests` | Text file listing report-log test names (one per line) |
| `--base` | The **base** log file |
| `--before` | The **before** log file |
| `--after` | The **after** log file |
| `--post_agent_patch` | The **post_agent_patch** log file |

**Primary command:**

```bash
npm start -- --main_tests path/to/main_tests.txt --report_tests path/to/report_tests.txt --base path/to/base.log --before path/to/before.log --after path/to/after.log --post_agent_patch path/to/post_agent_patch.log
```

> **If the above does not work** (e.g. on PowerShell where `--` may be intercepted by the shell), call Node directly:

```bash
node dist/index.js --main_tests path/to/main_tests.txt --report_tests path/to/report_tests.txt --base path/to/base.log --before path/to/before.log --after path/to/after.log --post_agent_patch path/to/post_agent_patch.log
```

---

## Output

Every test name from both lists is checked against all four log files independently. Each row is tagged with a **Source** column (`main` or `report`) so you can tell which test list it came from.

**Graceful missing-file handling:** If a log file is missing, the tool prints a warning and continues — that column shows `⚠️ FILE MISSING` for every row.

**Example output** (with `--before` pointing to a missing file):

```
⚠️  MISSING FILES
  --before  →  path/to/before.log

                       CUSTOM LOG VALIDATOR RESULTS
╔════════════════════════════╤════════╤══════════╤════════════════╤══════════╤══════════════════╗
║ Test Name                  │ Source │ Base     │ Before         │ After    │ Post Agent Patch ║
╟────────────────────────────┼────────┼──────────┼────────────────┼──────────┼──────────────────╢
║ test_login                 │ main   │ ✅ OK    │ ⚠️  FILE MISSING│ ❌ NOT OK│ ✅ OK            ║
╟────────────────────────────┼────────┼──────────┼────────────────┼──────────┼──────────────────╢
║ test_checkout              │ main   │ ❌ NOT OK│ ⚠️  FILE MISSING│ ✅ OK    │ ✅ OK            ║
╟────────────────────────────┼────────┼──────────┼────────────────┼──────────┼──────────────────╢
║ report_summary_test        │ report │ ✅ OK    │ ⚠️  FILE MISSING│ ✅ OK    │ ✅ OK            ║
╚════════════════════════════╧════════╧══════════╧════════════════╧══════════╧══════════════════╝

                                SUMMARY
╔════════╤════════════════╤══════╤════════╤═══════╤══════════════════╗
║ Source │ Status         │ Base │ Before │ After │ Post Agent Patch ║
╟────────┼────────────────┼──────┼────────┼───────┼──────────────────╢
║ main   │ Found          │  1   │   0    │   1   │        2         ║
║        │ Not Found      │  1   │   0    │   1   │        0         ║
║        │ File Missing   │  0   │   2    │   0   │        0         ║
╟────────┼────────────────┼──────┼────────┼───────┼──────────────────╢
║ report │ Found          │  1   │   0    │   1   │        1         ║
║        │ Not Found      │  0   │   0    │   0   │        0         ║
║        │ File Missing   │  0   │   1    │   0   │        0         ║
╚════════╧════════════════╧══════╧════════╧═══════╧══════════════════╝
```

---

## Running Tests

```bash
npm test
```

---

## Dockerization

Run the tool entirely within Docker — no local Node.js required.

### 1. Build the image

```bash
docker build -t custom-log-validator .
```

### 2. Run the container

Mount a volume so the container can access your local files:

```bash
docker run --rm -v $(pwd):/data custom-log-validator \
  --main_tests /data/main_tests.txt \
  --report_tests /data/report_tests.txt \
  --base /data/base.log \
  --before /data/before.log \
  --after /data/after.log \
  --post_agent_patch /data/post_agent_patch.log
```

| Flag | Description |
|---|---|
| `--rm` | Removes the container after it finishes |
| `-v $(pwd):/data` | Maps your current directory to `/data` inside the container |
