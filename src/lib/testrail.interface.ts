export interface TestRailOptions {
  domain: string;
  username: string;
  password: string;
  projectId: number;
  suiteId: number[];
  createTestRun: boolean;
  runId: number;
  assignedToId?: number;
  runName: string[];
}

export enum Status {
  Passed = 1,
  Blocked = 2,
  Untested = 3,
  Retest = 4,
  Failed = 5,
}

export interface TestRailResult {
  case_id: number;
  status_id: Status;
  comment?: String;
}
