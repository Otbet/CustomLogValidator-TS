# CustomLogValidator

CustomLogValidator is a lightweight, purely TypeScript-based CLI tool designed to parse two lists of test names (main logs and report logs) and check whether each test name appears inside four separate log files: **base**, **before**, **after**, and **post_agent_patch**.

## Features

* **Accurate Parsing:** Handles empty lines and trailing spaces in test inputs seamlessly.

* **Fast Execution:** Reads raw text files and utilizes fast substring matching.

* **Strictly Typed:** Built entirely in TypeScript for maintainability.

* **Dockerized:** Ready to be built and run in isolated containers.

* **Tested:** High coverage using Jest.

---

## 🛠️ Prerequisites

* **Node.js** (v18 or higher recommended)

* **npm** (comes with Node.js)

* **Docker** (optional, for containerized execution)

---

## 🚀 Setup & Installation

1. **Clone the repository** (if hosted on GitHub):

\\\\`bash

git clone https://github.com/yourusername/CustomLogValidator.git

cd CustomLogValidator

\\\\`

2. **Install dependencies**:

\\\\`bash

npm install

\\\\`

---

## 💻 Usage (Local Node.js)

1. **Build the TypeScript files**:

\\\\`bash

npm run build

\\\\`

*This compiles the code into the dist/ directory.*

2. **Run the validator**:

Use **named flags** to pass six input files (order does not matter):

| Flag | Description |
|---|---|
| `--main_tests` | Text file with main-log test names (one per line) |
| `--report_tests` | Text file with report-log test names (one per line) |
| `--base` | The **base** log file |
| `--before` | The **before** log file |
| `--after` | The **after** log file |
| `--post_agent_patch` | The **post_agent_patch** log file |

Every test name from both lists is checked against all four log files independently.

\\\\`bash

npm start -- \\
  --main_tests path/to/main_tests.txt \\
  --report_tests path/to/report_tests.txt \\
  --base path/to/base.log \\
  --before path/to/before.log \\
  --after path/to/after.log \\
  --post_agent_patch path/to/post_agent_patch.log

\\\\`

**Graceful missing-file handling:** If any input file does not exist on disk, the tool prints a warning and continues. A missing log file shows `⚠️  FILE MISSING` in that column across every row. A missing test-list file simply skips that group.

**Example Output** (with `--before` pointing to a missing file):

\\\\`

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

\\\\`

Each row is tagged with a **Source** column (`main` or `report`) so you can tell which test list the entry came from. The summary panel breaks down found / not-found / file-missing counts per log file, split by source.

---

## 🧪 Running Tests

This project uses **Jest** for unit testing.

To execute the test suite, run:

\\\\`bash

npm test

\\\\`

---

## 🐳 Dockerization

You can run this tool entirely within Docker without needing Node.js installed on your host machine.

### 1. Build the Docker Image

From the root of the project, run:

\\\\`bash

docker build -t custom-log-validator .

\\\\`

### 2. Run the Docker Container

Because the tool needs to read files from your local machine, you must mount a volume (-v) so the container can access them.

Assume you have the six input files in your current directory $(pwd):

\\\\`bash

docker run --rm -v $(pwd):/data custom-log-validator \\
  --main_tests /data/main_tests.txt \\
  --report_tests /data/report_tests.txt \\
  --base /data/base.log \\
  --before /data/before.log \\
  --after /data/after.log \\
  --post_agent_patch /data/post_agent_patch.log

\\\\`

* --rm: Removes the container after it finishes running.

* -v $(pwd):/data: Maps your current directory to /data inside the container.
