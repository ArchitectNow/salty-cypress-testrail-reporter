"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var axios = require('axios');
var chalk = require('chalk');
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.projectId = options.projectId || 2;
        this.base = "https://" + options.domain + "/index.php?/api/v2";
    }
    TestRail.prototype.hasRanToday = function (suiteId) {
        var planData = this.getPlanInfo(this.options.planId);
        this.currentDate = moment(new Date()).format('L');
        for (var i = 0; i < planData.entries.length; i++) {
            for (var j = 0; j < planData.entries[i].runs.length; i++) {
                if (planData.entries[i].runs[j].suiteId === suiteId && planData.entries[i].runs[j].description == this.currentDate) {
                    return planData.entries[i].runs[j].id;
                }
            }
        }
        return null;
    };
    TestRail.prototype.createTestRun = function (name, description, suiteId) {
        var _this = this;
        axios({
            method: 'post',
            url: this.base + "/add_plan_entry/" + this.options.planId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: suiteId,
                name: name,
                description: description,
                include_all: true,
                runs: {
                    include_all: true
                }
            }),
        })
            .then(function (response) {
            console.log('Creating test run... ---> run id is:  ', response.data.id);
            _this.runId = response.data.run[0].id;
        });
    };
    TestRail.prototype.getSuiteId = function (caseNumber) {
        axios({
            method: 'get',
            url: this.base + "/get_case/" + caseNumber,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            }
        })
            .then(function (response) {
            var suiteId = response.data[0].suite_id;
            return suiteId;
        });
    };
    TestRail.prototype.getSuiteInfo = function (suiteId) {
        axios({
            method: 'get',
            url: this.base + "/get_suite/" + suiteId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            }
        })
            .then(function (response) {
            var suiteName = response.data[0].name;
            return suiteName;
        });
    };
    TestRail.prototype.getPlanInfo = function (planId) {
        axios({
            method: 'get',
            url: this.base + "/get_plan/" + planId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            }
        })
            .then(function (response) {
            return response.data;
        });
    };
    TestRail.prototype.publishResults = function (results, runId) {
        var _this = this;
        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        })
            .then(function (response) {
            console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this.options.domain + "/index.php?/runs/view/" + _this.runId), '\n');
        })
            .catch(function (error) { return console.error(error); });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map