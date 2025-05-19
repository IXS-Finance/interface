/* eslint-disable prefer-const */
import React, { FC, useCallback, useEffect, useState } from 'react'
import { t, Trans } from '@lingui/macro'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { useHistory, useParams } from 'react-router-dom'

import { File } from 'react-feather'
import { LoaderThin } from 'components/Loader/LoaderThin'
import { getKycById, useAdminState, useGetKycList } from 'state/admin/hooks'
import { CopyAddress } from 'components/CopyAddress'
import { IndividualKycVersion, KycItem } from 'state/admin/actions'
import { AdminKycFilters, TStats } from 'components/AdminKycFilters'
import { adminOffset as offset } from 'state/admin/constants'
import { KYCStatuses } from 'pages/KYC/enum'

import { Pagination } from '../Pagination'
import { BodyRow, HeaderRow, Table } from '../Table'
import { StatusCell } from './StatusCell'
import { KycReviewModal } from 'components/KycReviewModal'
import { AdminParams } from 'pages/Admin'
import { NoData } from 'components/UsersList/styleds'
import { getStatusStats } from 'state/kyc/hooks'
import { MEDIA_WIDTHS, TYPE } from 'theme'
import { isMobile } from 'react-device-detect'
import { SortIcon } from 'components/LaunchpadIssuance/utils/SortIcon'
import { useOnChangeOrder } from 'state/launchpad/hooks'
import { AbstractOrder, KycOrderConfig } from 'state/launchpad/types'
import { OrderType } from 'state/launchpad/types'

import { ReactComponent as EyeSvg } from 'assets/svg/eye.svg'
import { ReactComponent as BellSvg } from 'assets/svg/bell.svg'
import ReminderModal from './ReminderModal'

const headerCells = [
  { key: 'ethAddress', label: 'Wallet address', show: false },
  { key: 'fullName', label: 'Name', show: false },
  { key: 'Tenant', label: 'Tenant', show: false },
  { key: 'nationality', label: 'Nationality', show: false },
  { key: 'createdAt', label: 'Date of request', show: true },
  { key: 'status', label: 'KYC Status', show: false },
  { key: 'completedKycOfProvider', label: 'Provider Status', show: false },
  { key: 'updatedAt', label: 'Updated At', show: true },
  { key: 'authorizer', label: 'Authorizer', show: true },
]
interface RowProps {
  item: KycItem
  openModal: () => void
}

const Row: FC<RowProps> = ({ item, openModal }: RowProps) => {
  const [isOpenReminderModal, setIsOpenReminderModal] = useState(false)

  const {
    id,
    user: { ethAddress, whiteLabelConfig },
    status,
    createdAt,
    updatedAt,
    individualKycId,
    audits,
    individual,
    corporate,
  } = item

  const kyc = individualKycId ? individual : corporate
  const completedKycOfProvider = individual?.completedKycOfProvider
  const fullName = individualKycId
    ? [kyc?.firstName, kyc?.middleName, kyc?.lastName].filter((el) => Boolean(el)).join(' ')
    : kyc?.corporateName

  let approverName = '-'
  if (
    individual?.version === IndividualKycVersion.v2 &&
    (status === KYCStatuses.APPROVED || status === KYCStatuses.REJECTED)
  ) {
    let approverUser = null
    const lastIndex = audits.length > 0 ? audits.length - 1 : 0
    if (status === KYCStatuses.APPROVED) {
      approverUser = audits[lastIndex]?.approvedByUser
    } else if (status === KYCStatuses.REJECTED) {
      approverUser = audits[lastIndex]?.rejectedByUser
    }
    approverName = approverUser ? [approverUser?.firstName, approverUser?.lastName].join(' ') : 'Automatic'
  }

  return (
    <StyledBodyRow key={id}>
      <Wallet style={{ fontSize: '12px' }}>
        <CopyAddress address={ethAddress} />
      </Wallet>
      <div style={{ fontSize: '12px' }}>{fullName || '-'}</div>
      <div style={{ fontSize: '12px' }}>{t`${whiteLabelConfig?.name}`}</div>
      <div style={{ fontSize: '12px' }}>{kyc?.nationality || '-'}</div>
      <div style={{ fontSize: '12px' }}>{dayjs(createdAt).format('MMM D, YYYY HH:mm')}</div>
      <div style={{ fontSize: '12px', whiteSpace: 'break-spaces' }}>
        <StatusCell status={status} />
      </div>
      <div style={{ fontSize: '12px', whiteSpace: 'break-spaces' }}>
        <StatusCell status={completedKycOfProvider} />
      </div>
      <div style={{ fontSize: '12px' }}>{dayjs(updatedAt).format('MMM D, YYYY HH:mm')}</div>
      <div style={{ fontSize: '12px' }}>{approverName}</div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        {status === KYCStatuses.DRAFT ? (
          <TYPE.main2 style={{ cursor: 'pointer' }} color="#6666FF" onClick={() => setIsOpenReminderModal(true)}>
            <BellSvg />
          </TYPE.main2>
        ) : null}

        <TYPE.main2 style={{ cursor: 'pointer' }} color="#6666FF" onClick={openModal}>
          <EyeSvg />
        </TYPE.main2>
      </div>

      {status === KYCStatuses.DRAFT ? (
        <ReminderModal item={item} isOpen={isOpenReminderModal} onClose={() => setIsOpenReminderModal(false)} />
      ) : null}
    </StyledBodyRow>
  )
}

