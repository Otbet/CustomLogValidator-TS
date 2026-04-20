export interface ValidationResult {
    testName: string;
    status: 'OK' | 'NOT OK';
}

export function validateLogs(testsInput: string, logContent: string): ValidationResult[] {
    if (!testsInput || !testsInput.trim()) return [];

    const tests = testsInput.split('\n')
        .map(test => test.trim())
        .filter(test => test.length > 0);

    return tests.map(test => ({
        testName: test,
        status: logContent.includes(test) ? 'OK' : 'NOT OK'
    }));
}