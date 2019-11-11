const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: string;
  private runId: number;
  private projectId: number;
  private lastRunDate: string;
  private currentDate: string;

  constructor(private options: TestRailOptions, private index: number) {
    this.projectId = options.projectId || 2;
    this.base = `https://${options.domain}/index.php?/api/v2`;
  }

  public createRun(name: string, description: string) {

    axios({
      method: 'post',
      url: `${this.base}/add_run/${this.options.projectId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
          username: this.options.username,
          password: this.options.password,
      },
      data: JSON.stringify({
          suite_id: this.options.suiteId[this.index],
          name,
          description,
          include_all: true,
      }),
    })
      .then(response => {
          console.log('Creating test run... ---> run id is:  ', response.data.id);
          this.runId = response.data.id;
      })
      // .catch(error => console.(error));
  }

  public publishResults(results: TestRailResult[]) {

    if (!this.options.createTestRun) {
      this.runId = this.options.runId;
    }

    axios({
      method: 'get',
      url: `${this.base}/get_runs/${this.projectId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
          username: this.options.username,
          password: this.options.password,
      }
    })
      .then(response => {
        this.runId = response.data[0].id;
        publishToAPI();
      })

    const publishToAPI = () => {
      axios({
        method: 'post',
        url: `${this.base}/add_results_for_cases/${this.runId}`,
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
}