const Body = ({ openModal }: { openModal: (kyc: KycItem) => void }) => {
  const {
    kycList: { items },
  } = useAdminState()
  return (
    <>
      {items?.map((item) => {
        return <Row key={`kyc-table-${item.id}`} item={item} openModal={() => openModal(item)} />
      })}
    </>
  )
}

export const AdminKycTable = () => {
  const [identity, setIdentity] = useState<any>(null)
  const [kyc, handleKyc] = useState({} as KycItem)
  const [isLoading, handleIsLoading] = useState(false)
  const [stats, setStats] = useState<TStats[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState(['approved', 'rejected', 'pending', 'changes-requested'])
  const [endDate, setEndDate] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDirection, setSortDirection] = useState<OrderType>('DESC')
  const [order, setOrder] = React.useState<KycOrderConfig>({})

  const {
    kycList: { totalPages, page, items, totalItems },
    adminLoading,
  } = useAdminState()
  const getKycList = useGetKycList()

  const history = useHistory()

  const { id } = useParams<AdminParams>()
  const getKycFilters = (page: number, withStatus = true) => {
    let kycFilter: any = {
      page,
      offset,
      search: searchValue,
      identity: identity?.label ? identity.label.toLowerCase() : 'all',
      sortBy,
      sortDirection,
    }
    if (!selectedStatuses.includes('total') && withStatus && selectedStatuses.length > 0) {
      kycFilter.status = selectedStatuses.join(',')
    }
    if (endDate) {
      kycFilter.date = (endDate as any).format('YYYY-MM-DD')
    }

    return kycFilter
  }

  useEffect(() => {
    const getStats = async () => {
      const data = await getStatusStats(getKycFilters(1, false))
      if (data?.stats) setStats([...data.stats, { status: 'total', count: data.total }])
    }

    getStats()
  }, [searchValue, identity, selectedStatuses, endDate])

  useEffect(() => {
    getKycList(getKycFilters(1))
  }, [getKycList, searchValue, identity, selectedStatuses, endDate, sortBy, sortDirection])

  const onPageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    getKycList(getKycFilters(page))
  }

  const onChangeOrder = useOnChangeOrder(order as AbstractOrder, setOrder)

  const onChangeSort = (field: string) => {
    onChangeOrder(field)
    setSortBy(field)
    setSortDirection(order[field as keyof KycOrderConfig] as OrderType)
  }

  const onIdentityChange = (identity: any) => {
    setIdentity(identity)
  }

  const closeModal = () => {
    history.push(`/admin/kyc`)
    handleKyc({} as KycItem)
  }

  const getKyc = useCallback(async () => {
    if (!id) return
    try {
      handleIsLoading(true)
      const data = await getKycById(id)
      handleKyc(data)
      handleIsLoading(false)
    } catch (e) {
      handleIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    getKyc()
  }, [id, getKyc])

  const openModal = (kyc: KycItem) => history.push(`/admin/kyc/${kyc.id}`)

  return (
    <div style={{ margin: isMobile ? '30px 0px 0px 40px' : '30px 30px 0 30px' }} id="kyc-container">
      {/* version v2 is hardcoded for testing purpose only */}
      {Boolean(kyc.id) && <KycReviewModal isOpen onClose={closeModal} data={kyc} />}
      <TYPE.title4 fontSize={isMobile ? '29px' : '40px'} marginBottom="30px" data-testid="securityTokensTitle">
        <Trans>KYC</Trans>
      </TYPE.title4>
      <AdminKycFilters
        stats={stats}
        setSearchValue={setSearchValue}
        identity={identity}
        onIdentityChange={onIdentityChange}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {items.length === 0 ? (
        <NoData>
          {adminLoading || isLoading ? (
            <Loader>
              <LoaderThin size={96} />
            </Loader>
          ) : (
            <Trans>No results</Trans>
          )}
        </NoData>
      ) : (
        <Container>
          <Table
            body={<Body openModal={openModal} />}
            header={
              <>
                <StyledHeaderRow>
                  {headerCells.map((cell) => (
                    <HeaderCell key={cell.key} onClick={() => onChangeSort(cell.key)}>
                      {cell.label}

                      {cell.show && <SortIcon type={order[cell.key as keyof KycOrderConfig]} />}
                    </HeaderCell>
                  ))}
                </StyledHeaderRow>
              </>
            }
          />

          <Pagination totalItems={totalItems} page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </Container>
      )}
    </div>
  )
}

export default AdminKycTable

const Loader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Wallet = styled.div`
  color: #b8b8cc;
  // background: ${({ theme: { bgG3 } }) => bgG3};
  // -webkit-background-clip: text;
  // background-clip: text;
  // -webkit-text-fill-color: transparent;
`

const HeaderCell = styled.div`
  display: flex;
  gap: 5px;
`

export const Container = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-gap: 50px;
`

export const StyledDoc = styled(File)`
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  width: 17px;
  height: 17px;
`

const StyledHeaderRow = styled(HeaderRow)`
  grid-template-columns: repeat(9, 1fr) 100px;
  padding-bottom: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid;
  border-color: rgba(102, 102, 128, 0.2);
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    min-width: 1370px;
  }
`

const StyledBodyRow = styled(BodyRow)`
  grid-template-columns: repeat(9, 1fr) 100px;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    min-width: 1370px;
  }
`
