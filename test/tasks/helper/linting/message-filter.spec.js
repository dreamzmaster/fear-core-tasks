'use strict';

var filter = require('../../../../tasks/helper/linting/message-filter');

var expect = require('chai').expect;

describe('linting message filter', function () {

    /*

    valid result object from ESLint 1.3.x:

    {
        filePath: '/path/to/a/file.js',
        messages: [
          {
            ruleId: 'no-console',
            severity: 2,
            message: 'Unexpected console statement.',
            line: 19,
            column: 16,
            nodeType: 'MemberExpression',
            source: '               console.log(\'message\', message);'
          }
        ],
        errorCount: 0,
        warningCount: 0
    }
    */

    it('should return a valid result object', function() {
        var result = {
            filePath: '/path/to/a/file.js',
            messages: []
        };
        var resultClone = JSON.parse(JSON.stringify(result));

        var filtered = filter(result);
        expect(filtered).to.have.property('filePath', resultClone.filePath);
        expect(filtered).to.have.property('messages');
        expect(filtered).to.have.property('errorCount');
        expect(filtered).to.have.property('warningCount');
    });

    describe('when provided with a result object', function () {

        describe('with no messages', function () {

            it('should return the original result object', function() {
                var result = {
                    filePath: '/path/to/a/file.js',
                    messages: [],
                    errorCount: 0,
                    warningCount: 0
                };
                var filtered = filter(result);
                expect(filtered).to.deep.equal(result);
            });

        });

        describe('with at least one message', function () {

            it('should only return messages with the expected ruleId', function() {
                var result = {
                    messages: [
                        { ruleId: 'expected-rule-id' },
                        { ruleId: 'not-expected-rule-id' }
                    ]
                };
                var filtered = filter(result, 'expected-rule-id');

                expect(filtered.messages.length).to.equal(1);
                expect(filtered.messages[0].ruleId).to.equal('expected-rule-id');
            });

            it('should not alter message objects', function() {
                var result = {
                    messages: [
                        { ruleId: 'expected-rule-id' }
                    ]
                };
                var messageClone = JSON.parse(JSON.stringify(result.messages[0]));

                var filtered = filter(result, 'expected-rule-id');

                expect(filtered.messages[0]).to.deep.equal(messageClone);
            });

            it('should count the errors in the filtered messages', function() {
                var result;
                var filtered;

                result = {
                    messages: [
                        { ruleId: 'expected-rule-id', severity: 2 },
                        { ruleId: 'expected-rule-id', severity: 1 }
                    ]
                };
                filtered = filter(result, 'expected-rule-id');
                expect(filtered.errorCount).to.equal(1);

                result = {
                    messages: [
                        { ruleId: 'expected-rule-id', severity: 0 },
                        { ruleId: 'expected-rule-id', severity: 1 }
                    ]
                };
                filtered = filter(result, 'expected-rule-id');
                expect(filtered.errorCount).to.equal(0);
            });

            it('should count the warnings in the filtered messages', function() {
                var result;
                var filtered;

                result = {
                    messages: [
                        { ruleId: 'expected-rule-id', severity: 2 },
                        { ruleId: 'expected-rule-id', severity: 1 }
                    ]
                };
                filtered = filter(result, 'expected-rule-id');
                expect(filtered.warningCount).to.equal(1);

                result = {
                    messages: [
                        { ruleId: 'expected-rule-id', severity: 2 },
                        { ruleId: 'expected-rule-id', severity: 0 }
                    ]
                };
                filtered = filter(result, 'expected-rule-id');
                expect(filtered.warningCount).to.equal(0);
            });

        });

    });

});
