import React, { useEffect } from 'react'
import useWithdrawPageTabs from 'state/dexV2/pool/useWithdrawPageTabs'
import BalTabs from './BalTabs'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { Pool } from 'services/pool/types'
import { Tab } from 'state/dexV2/pool'

interface WithdrawTabsProps {
  pool: Pool
}

const WithdrawTabs: React.FC<WithdrawTabsProps> = ({ pool }) => {
  const { setIsSingleAssetExit } = useExitPool(pool)
  const { activeTab, tabs, setActiveTab } = useWithdrawPageTabs()

  useEffect(() => {
    setIsSingleAssetExit(activeTab === Tab.SingleToken)
  }, [activeTab])

  return (
    <BalTabs
      modelValue={activeTab}
      tabs={tabs}
      onChange={setActiveTab}
      className="p-0 m-0 -mb-px whitespace-nowrap"
      noPad
    />
  )
}

export default WithdrawTabs
