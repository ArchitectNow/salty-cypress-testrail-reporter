import moment = require("moment");

const axios = require('axios');
const chalk = require('chalk');
import {TestRailOptions, TestRailResult} from './testrail.interface';

export class TestRail {
  private base: string;
  private runId: number;
  private projectId: number;
  private lastRunDate: string;
  private currentDate: string;

  constructor(private options: TestRailOptions) {
    this.projectId = options.projectId || 2;
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public hasRanToday(suiteId: number) {
    let planData = this.getPlanInfo(this.options.planId);
    this.currentDate = moment(new Date()).format('L');
    for(let i=0; i < planData.entries.length; i++) {
      for(let j=0; j < planData.entries[i].runs.length; i++) {
        if(planData.entries[i].runs[j].suiteId === suiteId && planData.entries[i].runs[j].description == this.currentDate) {
          return planData.entries[i].runs[j].id;
        }
      }
    }
    return null;
  }

  public createTestRun(name: string, description: string, suiteId): any {
    axios({
      method: 'post',
      url: `${this.base}/add_plan_entry/${this.options.planId}`,
      headers: {'Content-Type': 'application/json'},
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
      .then(response => {
        console.log('Creating test run... ---> run id is:  ', response.data.id);
        this.runId = response.data.run[0].id;
      })
  }

  public getSuiteId(caseNumber: number): any {
    axios({
      method: 'get',
      url: `${this.base}/get_case/${caseNumber}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      }
    })
      .then(response => {
        let suiteId: number = response.data[0].suite_id;
        return suiteId;
      })
  }

  public getSuiteInfo(suiteId: number): any {
    axios({
      method: 'get',
      url: `${this.base}/get_suite/${suiteId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      }
    })
      .then(response => {
        let suiteName: string = response.data[0].name;
        return suiteName;
      })
  }

  public getPlanInfo(planId: number): any {
    axios({
      method: 'get',
      url: `${this.base}/get_plan/${planId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      }
    })
      .then(response => {
        return response.data;
      })
  }

  public publishResults(results: TestRailResult[], runId: number) {
      axios({
        method: 'post',
        url: `${this.base}/add_results_for_cases/${runId}`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
        data: JSON.stringify({ results }),
      })
        .then(response => {
          console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
          console.log(
            '\n',
            ` - Results are published to ${chalk.magenta(
              `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
            )}`,
            '\n'
          );
        })
        .catch(error => console.error(error));
    }
}
