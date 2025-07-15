import { useDispatch, useSelector } from 'react-redux'

import { setPoolState, tabs } from '.'
import { AppState } from 'state'

export default function useWithdrawPageTabs() {
  const dispatch = useDispatch()
  const state = useSelector((state: AppState) => state.dexV2Pool)
  const { activeTab } = state

  function resetTabs() {
    dispatch(setPoolState({ activeTab: tabs[0].value }))
  }

  function setActiveTab(value: any) {
    dispatch(setPoolState({ activeTab: value }))
  }

  return { activeTab, setActiveTab, resetTabs, tabs }
}
