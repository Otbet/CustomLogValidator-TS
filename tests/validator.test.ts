import { validateLogs, LogContents } from '../src/validator';

describe('CustomLogValidator', () => {
    const baseLog = `
        [INFO] Starting test execution...
        [DEBUG] Running test_login_module
        [SUCCESS] test_login_module completed successfully
        [DEBUG] Running test_payment_gateway
        [ERROR] test_payment_gateway failed due to timeout
        [INFO] Shutting down.
    `;

    const beforeLog = `
        [DEBUG] Running test_login_module
        [DEBUG] Running report_summary_test
    `;

    const afterLog = `
        [DEBUG] Running test_payment_gateway
        [DEBUG] Running report_summary_test
    `;

    const postAgentPatchLog = `
        [DEBUG] Running test_login_module
        [DEBUG] Running test_payment_gateway
        [DEBUG] Running report_summary_test
    `;

    const logs: LogContents = {
        base: baseLog,
        before: beforeLog,
        after: afterLog,
        postAgentPatch: postAgentPatchLog
    };

    it('should evaluate each test against all four log files independently', () => {
        const mainTests = `test_login_module\ntest_payment_gateway`;
        const results = validateLogs(mainTests, '', logs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'OK',
                before: 'OK',
                after: 'NOT OK',
                postAgentPatch: 'OK'
            },
            {
                testName: 'test_payment_gateway',
                source: 'main',
                base: 'OK',
                before: 'NOT OK',
                after: 'OK',
                postAgentPatch: 'OK'
            }
        ]);
    });

    it('should tag tests with the correct source (main vs report)', () => {
        const mainTests = `test_login_module`;
        const reportTests = `report_summary_test`;
        const results = validateLogs(mainTests, reportTests, logs);

        expect(results.length).toBe(2);
        expect(results[0].source).toBe('main');
        expect(results[0].testName).toBe('test_login_module');
        expect(results[1].source).toBe('report');
        expect(results[1].testName).toBe('report_summary_test');
    });

    it('should return NOT OK across all columns for a test missing everywhere', () => {
        const results = validateLogs('test_user_registration', '', logs);

        expect(results).toEqual([
            {
                testName: 'test_user_registration',
                source: 'main',
                base: 'NOT OK',
                before: 'NOT OK',
                after: 'NOT OK',
                postAgentPatch: 'NOT OK'
            }
        ]);
    });

    it('should handle empty lines and spaces in both test inputs gracefully', () => {
        const mainTests = `
            test_login_module

            test_payment_gateway
        `;
        const reportTests = `

            report_summary_test
        `;
        const results = validateLogs(mainTests, reportTests, logs);

        expect(results.length).toBe(3);
        expect(results[0].testName).toBe('test_login_module');
        expect(results[1].testName).toBe('test_payment_gateway');
        expect(results[2].testName).toBe('report_summary_test');
    });

    it('should return an empty array if both test inputs are empty', () => {
        const results = validateLogs('   \n  ', '', logs);
        expect(results).toEqual([]);
    });

    it('should return NOT OK for every column if all log contents are empty', () => {
        const emptyLogs: LogContents = { base: '', before: '', after: '', postAgentPatch: '' };
        const results = validateLogs('test_login_module', '', emptyLogs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'NOT OK',
                before: 'NOT OK',
                after: 'NOT OK',
                postAgentPatch: 'NOT OK'
            }
        ]);
    });

    it('should return FILE MISSING for columns where log content is null', () => {
        const partialLogs: LogContents = {
            base: baseLog,
            before: null,
            after: afterLog,
            postAgentPatch: null
        };
        const results = validateLogs('test_login_module', '', partialLogs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'OK',
                before: 'FILE MISSING',
                after: 'NOT OK',
                postAgentPatch: 'FILE MISSING'
            }
        ]);
    });

    it('should return FILE MISSING across all columns when all logs are null', () => {
        const nullLogs: LogContents = { base: null, before: null, after: null, postAgentPatch: null };
        const results = validateLogs('test_login_module', 'report_summary_test', nullLogs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'FILE MISSING',
                before: 'FILE MISSING',
                after: 'FILE MISSING',
                postAgentPatch: 'FILE MISSING'
            },
            {
                testName: 'report_summary_test',
                source: 'report',
                base: 'FILE MISSING',
                before: 'FILE MISSING',
                after: 'FILE MISSING',
                postAgentPatch: 'FILE MISSING'
            }
        ]);
    });

    it('should produce no results when both test inputs are missing (empty)', () => {
        const results = validateLogs('', '', logs);
        expect(results).toEqual([]);
    });
});