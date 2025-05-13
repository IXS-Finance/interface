import React from 'react'

import { Container, Title, ActionWrapper, CloseIcon, CloseColor } from './styled'
import { FilledButton, OutlineButton } from 'components/LaunchpadMisc/buttons'
import { LoaderThin } from 'components/Loader/LoaderThin'
import { useWalletState } from 'state/wallet/hooks'
import { Box, Flex } from 'rebass'
import { useExportCSV, useKYCState, useSetExportCSVOptionsRowLimit, useToggleExportCSVModal } from 'state/kyc/hooks'

import { ReactComponent as Check } from 'assets/images/checked-blue.svg'
import { KycFilter } from 'components/AdminKyc'

interface AdminKycExportCSVModalProps {
  loading?: boolean
  filters: KycFilter
}

const exportOptions = [
  {
    label: '100 items',
    value: '100',
  },
  {
    label: '1000 items',
    value: '1000',
  },
  {
    label: '2000 items',
    value: '2000',
  },
]

const AdminKycExportCSVModal: React.FC<AdminKycExportCSVModalProps> = ({ filters }) => {
  const { isSignLoading } = useWalletState()
  const { exportCSVOptionsRowLimit } = useKYCState()
  const toggleExportCSVModal = useToggleExportCSVModal()
  const exportCSV = useExportCSV()
  const setExportCSVOptionsRowLimit = useSetExportCSVOptionsRowLimit()

  return (
    <Container>
      <Flex
        width="100%"
        height="88px"
        bg="#F5F5FF"
        justifyContent="space-between"
        alignItems="center"
        padding="24px 32px"
        css={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', gap: '16px' }}
      >
        <Title>Export CSV</Title>
        <CloseIcon onClick={() => toggleExportCSVModal(false)}>
          <CloseColor />
        </CloseIcon>
      </Flex>
      <Box p="32px" width="100%" textAlign="left">
        <Box>
          <Flex
            alignItems="center"
            height="40px"
            fontSize="14px"
            fontWeight="600"
            css={{ borderBottom: '1px solid #6666FF33' }}
          >
            Export Options
          </Flex>
          <Box>
            {exportOptions.map((option) => (
              <Flex
                key={option.value}
                alignItems="center"
                justifyContent="space-between"
                height="40px"
                fontSize="14px"
                fontWeight="400"
                css={{ cursor: 'pointer', height: '40px', borderBottom: '1px solid #6666FF33' }}
                onClick={() => setExportCSVOptionsRowLimit(+option.value)}
              >
                {option.label}
                {Number(option.value) === exportCSVOptionsRowLimit && <Check />}
              </Flex>
            ))}
          </Box>
        </Box>
        <ActionWrapper>
          <OutlineButton
            style={{ border: '1px solid #6666FF33', width: '100%' }}
            onClick={() => toggleExportCSVModal(false)}
          >
            Cancel
          </OutlineButton>
          <FilledButton
            style={{ boxShadow: '0px 16px 16px 0px #6666FF21', width: '100%' }}
            disabled={false}
            onClick={() => exportCSV({ ...filters, offset: exportCSVOptionsRowLimit })}
          >
            {isSignLoading ? <LoaderThin size={12} /> : null} Export
          </FilledButton>
        </ActionWrapper>
      </Box>
    </Container>
  )
}

export default AdminKycExportCSVModal
