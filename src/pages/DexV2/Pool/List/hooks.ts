import { useCallback } from 'react'
import { AbstractOrder } from 'state/launchpad/types'

export const useOnChangeOrder = (
  order: AbstractOrder,
  setOrder: (foo: AbstractOrder) => void,
  setPage?: (foo: number) => void
) => {
  const onChangeOrder = useCallback(
    (key: string) => {
      const current = Object.keys(order)[0]
      if (!current || current !== key) {
        setOrder({ [key]: 'ASC' })
      }
      if (current === key) {
        const value = Object.values(order)[0]
        const manner = !value ? 'ASC' : value === 'ASC' ? 'DESC' : null

        setOrder({ [current]: manner })
      }
      if (setPage) setPage(1)
    },
    [order, setOrder, setPage]
  )

  return onChangeOrder
}
