\# CustomLogValidator



CustomLogValidator is a lightweight, purely TypeScript-based CLI tool designed to parse a multiline list of test names and check their existence within a provided log file. 



\## Features

\* \*\*Accurate Parsing:\*\* Handles empty lines and trailing spaces in test inputs seamlessly.

\* \*\*Fast Execution:\*\* Reads raw text files and utilizes fast substring matching.

\* \*\*Strictly Typed:\*\* Built entirely in TypeScript for maintainability.

\* \*\*Dockerized:\*\* Ready to be built and run in isolated containers.

\* \*\*Tested:\*\* High coverage using Jest.



\---



\## 🛠️ Prerequisites

\* \*\*Node.js\*\* (v18 or higher recommended)

\* \*\*npm\*\* (comes with Node.js)

\* \*\*Docker\*\* (optional, for containerized execution)



\---



\## 🚀 Setup \& Installation



1\. \*\*Clone the repository\*\* (if hosted on GitHub):

&#x20;  \\`\\`\\`bash

&#x20;  git clone https://github.com/yourusername/CustomLogValidator.git

&#x20;  cd CustomLogValidator

&#x20;  \\`\\`\\`



2\. \*\*Install dependencies\*\*:

&#x20;  \\`\\`\\`bash

&#x20;  npm install

&#x20;  \\`\\`\\`



\---



\## 💻 Usage (Local Node.js)



1\. \*\*Build the TypeScript files\*\*:

&#x20;  \\`\\`\\`bash

&#x20;  npm run build

&#x20;  \\`\\`\\`

&#x20;  \*This compiles the code into the `dist/` directory.\*



2\. \*\*Run the validator\*\*:

&#x20;  Provide two `.txt` or `.log` files as arguments. The first file should contain your list of tests (one per line). The second file should be your application logs.

&#x20;  

&#x20;  \\`\\`\\`bash

&#x20;  npm start path/to/tests.txt path/to/logs.txt

&#x20;  \\`\\`\\`



&#x20;  \*\*Example Output\*\*:

&#x20;  \\`\\`\\`

&#x20;  --- Validation Results ---

&#x20;  ✅ test\_login: OK

&#x20;  ❌ test\_checkout: NOT OK

&#x20;  ✅ test\_database\_connection: OK

&#x20;  --------------------------

&#x20;  \\`\\`\\`



\---



\## 🧪 Running Tests



This project uses \*\*Jest\*\* for unit testing.

To execute the test suite, run:

\\`\\`\\`bash

npm test

\\`\\`\\`



\---



\## 🐳 Dockerization



You can run this tool entirely within Docker without needing Node.js installed on your host machine.



\### 1. Build the Docker Image

From the root of the project, run:

\\`\\`\\`bash

docker build -t custom-log-validator .

\\`\\`\\`



\### 2. Run the Docker Container

Because the tool needs to read files from your local machine, you must mount a volume (`-v`) so the container can access them.



Assume you have `tests.txt` and `logs.txt` in your current directory `$(pwd)`:

\\`\\`\\`bash

docker run --rm -v $(pwd):/data custom-log-validator /data/tests.txt /data/logs.txt

\\`\\`\\`



\* `--rm`: Removes the container after it finishes running.

\* `-v $(pwd):/data`: Maps your current directory to `/data` inside the container.

