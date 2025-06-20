import React, { useState, FC, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Label } from '@rebass/forms'
import { Trans } from '@lingui/macro'
import { useFormik } from 'formik'

import { User } from 'state/admin/actions'
import { PinnedContentButton } from 'components/Button'
import { ModalBlurWrapper, ModalContentWrapper, CloseIcon, TYPE } from 'theme'
import RedesignedWideModal from 'components/Modal/RedesignedWideModal'
import { LoadingIndicator } from 'components/LoadingIndicator'
import { useAdminState, useCreateUser, useUpdateUser } from 'state/admin/hooks'
import { useAddPopup } from 'state/application/hooks'
import { Select, TextInput } from 'pages/KYC/common'
import { Checkbox } from 'components/Checkbox'
import { CopyAddress } from 'components/CopyAddress'
import { useSecTokenState } from 'state/secTokens/hooks'
import CurrencyLogo from 'components/CurrencyLogo'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { ROLES } from 'constants/roles'

import { adminRoles } from './mock'
import { validationSchema } from './validationSchema'
import { Option, TokensBlock } from './TokensBlock'
import { RemoveTokensWarning } from './RemoveTokensWarning'
import { RoleChangeWarning } from './RoleChangeWarning'
import { UpdateSummary } from './UpdateSummary'
import { Line } from 'components/Line'
import { HelpCircle } from 'react-feather'
import { MouseoverTooltip } from 'components/Tooltip'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import apiService from 'services/apiService'
import { whitelabel } from 'services/apiUrls'
import { Box } from 'rebass'

interface Props {
  item: User | null
  close: () => void
  filters: Record<string, any>
}

