import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import useWithdrawPageTabs from 'state/dexV2/pool/useWithdrawPageTabs'
import BalTabs from './BalTabs'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { Pool } from 'services/pool/types'
import { setDataForSingleAmountOut, Tab } from 'state/dexV2/pool'

interface WithdrawTabsProps {
  pool: Pool
}

const WithdrawTabs: React.FC<WithdrawTabsProps> = ({ pool }) => {
  const { setIsSingleAssetExit, setBptIn } = useExitPool(pool)
  const dispatch = useDispatch()
  const { activeTab, tabs, setActiveTab } = useWithdrawPageTabs()

  useEffect(() => {
    if (activeTab === Tab.SingleToken) {
      setIsSingleAssetExit(true)
      dispatch(setDataForSingleAmountOut({ key: 'value', value: '' }))
    } else {
      setIsSingleAssetExit(false)
      setBptIn('')
    }
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
