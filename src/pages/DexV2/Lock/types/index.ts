
export enum StepIds {
  NotGranted,
  Granting,
  Locking,
  Completed,
}

export enum StepLabels {
  NotGranted = 'Allowance not granted for IXS',
  Granting = 'Contracts to access IXS',
  Locking = 'Waiting for pending actions',
  Completed = 'Lock Created',
}
