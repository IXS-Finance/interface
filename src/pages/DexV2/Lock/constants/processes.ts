
import { ReactComponent as LockIcon } from 'assets/images/dex-v2/lock.svg'
import { ReactComponent as DocumentsIcon } from 'assets/images/dex-v2/documents.svg'
import { ReactComponent as LoadingIcon } from 'assets/images/dex-v2/loading.svg'
import { ReactComponent as CheckOutline } from 'assets/images/check-success.svg'
import { FunctionComponent, SVGProps } from 'react'

export type Step = {
  label: string,
  icon: FunctionComponent<SVGProps<SVGSVGElement>>,
}

const NotGranted: Step = {
  label: 'Allowance not granted for IXS',
  icon: LockIcon,
}

const Granting: Step = {
  label: 'Contracts to access IXS',
  icon: DocumentsIcon,
}

const Locking: Step = {
  label: 'Waiting for pending actions',
  icon: LoadingIcon,
}

const Completed: Step = {
  label: 'Lock Created',
  icon: CheckOutline,
}

export const createLockSteps = [
  NotGranted,
  Granting,
  Locking,
  Completed,
]
