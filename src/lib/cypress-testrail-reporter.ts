import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status, TestRailResult} from './testrail.interface';
const chalk = require('chalk');

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRail: TestRail;
  private isRun: boolean;
  private testRunId: number = null;

  constructor(runner: any, options: any) {
    super(runner);

      let reporterOptions = options.reporterOptions;
      this.testRail = new TestRail(reporterOptions);
      this.isRun = false;
      this.validate(reporterOptions, 'domain');
      this.validate(reporterOptions, 'username');
      this.validate(reporterOptions, 'password');
      this.validate(reporterOptions, 'projectId');
      this.validate(reporterOptions, 'suiteId');
      this.validate(reporterOptions, 'createTestRun');

      runner.on('start', () => {
        console.log("Running Test Case...")
      });

      runner.on('pass', async test => {
        const caseIds = titleToCaseIds(test.title);
        const executionDateTime = moment().format('L');
        const description = executionDateTime;
        if (caseIds.length > 0) {
          const results = await caseIds.map(caseId => {
            let suiteId = this.testRail.getSuiteId(caseId);
            let suiteName =  this.testRail.getSuiteInfo(suiteId);
            let name = `${reporterOptions.runName}: Suite: ${suiteName}`;
            this.testRunId = this.testRail.hasRanToday(suiteId);
            if (!this.testRunId) {
              this.testRunId = this.testRail.createTestRun(name, description, suiteId);
            }
            return {
              case_id: caseId,
              status_id: Status.Passed,
              comment: `Execution time: ${test.duration}ms`,
            };
          });
         this.results.push(...results);
        }
      });

      runner.on('fail', async test => {
        const caseIds = titleToCaseIds(test.title);
        const executionDateTime = moment().format('L');
        const description = executionDateTime;
        if (caseIds.length > 0) {
          const results = await caseIds.map(caseId => {
            let suiteId = this.testRail.getSuiteId(caseId);
            let suiteName = this.testRail.getSuiteInfo(suiteId);
            let name = `${reporterOptions.runName}: Suite: ${suiteName}`;
            this.testRunId = this.testRail.hasRanToday(suiteId);
            if (!this.testRunId) {
              this.testRunId = this.testRail.createTestRun(name, description, suiteId);
            }
            return {
              case_id: caseId,
              status_id: Status.Failed,
              comment: `Execution time: ${test.duration}ms`,
            };
          });
          this.results.push(...results);
        }
      });

      runner.on('end', () => {
        if (this.results.length == 0) {
          console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
          console.warn(
            '\n',
            'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
            '\n'
          );
          return;
        }
        this.testRail.publishResults(this.results, this.testRunId);
      });
    }

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }
}
