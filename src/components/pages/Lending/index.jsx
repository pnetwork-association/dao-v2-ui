import React, { useContext, useMemo, useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled, { ThemeContext } from 'styled-components'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import BigNumber from 'bignumber.js'

import { useEpochs } from '../../../hooks/use-epochs'
import {
  useAccountLendedAmountByStartAndEndLoanEpochs,
  useAccountLoanStartEpoch,
  useClaimableInterestsAssets,
  useTotalLendedAmountByStartAndEndEpochs,
  useUtilizationRatio,
  useUtilizationRatioInTheCurrentEpoch
} from '../../../hooks/use-borrowing-manager'

import PageTemplate from '../../templates/PageTemplate'
import Line from '../../base/Line'
import Box from '../../base/Box'
import Text from '../../base/Text'
import Icon from '../../base/Icon'
import LendModal from '../../complex/LendModal'
import ButtonSecondary from '../../base/ButtonSecondary'
import ClaimInterests from '../../complex/ClaimInterests'

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`

const BoxHeaderLine = styled(Line)`
  margin: 0;
  margin-top: 13px;
`

const LendButton = styled(ButtonSecondary)`
  width: 26px;
  height: 26px;
  background: ${({ theme }) => theme.text4};
  border-radius: 50%;
  border: 0;
  margin-left: 10px;
`

const ButtonIcon = styled(Icon)`
  color: ${({ theme }) => theme.white} !important;
`

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Lending = () => {
  const [showLendModal, setShowLendModal] = useState(false)
  const theme = useContext(ThemeContext)
  const { formattedCurrentEpoch, formattedCurrentEpochEndAt } = useEpochs()
  const utilizationRatioByEpochsRange = useUtilizationRatio()
  const utilizationRatioCurrentEpoch = useUtilizationRatioInTheCurrentEpoch()
  const accountLendedAmountByStartAndEndLoanEpochs = useAccountLendedAmountByStartAndEndLoanEpochs()
  const totalLendedAmountByEpochsRange = useTotalLendedAmountByStartAndEndEpochs()
  const assets = useClaimableInterestsAssets()
  const accountLoanStartEpoch = useAccountLoanStartEpoch()

  const labels = useMemo(
    () =>
      !accountLendedAmountByStartAndEndLoanEpochs
        ? []
        : Object.keys(accountLendedAmountByStartAndEndLoanEpochs).map((_epoch) => `#${_epoch}`),
    [accountLendedAmountByStartAndEndLoanEpochs]
  )

  const options = useMemo(
    () => ({
      plugins: {
        tooltip: {
          callbacks: {
            label: (_context) => {
              const label = _context.dataset.label || ''
              const value = BigNumber(_context.parsed.y).toFixed(2)
              return `${label} ${value}% ${
                _context.datasetIndex === 0
                  ? `(${
                      accountLendedAmountByStartAndEndLoanEpochs[_context.parsed.x + accountLoanStartEpoch?.value]
                        ?.formattedValue
                    })`
                  : ''
              }`
            }
          }
        }
      },
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            drawBorder: false,
            lineWidth: 0
          }
        },
        y: {
          stacked: false,
          grid: {
            drawBorder: false,
            lineWidth: 0
          }
        }
      }
    }),
    [accountLoanStartEpoch, accountLendedAmountByStartAndEndLoanEpochs]
  )

  const data = useMemo(() => {
    const yourPoolPercentages =
      totalLendedAmountByEpochsRange && accountLendedAmountByStartAndEndLoanEpochs
        ? Object.keys(totalLendedAmountByEpochsRange).map((_epoch) =>
            BigNumber(accountLendedAmountByStartAndEndLoanEpochs[_epoch]?.value)
              .dividedBy(totalLendedAmountByEpochsRange[_epoch]?.value)
              .multipliedBy(100)
              .toFixed()
          )
        : null

    const datasets = []

    if (yourPoolPercentages) {
      datasets.push({
        label: 'Your pool percentage',
        data: yourPoolPercentages.map((_amount) => _amount),
        backgroundColor: theme.red
      })
    }

    if (utilizationRatioByEpochsRange) {
      datasets.push({
        label: 'Utilization Ratio',
        data: Object.values(utilizationRatioByEpochsRange).map(({ value }) => value),
        backgroundColor: theme.yellow
      })
    }

    return {
      labels,
      datasets
    }
  }, [
    totalLendedAmountByEpochsRange,
    accountLendedAmountByStartAndEndLoanEpochs,
    utilizationRatioByEpochsRange,
    theme,
    labels
  ])

  return (
    <PageTemplate>
      <Box>
        <Row>
          <Col className="d-flex">
            <StyledIcon icon="portfolio" />
            <BoxHeaderLine size="lg" />
            <LendButton className="float-end" onClick={() => setShowLendModal(true)}>
              <ButtonIcon icon="plus" />
            </LendButton>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedCurrentEpoch}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Current epochs ends at</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>{formattedCurrentEpochEndAt}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={8}>
            <Text>Utilization Ratio in the current epoch</Text>
          </Col>
          <Col xs={4} className="text-end">
            <Text variant={'text2'}>{utilizationRatioCurrentEpoch?.formattedValue}</Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={8}>
            <Text>Estimated APY</Text>
          </Col>
          <Col xs={4} className="text-end">
            <Text variant={'text2'}>TODO%</Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Your loan starts at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>
              {accountLendedAmountByStartAndEndLoanEpochs
                ? `#${Object.keys(accountLendedAmountByStartAndEndLoanEpochs).at(0)}`
                : '-'}
            </Text>
          </Col>
        </Row>
        <Line />
        <Row className="mt-2">
          <Col xs={6}>
            <Text>Your loan ends at epoch</Text>
          </Col>
          <Col xs={6} className="text-end">
            <Text variant={'text2'}>
              {accountLendedAmountByStartAndEndLoanEpochs
                ? `#${Object.keys(accountLendedAmountByStartAndEndLoanEpochs).at(-1)}`
                : '-'}
            </Text>
          </Col>
        </Row>
        <Line />
        {data && (
          <Row className="mt-4">
            <Col xs={12}>
              <Bar options={options} data={data} />
            </Col>
          </Row>
        )}
      </Box>
      <div className="mt-5">
        <ClaimInterests assetsByEpochs={assets} />
      </div>
      <LendModal show={showLendModal} onClose={() => setShowLendModal(false)} />
    </PageTemplate>
  )
}

export default Lending
