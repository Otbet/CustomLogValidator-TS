import * as fs from 'fs';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { validateLogs } from './validator';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const testsFilePath = process.argv[2];
    const logsFilePath = process.argv[3];

    // 1. Basic Error Handling UI
    if (!testsFilePath || !logsFilePath) {
        console.clear();
        console.log(chalk.bgRed.white.bold('\n ERROR '));
        console.log(chalk.red('Missing required file paths.'));
        console.log(chalk.yellow('Usage: npm start <path_to_tests_file> <path_to_logs_file>\n'));
        process.exit(1);
    }

    console.clear();
    
    // 2. Simulate Loading State (Like a web page loading)
    const spinner = ora({
        text: 'Parsing files and validating logs...',
        color: 'cyan'
    }).start();

    try {
        // Simulating a tiny delay so the UI feels like a real process
        await sleep(500); 

        const testsInput = fs.readFileSync(testsFilePath, 'utf-8');
        const logContent = fs.readFileSync(logsFilePath, 'utf-8');

        const results = validateLogs(testsInput, logContent);
        
        let passed = 0;
        let failed = 0;

        // 3. Create the HTML-like Table UI
        const table = new Table({
            head: [
                chalk.cyan.bold('Test Name'), 
                chalk.cyan.bold('Status')
            ],
            chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                'right': '║', 'right-mid': '╢', 'middle': '│'
            },
            colWidths: [50, 20],
            style: { head: [], border: ['grey'] } // Let chalk handle colors inside cells
        });

        // 4. Populate Table Rows
        results.forEach(res => {
            if (res.status === 'OK') {
                passed++;
                table.push([
                    chalk.white(res.testName),
                    chalk.green('✅ OK')
                ]);
            } else {
                failed++;
                table.push([
                    chalk.white(res.testName),
                    chalk.red('❌ NOT OK')
                ]);
            }
        });

        spinner.succeed(chalk.green('Validation Complete!\n'));

        // 5. Render Page Header
        console.log(chalk.bgCyan.black.bold('       CUSTOM LOG VALIDATOR RESULT       '));
        
        // 6. Render Table (Content)
        console.log(table.toString());

        // 7. Render Footer/Summary Panel
        const total = passed + failed;
        console.log(chalk.bgGray.white(` SUMMARY `) + 
            chalk.green(` ${passed} Passed `) + 
            chalk.gray(`|`) + 
            chalk.red(` ${failed} Failed `) + 
            chalk.gray(`| Total: ${total}\n`)
        );

    } catch (error: any) {
        spinner.fail(chalk.red('Validation Failed'));
        console.error(chalk.red(`\nError Details: ${error.message}\n`));
        process.exit(1);
    }
}

main();