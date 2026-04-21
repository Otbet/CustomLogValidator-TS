# CustomLogValidator

CustomLogValidator is a lightweight, purely TypeScript-based CLI tool that validates test names against log files using intelligent Log Analysis Mapping:
- **main_tests** are checked against: **base**, **before**, and **after** logs
- **report_tests** are checked against: **post_agent_patch** log only

---

## Features

| | Feature | Description |
|---|---|---|
| 🎯 | **Intelligent Log Mapping** | Tests are validated against only their relevant log files based on source |
| ✅ | **Accurate Parsing** | Handles empty lines, trailing spaces, and JSON array formats seamlessly |
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

## Log Analysis Mapping

CustomLogValidator implements **intelligent test validation** by only checking tests against their relevant log files:

| Test Source | Validated Against | Not Checked |
|---|---|---|
| **main_tests** | `base`, `before`, `after` | `post_agent_patch` (marked as N/A) |
| **report_tests** | `post_agent_patch` only | `base`, `before`, `after` (marked as N/A) |

Tests marked as **N/A** (not applicable) indicate that log file is not part of that test type's validation scope. This ensures that:
- Main tests are only validated against the main development/testing logs
- Report tests are only validated after the agent patch has been applied

---

## Output

Every test name from both lists is validated according to the Log Analysis Mapping. Each row is tagged with a **Source** column (`main` or `report`) so you can tell which test list it came from.

**Status indicators:**
- `✅ OK` — Test found in the log file
- `❌ NOT OK` — Test not found in the log file
- `⚠️ FILE MISSING` — Log file could not be read
- `⊘ N/A` — Log file not applicable to this test source

**Graceful missing-file handling:** If a log file is missing, the tool prints a warning and continues — that column shows `⚠️ FILE MISSING` for every applicable test.

**Example output** (with main_tests and report_tests validated according to mapping):

```
✔ Validation Complete!

                       CUSTOM LOG VALIDATOR RESULTS
╔════════════════════════════╤════════╤══════════╤════════╤═══════╤══════════════════╗
║ Test Name                  │ Source │ Base     │ Before │ After │ Post Agent Patch ║
╟────────────────────────────┼────────┼──────────┼────────┼───────┼──────────────────╢
║ test_login                 │ main   │ ✅ OK    │ ✅ OK  │ ❌ NOT│ ⊘ N/A            ║
╟────────────────────────────┼────────┼──────────┼────────┼───────┼──────────────────╢
║ test_checkout              │ main   │ ❌ NOT OK│ ✅ OK  │ ✅ OK │ ⊘ N/A            ║
╟────────────────────────────┼────────┼──────────┼────────┼───────┼──────────────────╢
║ report_summary_test        │ report │ ⊘ N/A    │ ⊘ N/A  │ ⊘ N/A │ ✅ OK            ║
╚════════════════════════════╧════════╧══════════╧════════╧═══════╧══════════════════╝

                                SUMMARY
╔════════╤════════════════╤══════╤════════╤═══════╤══════════════════╗
║ Source │ Status         │ Base │ Before │ After │ Post Agent Patch ║
╟────────┼────────────────┼──────┼────────┼───────┼──────────────────╢
║ main   │ Found          │  1   │   1    │   1   │       N/A        ║
║        │ Not Found      │  1   │   1    │   1   │       N/A        ║
╟────────┼────────────────┼──────┼────────┼───────┼──────────────────╢
║ report │ Found          │ N/A  │  N/A   │  N/A  │        1         ║
║        │ Not Found      │ N/A  │  N/A   │  N/A  │        0         ║
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
