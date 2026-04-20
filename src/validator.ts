export type Status = 'OK' | 'NOT OK' | 'FILE MISSING';
export type TestSource = 'main' | 'report';

export const LOG_KEYS = ['base', 'before', 'after', 'postAgentPatch'] as const;
export type LogKey = typeof LOG_KEYS[number];

export interface LogContents {
    base: string | null;
    before: string | null;
    after: string | null;
    postAgentPatch: string | null;
}

export interface ValidationResult {
    testName: string;
    source: TestSource;
    base: Status;
    before: Status;
    after: Status;
    postAgentPatch: Status;
}

function parseTestNames(input: string): string[] {
    if (!input || !input.trim()) return [];

    return input.split('\n')
        .map(test => test.trim())
        .filter(test => test.length > 0);
}

function check(logContent: string | null, test: string): Status {
    if (logContent === null) return 'FILE MISSING';
    return logContent.includes(test) ? 'OK' : 'NOT OK';
}

function buildResult(test: string, source: TestSource, logs: LogContents): ValidationResult {
    return {
        testName: test,
        source,
        base: check(logs.base, test),
        before: check(logs.before, test),
        after: check(logs.after, test),
        postAgentPatch: check(logs.postAgentPatch, test)
    };
}

export function validateLogs(
    mainTestsInput: string,
    reportTestsInput: string,
    logs: LogContents
): ValidationResult[] {
    const mainTests = parseTestNames(mainTestsInput);
    const reportTests = parseTestNames(reportTestsInput);

    return [
        ...mainTests.map(test => buildResult(test, 'main', logs)),
        ...reportTests.map(test => buildResult(test, 'report', logs))
    ];
}