"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require('chalk');
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var _loop_1 = function (i) {
            var reporterOptions = options.reporterOptions;
            this_1.testRail = new testrail_1.TestRail(reporterOptions, i);
            this_1.isRun = false;
            this_1.validate(reporterOptions, 'domain');
            this_1.validate(reporterOptions, 'username');
            this_1.validate(reporterOptions, 'password');
            this_1.validate(reporterOptions, 'projectId');
            this_1.validate(reporterOptions, 'suiteId');
            this_1.validate(reporterOptions, 'createTestRun');
            runner.on('start', function () {
                console.log("Running Test Case...");
                var executionDateTime = moment().format('L');
                var name = (reporterOptions.runName[i] || 'Automated test run') + " - " + executionDateTime;
                var description = executionDateTime;
                reporterOptions.createTestRun === true && _this.testRail.createRun(name, description);
            });
            runner.on('pass', function (test) {
                var _a;
                var caseIds = shared_1.titleToCaseIds(test.title);
                if (caseIds.length > 0) {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: "Execution time: " + test.duration + "ms",
                        };
                    });
                    (_a = _this.results).push.apply(_a, results);
                }
            });
            runner.on('fail', function (test) {
                var _a;
                var caseIds = shared_1.titleToCaseIds(test.title);
                if (caseIds.length > 0) {
                    var results = caseIds.map(function (caseId) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Failed,
                            comment: "" + test.err.message,
                        };
                    });
                    (_a = _this.results).push.apply(_a, results);
                }
            });
            runner.on('end', function () {
                if (_this.results.length == 0) {
                    console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                    console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
                    return;
                }
                _this.testRail.publishResults(_this.results);
            });
        };
        var this_1 = this;
        for (var i = 0; i < options.reporterOptions.suiteId.length; i++) {
            _loop_1(i);
        }
        return _this;
    }
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map