export const UserModal: FC<Props> = ({ item, close, filters }) => {
  const { adminLoading } = useAdminState()
  const addPopup = useAddPopup()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { tokens: secTokens } = useSecTokenState()
  const { config } = useWhitelabelState()

  const [tokensToRemove, handleTokensToRemove] = useState<Option[]>([])
  const [showDeleteTokensWarning, handleShowDeleteTokensWarning] = useState(false)
  const [changeRole, handleChangeRole] = useState(false)
  const [showSummary, handleShowSummary] = useState(false)
  const [tenants, setTanents] = useState([])

  const TENANT_ROLES = [ROLES.MASTER_TENANT, ROLES.TOKEN_MANAGER] as any

  const tokensOptions = useMemo((): Record<number, Option> => {
    if (secTokens?.length) {
      return secTokens.reduce((acc, token) => {
        return {
          ...acc,
          [token.id]: {
            label: token.symbol,
            value: token.id,
            icon: <CurrencyLogo currency={new WrappedTokenInfo(token)} />,
          },
        }
      }, {})
    }

    return {}
  }, [secTokens])

  const initialValues = useMemo(() => {
    if (item && Object.keys(tokensOptions).length) {
      return {
        ...item,
        managerOf: item.managerOf.filter((_) => _.token?.id).map(({ token }) => tokensOptions[token!.id]),
        username: item.username || '',
      }
    }

    return { ethAddress: '', username: '', role: '', isWhitelisted: false, managerOf: [], tenantId: config?.id }
  }, [item, tokensOptions])

  const submit = async () => {
    const isManager = role === ROLES.TOKEN_MANAGER || role === ROLES.ADMIN
    try {
      handleShowDeleteTokensWarning(false)
      handleChangeRole(false)
      if (item) {
        await updateUser(
          item.id,
          {
            role,
            isWhitelisted,
            username,
            tenantId,
            managerOf: isManager ? managerOf.map((el) => el.value || el) : [],
            removedTokens: tokensToRemove.map(({ value }) => value),
          },
          filters
        )
        handleShowSummary(true)
      } else {
        await createUser(
          {
            ethAddress,
            role,
            isWhitelisted,
            username,
            tenantId,
            managerOf: isManager ? managerOf.map((el) => el.value || el) : [],
          },
          filters
        )
        close()
      }
      handleTokensToRemove([])

      addPopup({
        info: {
          success: true,
          summary: `User was ${item ? 'updated' : 'added'} successfully`,
        },
      })
    } catch (err: any) {
      handleTokensToRemove([])
      addPopup({
        info: {
          success: false,
          summary: `Failed to ${item ? 'update' : 'add'} user. ${err.message}`,
        },
      })
    }
  }

  const tryToSubmit = () => {
    if (!item) {
      submit()
      return
    }

    if (item.role !== role) {
      handleChangeRole(true)
      return
    }

    const tokensToDelete = Object.values(initialValues.managerOf).reduce((acc: Option[], el) => {
      const isRemoved = managerOf.findIndex(({ value }) => value === el.value) === -1

      if (isRemoved) acc.push(el)

      return acc
    }, [])

    if (tokensToDelete.length > 0) {
      handleTokensToRemove(tokensToDelete)
      handleShowDeleteTokensWarning(true)
      return
    }
    submit()
  }

  const {
    values: { ethAddress, role, isWhitelisted, username, managerOf, tenantId },
    errors,
    touched,
    setFieldValue,
    handleSubmit,
  } = useFormik({
    validationSchema,
    enableReinitialize: true,
    initialValues,
    onSubmit: tryToSubmit,
  })

  const handleSelectedTokens = (selectedTokens: Option[]) => {
    setFieldValue('managerOf', selectedTokens)
  }

  const closeTokensWarning = () => {
    handleShowDeleteTokensWarning(false)
    setFieldValue('managerOf', initialValues.managerOf)
  }

  const closeRoleWarning = () => {
    handleChangeRole(false)
  }

  const closeSummary = () => {
    handleShowSummary(false)
    close()
  }

  const canNotEditRole = useMemo(() => {
    if (item && role === ROLES.TOKEN_MANAGER) {
      return item.managerOf.some(({ token }) => Boolean(token?.payoutEvents?.length))
    }

    return false
  }, [item])

  const getAllTenants = async () => {
    try {
      const { status, data } = await apiService.get(whitelabel.all)

      if (status === 200) {
        setTanents(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getAllTenants()
  }, [])

  return (
    <>
      <RedesignedWideModal isOpen onDismiss={close}>
        {showDeleteTokensWarning && (
          <RemoveTokensWarning tokens={tokensToRemove} close={closeTokensWarning} onConfirm={submit} />
        )}
        {changeRole && (
          <RoleChangeWarning close={closeRoleWarning} role={item?.role} newRole={role} onConfirm={submit} />
        )}

        {showSummary && (
          <UpdateSummary
            item={{
              ethAddress,
              role,
              isWhitelisted,
              username,
              managerOf,
              tenant: tenants.find((item: any) => item?.id === tenantId),
            }}
            close={closeSummary}
          />
        )}

        <ModalBlurWrapper>
          <LoadingIndicator isLoading={adminLoading} isRelative />
          <ModalContent>
            <Title>
              <Trans>{item ? 'Update User' : 'Add User'}</Trans>
              <CloseIcon data-testid="cross" onClick={close} />
            </Title>
            <form onSubmit={handleSubmit}>
              {item ? (
                <ExistingWallet>
                  <Label marginBottom="11px" htmlFor="ethAddress">
                    <TYPE.title11 color="text2">
                      <Trans>Wallet Address:</Trans>
                    </TYPE.title11>
                  </Label>
                  <div>
                    <CopyAddress
                      wrapperStyles={{ wordBreak: 'break-word', color: '#B8B8CC', fontSize: '13px' }}
                      address={ethAddress}
                      isShortenAddress={false}
                    />
                  </div>
                  <Line style={{ marginTop: '30px' }} />
                </ExistingWallet>
              ) : (
                <TextInput
                  style={{ fontWeight: 500, color: '#B8B8CC' }}
                  label="Wallet Address:"
                  onChange={({ currentTarget: { value } }) => setFieldValue('ethAddress', value)}
                  value={ethAddress}
                  error={touched.ethAddress && errors.ethAddress}
                  placeholder="Type Wallet Address"
                />
              )}
              <TextInput
                style={{ background: '#F7F7FA' }}
                label="Full Name:"
                onChange={({ currentTarget: { value } }) => setFieldValue('username', value)}
                value={username || ''}
                error={touched.username && errors.username}
                placeholder="Type Full Name"
              />
              <Select
                style={{ background: '#F7F7FA' }}
                withScroll
                label={`User's Role:`}
                selectedItem={role}
                items={adminRoles}
                onSelect={(selectedRole) => setFieldValue('role', selectedRole.value)}
                error={
                  canNotEditRole
                    ? `Token manager's role can't be changed, while they have published payout events`
                    : touched.role && errors.role
                }
                placeholder="Choose Role of User"
                isDisabled={canNotEditRole}
              />

              {TENANT_ROLES.includes(role) ? (
                <Select
                  style={{ background: '#F7F7FA' }}
                  withScroll
                  label="Tenant:"
                  selectedItem={tenantId}
                  items={tenants.map((tenant: any) => ({ value: tenant?.id, label: tenant?.name }))}
                  onSelect={(selectedTenant) => setFieldValue('tenantId', selectedTenant.value)}
                  placeholder="Choose Tenant"
                />
              ) : null}

              {(role === ROLES.TOKEN_MANAGER || role === ROLES.ADMIN) && (
                <Box maxWidth={'470px'}>
                  <Select
                    style={{ background: '#F7F7FA' }}
                    withScroll
                    isMulti
                    error={touched.managerOf && errors.managerOf}
                    label={`RWAs:`}
                    isClearable={false}
                    selectedItem={managerOf}
                    items={Object.values(tokensOptions)}
                    onSelect={handleSelectedTokens}
                    placeholder="Choose RWAs"
                    isTokenLogoVisible
                  />
                </Box>
              )}

              <div style={{ display: 'flex' }}>
                <Checkbox
                  checked={isWhitelisted}
                  onClick={() => setFieldValue('isWhitelisted', !isWhitelisted)}
                  label={`Waive Withdrawal Fees`}
                />
                <MouseoverTooltip
                  text={
                    <Trans>
                      {config?.name} custody service provider charges 20 USD withdrawal fees when users withdraw STOs
                      from Vaults.
                      {config?.name} passes the withdrawal fees to the user by charging the user an equivalent amount in
                      native tokens. By checking this box, the user will incur 1000% less withdrawal fees.
                    </Trans>
                  }
                >
                  <HelpCircle size="18" color={'#666680'} style={{ marginLeft: '8px', marginTop: '4px' }} />
                </MouseoverTooltip>
              </div>

              {(item && role === ROLES.TOKEN_MANAGER) ||
                (role === ROLES.ADMIN && (
                  <TokensBlock
                    initialItems={initialValues?.managerOf || []}
                    currentItems={managerOf || []}
                    onRemove={handleSelectedTokens}
                  />
                ))}
              <>
                <PinnedContentButton type="submit">
                  <Trans>{item ? 'Update' : 'Add User'}</Trans>
                </PinnedContentButton>
              </>
            </form>
          </ModalContent>
        </ModalBlurWrapper>
      </RedesignedWideModal>
    </>
  )
}

const ExistingWallet = styled.div`
  display: flex;
  flex-direction: column;
  > div {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }
`

const ModalContent = styled(ModalContentWrapper)`
  overflow: auto;
  > div {
    padding: 20px 23px;
    border-radius: 20px 20px 0px 0px;
  }
  > form {
    padding: 20px 23px;
    border-radius: 20px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    label {
      margin-bottom: 8px;
      > div {
        font-weight: 400;
      }
    }
  }
`

const Title = styled.div`
  font-weight: 600;
  font-size: 22px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
`
