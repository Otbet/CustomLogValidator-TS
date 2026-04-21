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

    it('should evaluate main_tests against only base, before, after (not post_agent_patch)', () => {
        const mainTests = `test_login_module\ntest_payment_gateway`;
        const results = validateLogs(mainTests, '', logs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'OK',
                before: 'OK',
                after: 'NOT OK',
                postAgentPatch: 'N/A'
            },
            {
                testName: 'test_payment_gateway',
                source: 'main',
                base: 'OK',
                before: 'NOT OK',
                after: 'OK',
                postAgentPatch: 'N/A'
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
        expect(results[0].postAgentPatch).toBe('N/A');
        expect(results[1].source).toBe('report');
        expect(results[1].testName).toBe('report_summary_test');
        expect(results[1].base).toBe('N/A');
        expect(results[1].before).toBe('N/A');
        expect(results[1].after).toBe('N/A');
    });

    it('should return NOT OK for main_test missing in base/before/after and N/A for post_agent_patch', () => {
        const results = validateLogs('test_user_registration', '', logs);

        expect(results).toEqual([
            {
                testName: 'test_user_registration',
                source: 'main',
                base: 'NOT OK',
                before: 'NOT OK',
                after: 'NOT OK',
                postAgentPatch: 'N/A'
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

    it('should return NOT OK for main_test columns and N/A for post_agent_patch when logs are empty', () => {
        const emptyLogs: LogContents = { base: '', before: '', after: '', postAgentPatch: '' };
        const results = validateLogs('test_login_module', '', emptyLogs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'NOT OK',
                before: 'NOT OK',
                after: 'NOT OK',
                postAgentPatch: 'N/A'
            }
        ]);
    });

    it('should return FILE MISSING for main_test when applicable log is null', () => {
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
                postAgentPatch: 'N/A'
            }
        ]);
    });

    it('should return FILE MISSING for applicable logs and N/A for non-applicable when logs are null', () => {
        const nullLogs: LogContents = { base: null, before: null, after: null, postAgentPatch: null };
        const results = validateLogs('test_login_module', 'report_summary_test', nullLogs);

        expect(results).toEqual([
            {
                testName: 'test_login_module',
                source: 'main',
                base: 'FILE MISSING',
                before: 'FILE MISSING',
                after: 'FILE MISSING',
                postAgentPatch: 'N/A'
            },
            {
                testName: 'report_summary_test',
                source: 'report',
                base: 'N/A',
                before: 'N/A',
                after: 'N/A',
                postAgentPatch: 'FILE MISSING'
            }
        ]);
    });

    it('should produce no results when both test inputs are missing (empty)', () => {
        const results = validateLogs('', '', logs);
        expect(results).toEqual([]);
    });

    it('should evaluate report_tests against only post_agent_patch (not base, before, after)', () => {
        const reportTests = `report_summary_test`;
        const results = validateLogs('', reportTests, logs);

        expect(results).toEqual([
            {
                testName: 'report_summary_test',
                source: 'report',
                base: 'N/A',
                before: 'N/A',
                after: 'N/A',
                postAgentPatch: 'OK'
            }
        ]);
    });
});