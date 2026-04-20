import * as fs from 'fs';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { validateLogs, Status, LogContents, TestSource, LOG_KEYS, LogKey } from './validator';

const REQUIRED_FLAGS = ['main_tests', 'report_tests', 'base', 'before', 'after', 'post_agent_patch'] as const;

const LOG_FLAG_TO_KEY: Record<string, LogKey> = {
    base: 'base',
    before: 'before',
    after: 'after',
    post_agent_patch: 'postAgentPatch'
};

const TABLE_CHARS = {
    'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
    'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
    'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
    'right': '║', 'right-mid': '╢', 'middle': '│'
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseFlags(argv: string[]): Record<string, string> {
    const flags: Record<string, string> = {};
    const args = argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
            flags[args[i].slice(2)] = args[i + 1];
            i++;
        }
    }
    return flags;
}

function tryReadFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

function statusCell(status: Status): string {
    if (status === 'OK') return chalk.green('✅ OK');
    if (status === 'NOT OK') return chalk.red('❌ NOT OK');
    return chalk.yellow('⚠️  FILE MISSING');
}

async function main() {
    const flags = parseFlags(process.argv);

    // 1. Validate that all six flags are provided on the command line
    const missingFlags = REQUIRED_FLAGS.filter(f => !flags[f]);
    if (missingFlags.length > 0) {
        console.clear();
        console.log(chalk.bgRed.white.bold('\n ERROR '));
        console.log(chalk.red(`Missing required flags: ${missingFlags.map(f => '--' + f).join(', ')}`));
        console.log(chalk.yellow(
            '\nUsage: npm start -- \\\n' +
            '  --main_tests <main_tests.txt> \\\n' +
            '  --report_tests <report_tests.txt> \\\n' +
            '  --base <base.log> \\\n' +
            '  --before <before.log> \\\n' +
            '  --after <after.log> \\\n' +
            '  --post_agent_patch <post_agent_patch.log>\n'
        ));
        process.exit(1);
    }

    console.clear();

    // 2. Simulate Loading State
    const spinner = ora({
        text: 'Parsing files and validating logs...',
        color: 'cyan'
    }).start();

    try {
        await sleep(500);

        // 3. Read files, tracking which are missing on disk
        const missingFiles: { flag: string; path: string }[] = [];

        const mainTestsContent = tryReadFile(flags['main_tests']);
        if (mainTestsContent === null) missingFiles.push({ flag: '--main_tests', path: flags['main_tests'] });

        const reportTestsContent = tryReadFile(flags['report_tests']);
        if (reportTestsContent === null) missingFiles.push({ flag: '--report_tests', path: flags['report_tests'] });

        const logs: LogContents = { base: null, before: null, after: null, postAgentPatch: null };
        for (const [flagName, logKey] of Object.entries(LOG_FLAG_TO_KEY)) {
            const content = tryReadFile(flags[flagName]);
            if (content === null) missingFiles.push({ flag: `--${flagName}`, path: flags[flagName] });
            logs[logKey] = content;
        }

        const results = validateLogs(
            mainTestsContent ?? '',
            reportTestsContent ?? '',
            logs
        );

        spinner.succeed(chalk.green('Validation Complete!\n'));

        // 4. Print missing-file warnings
        if (missingFiles.length > 0) {
            console.log(chalk.bgYellow.black.bold(' ⚠️  MISSING FILES '));
            missingFiles.forEach(({ flag, path }) => {
                console.log(chalk.yellow(`  ${flag}  →  ${path}`));
            });
            console.log('');
        }

        // 5. Render Page Header
        console.log(chalk.bgCyan.black.bold('                       CUSTOM LOG VALIDATOR RESULTS                       '));

        // 6. Build & Render Results Table
        const table = new Table({
            head: [
                chalk.cyan.bold('Test Name'),
                chalk.cyan.bold('Source'),
                chalk.cyan.bold('Base'),
                chalk.cyan.bold('Before'),
                chalk.cyan.bold('After'),
                chalk.cyan.bold('Post Agent Patch')
            ],
            chars: TABLE_CHARS,
            colWidths: [40, 10, 18, 18, 18, 18],
            style: { head: [], border: ['grey'] }
        });

        results.forEach(res => {
            const sourceLabel = res.source === 'main'
                ? chalk.blue.bold('main')
                : chalk.magenta.bold('report');

            table.push([
                chalk.white(res.testName),
                sourceLabel,
                statusCell(res.base),
                statusCell(res.before),
                statusCell(res.after),
                statusCell(res.postAgentPatch)
            ]);
        });

        console.log(table.toString());

        // 7. Compute per-source, per-log-file counts
        const sources: TestSource[] = ['main', 'report'];
        const zeroCounts = (): Record<Status, number> => ({ 'OK': 0, 'NOT OK': 0, 'FILE MISSING': 0 });
        const counts: Record<TestSource, Record<LogKey, Record<Status, number>>> = {
            main:   { base: zeroCounts(), before: zeroCounts(), after: zeroCounts(), postAgentPatch: zeroCounts() },
            report: { base: zeroCounts(), before: zeroCounts(), after: zeroCounts(), postAgentPatch: zeroCounts() }
        };

        results.forEach(res => {
            for (const key of LOG_KEYS) {
                counts[res.source][key][res[key]]++;
            }
        });

        const hasFileMissing = LOG_KEYS.some(k =>
            counts.main[k]['FILE MISSING'] > 0 || counts.report[k]['FILE MISSING'] > 0
        );

        // 8. Render Summary Table
        console.log('\n' + chalk.bgGray.white.bold('                                SUMMARY                                 '));

        const summaryTable = new Table({
            head: [
                chalk.cyan.bold('Source'),
                chalk.cyan.bold('Status'),
                chalk.cyan.bold('Base'),
                chalk.cyan.bold('Before'),
                chalk.cyan.bold('After'),
                chalk.cyan.bold('Post Agent Patch')
            ],
            chars: TABLE_CHARS,
            colWidths: [10, 18, 8, 10, 9, 18],
            style: { head: [], border: ['grey'] }
        });

        for (const src of sources) {
            const label = src === 'main' ? chalk.blue.bold('main') : chalk.magenta.bold('report');

            summaryTable.push([
                label,
                chalk.green('Found'),
                ...LOG_KEYS.map(k => chalk.green(String(counts[src][k]['OK'])))
            ]);
            summaryTable.push([
                '',
                chalk.red('Not Found'),
                ...LOG_KEYS.map(k => chalk.red(String(counts[src][k]['NOT OK'])))
            ]);
            if (hasFileMissing) {
                summaryTable.push([
                    '',
                    chalk.yellow('File Missing'),
                    ...LOG_KEYS.map(k => chalk.yellow(String(counts[src][k]['FILE MISSING'])))
                ]);
            }
        }

        console.log(summaryTable.toString());
        console.log('');

    } catch (error: any) {
        spinner.fail(chalk.red('Validation Failed'));
        console.error(chalk.red(`\nError Details: ${error.message}\n`));
        process.exit(1);
    }
}

main();