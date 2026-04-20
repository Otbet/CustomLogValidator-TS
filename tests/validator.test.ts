import { validateLogs } from '../src/validator';

describe('CustomLogValidator', () => {
    const sampleLogContent = `
        [INFO] Starting test execution...
        [DEBUG] Running test_login_module
        [SUCCESS] test_login_module completed successfully
        [DEBUG] Running test_payment_gateway
        [ERROR] test_payment_gateway failed due to timeout
        [INFO] Shutting down.
    `;

    it('should return OK for tests found in the log', () => {
        const tests = `test_login_module\ntest_payment_gateway`;
        const results = validateLogs(tests, sampleLogContent);
        
        expect(results).toEqual([
            { testName: 'test_login_module', status: 'OK' },
            { testName: 'test_payment_gateway', status: 'OK' }
        ]);
    });

    it('should return NOT OK for tests missing from the log', () => {
        const tests = `test_user_registration`;
        const results = validateLogs(tests, sampleLogContent);
        
        expect(results).toEqual([
            { testName: 'test_user_registration', status: 'NOT OK' }
        ]);
    });

    it('should handle a mix of existing and missing tests', () => {
        const tests = `test_login_module\nmissing_test\ntest_payment_gateway`;
        const results = validateLogs(tests, sampleLogContent);
        
        expect(results).toEqual([
            { testName: 'test_login_module', status: 'OK' },
            { testName: 'missing_test', status: 'NOT OK' },
            { testName: 'test_payment_gateway', status: 'OK' }
        ]);
    });

    it('should handle empty lines and spaces in the test input string gracefully', () => {
        const tests = `
            test_login_module
            
            test_payment_gateway   
        `;
        const results = validateLogs(tests, sampleLogContent);
        
        expect(results.length).toBe(2);
        expect(results[0].testName).toBe('test_login_module');
        expect(results[1].testName).toBe('test_payment_gateway');
    });

    it('should return an empty array if the test input is completely empty', () => {
        const results = validateLogs('   \n  ', sampleLogContent);
        expect(results).toEqual([]);
    });

    it('should return NOT OK for everything if log content is empty', () => {
        const tests = `test_login_module`;
        const results = validateLogs(tests, "");
        expect(results).toEqual([
            { testName: 'test_login_module', status: 'NOT OK' }
        ]);
    });
});