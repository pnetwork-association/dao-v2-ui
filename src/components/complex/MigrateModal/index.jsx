import { Fragment, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { Row, Col, Badge } from 'react-bootstrap'
import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'

import MyModal from '../../base/Modal'
import Icon from '../../base/Icon'
import Line from '../../base/Line'
import Spinner from '../../base/Spinner'
import Text from '../../base/Text'
import Slider from '../../base/Slider'
import { useBalances } from '../../../hooks/use-balances'
import { useStake, useUnstake, useUserStake } from '../../../hooks/use-staking-manager'
import { isValidError } from '../../../utils/errors'
import { toastifyTransaction } from '../../../utils/transaction'
import { AdvancedOptionsText, ReceiverInput } from '../StakeModal'

const UpgradeButton = styled.button`
  border: 0;
  margin-left: 15px;
  padding: 0px 15px;
  background: ${({ theme }) => theme.darkBlue};
  height: 40px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.white};
  border-radius: 20px;
  display: flex;
  justify-content: center;
  letter-spacing: 0px;
  font-weight: 500;
  font-size: 15px;
  line-height: 15px;
  text-align: center;
  &:hover {
    background: ${({ theme }) => theme.darkerBlue};
  }
  &:disabled {
    opacity: 0.4;
    &:hover {
      opacity: 0.4;
      background: ${({ theme }) => theme.secondary4};
    }
  }
  @media (max-width: 767.98px) {
    height: 35px;
    font-size: 13px;
  }
`

const MigrateButton = styled.button`
  border: 0;
  padding: 0px 15px;
  background: ${({ theme }) => theme.darkBlue};
  height: 40px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.white};
  border-radius: 20px;
  display: flex;
  justify-content: center;
  letter-spacing: 0px;
  font-weight: 400;
  font-size: 16px;
  line-height: 15px;
  text-align: center;
  &:hover {
    background: ${({ theme }) => theme.darkerBlue};
  }
  &:disabled {
    opacity: 0.4;
    &:hover {
      opacity: 0.4;
      background: ${({ theme }) => theme.darkBlue};
    }
  }
  @media (max-width: 767.98px) {
    height: 35px;
    font-size: 13px;
  }
`

const ControlButton = styled(MigrateButton)`
  margin-top: 15px;
  width: 100%;
`
const StepsBadge = styled(Badge)`
  display: inline-flex;
  align-items: center;
`

const StyledIcon = styled(Icon)`
  margin-left: 5px;
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-align: row;
  justify-content: space-around;
  @media (max-width: 767.98px) {
    margin-top: 5px;
  }
`

const MigrationContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-content: center;
  align-items: center;
  border-radius: 10px;
  background: ${({ theme }) => theme.white};
  @media (max-width: 767.98px) {
    margin-top: 5px;
  }
`

const StepsContainer = styled.div`
  margin: 15px;
  padding: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 0.5px solid ${({ theme }) => theme.Green};
  border-radius: 10px;
  background: ${({ theme }) => theme.lightGreen};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
`

const MIGRATION_TRACKER = {
  start: 'start',
  started: 'started',
  unstaked: 'unstaked',
  staked: 'staked',
  finish: 'finish'
}
const STATUS = 'migration-status'
const MIGRATION_AMOUNT = 'migration-amount'
const ACCOUNT = 'migration-account'

const MigrateModal = () => {
  const [status, setStatus] = useState(null)
  const [step, setStep] = useState('')
  const [showMigration, setShowMigration] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(true)
  const [enableV1Unstake, setEnableV1Unstake] = useState(true)
  const [enableV3Approve, setEnableV3Approve] = useState(false)
  const [enableV3Stake, setEnableV3Stake] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const { address } = useAccount()
  const { fomattedAvailableToUnstakePntAmount, availableToUnstakePntAmount, status: userStakeStatus } = useUserStake()
  const {
    amount: unstakeAmount,
    isUnstaking,
    setAmount: setUnstakeAmount,
    unstake,
    unstakeData,
    unstakeError,
    unstakeStatus
  } = useUnstake()
  const {
    amount: stakeAmount,
    approve,
    approveData,
    approveEnabled,
    approveError,
    duration,
    isApproving,
    isStaking,
    receiver,
    setAmount: setStakeAmount,
    setDuration,
    setReceiver,
    stake,
    stakeStatus,
    stakeData,
    stakeEnabled,
    stakeError
  } = useStake({ migration: true })

  const onShowOrHideAdvancedOptions = useCallback(() => {
    setShowAdvancedOptions(!showAdvancedOptions)
  }, [showAdvancedOptions])

  useEffect(() => {
    const localStatus = localStorage.getItem(STATUS)
    if (status !== localStatus) setStatus(localStatus)
    if (localStatus === MIGRATION_TRACKER.started && unstakeStatus === 'success') {
      localStorage.setItem(STATUS, MIGRATION_TRACKER.unstaked)
      setStatus(MIGRATION_TRACKER.unstaked)
    }
    if (localStatus === MIGRATION_TRACKER.unstaked && stakeStatus === 'success') {
      localStorage.setItem(STATUS, MIGRATION_TRACKER.staked)
      setStatus(MIGRATION_TRACKER.staked)
    }
  }, [unstakeStatus, stakeStatus])

  const isEligibileForMigration = availableToUnstakePntAmount && !availableToUnstakePntAmount.isZero()

  const begin = () => {
    setStatus(MIGRATION_TRACKER.start)
    localStorage.setItem(STATUS, MIGRATION_TRACKER.start)
  }

  const finish = () => {
    setStatus(MIGRATION_TRACKER.finish)
    localStorage.setItem(STATUS, MIGRATION_TRACKER.finish)
  }

  useEffect(() => {
    const currentStatus = localStorage.getItem(STATUS)
    const migrationAmount = localStorage.getItem(MIGRATION_AMOUNT)
    const account = localStorage.getItem(ACCOUNT)
    if (!currentStatus && isEligibileForMigration) {
      setShowMigration(true)
    } else if (currentStatus === MIGRATION_TRACKER.start && isEligibileForMigration && availableToUnstakePntAmount) {
      setUnstakeAmount(availableToUnstakePntAmount.toFixed())
      setStakeAmount(availableToUnstakePntAmount.toFixed())
      if (address) {
        setReceiver(address)
        localStorage.setItem(ACCOUNT, address)
      }
      localStorage.setItem(MIGRATION_AMOUNT, availableToUnstakePntAmount)
      localStorage.setItem(STATUS, MIGRATION_TRACKER.started)
      setStatus(MIGRATION_TRACKER.started)
      setShowMigration(true)
    } else if (
      currentStatus &&
      currentStatus !== MIGRATION_TRACKER.finish &&
      currentStatus !== MIGRATION_TRACKER.start
    ) {
      if (!migrationAmount) throw new Error('Migration amount is not set')
      if (migrationAmount !== unstakeAmount) setUnstakeAmount(migrationAmount)
      if (migrationAmount !== stakeAmount) setStakeAmount(migrationAmount)
      if (address) {
        if (!account) localStorage.setItem(ACCOUNT, address)
        if (account && account !== address)
          toast.error(`Connected account is not the one used to initiate migration. Account used: ${account}`)
        if (receiver !== address) setReceiver(address)
      }
      if (!showMigration) setShowMigration(true)
    } else setShowMigration(false)
  }, [availableToUnstakePntAmount, address, status])

  useEffect(() => {
    if (showMigration) {
      const currentStatus = localStorage.getItem(STATUS)
      if (currentStatus && currentStatus === MIGRATION_TRACKER.start) {
        setEnableV1Unstake(true)
        setEnableV3Stake(false)
      }
      if (currentStatus && currentStatus === MIGRATION_TRACKER.unstaked) {
        setEnableV1Unstake(false)
        if (approveEnabled) {
          setEnableV3Approve(true)
          setEnableV3Stake(false)
        } else if (stakeEnabled) {
          setEnableV3Approve(false)
          setEnableV3Stake(true)
        } else {
          setEnableV3Approve(false)
          setEnableV3Stake(false)
        }
      }
      if (currentStatus && currentStatus === MIGRATION_TRACKER.staked) {
        setEnableV1Unstake(false)
        setEnableV3Stake(false)
      }
    }
  }, [showMigration, approveEnabled, stakeEnabled, status])

  const handleUnstake = async () => {
    const savedAmount = localStorage.getItem(MIGRATION_AMOUNT)
    if (!BigNumber(unstakeAmount).isEqualTo(savedAmount))
      throw new Error('Trying to unstake more than the available amount')
    if (BigNumber(unstakeAmount).isZero()) throw new Error('Unstake amount is zero')
    unstake?.()
  }

  const handleApprove = async () => {
    const savedAmount = localStorage.getItem(MIGRATION_AMOUNT)
    const account = localStorage.getItem(ACCOUNT)
    if (!BigNumber(stakeAmount).isEqualTo(savedAmount))
      throw new Error('Trying to unstake more than the available amount')
    if (BigNumber(stakeAmount).isZero()) throw new Error('Unstake amount is zero')
    if (receiver !== account)
      throw new Error(`Connected account is not the one used to initiate migration. Account used: ${receiver}`)
    approve?.()
  }

  const handleStake = async () => {
    const savedAmount = localStorage.getItem(MIGRATION_AMOUNT)
    const account = localStorage.getItem(ACCOUNT)
    if (!BigNumber(stakeAmount).isEqualTo(savedAmount))
      throw new Error('Trying to unstake more than the available amount')
    if (BigNumber(stakeAmount).isZero()) throw new Error('Unstake amount is zero')
    if (receiver !== account)
      throw new Error(`Connected account is not the one used to initiate migration. Account used: ${receiver}`)
    stake?.()
  }

  useEffect(() => {
    if (unstakeError && isValidError(unstakeError)) {
      toast.error(unstakeError.message)
    }
  }, [unstakeError])

  useEffect(() => {
    if (approveError && isValidError(approveError)) {
      toast.error(approveError.message)
    }
  }, [approveError])

  useEffect(() => {
    if (stakeError && isValidError(stakeError)) {
      toast.error(stakeError.message)
    }
  }, [stakeError])

  useEffect(() => {
    if (unstakeData) {
      toastifyTransaction(unstakeData)
    }
  }, [unstakeData])

  useEffect(() => {
    if (approveData) {
      toastifyTransaction(approveData)
    }
  }, [approveData])

  useEffect(() => {
    if (stakeData) {
      toastifyTransaction(stakeData)
    }
  }, [stakeData])

  useEffect(() => {
    if (status === MIGRATION_TRACKER.started) setStep({ step: 'Step 1/2', desc: 'Unstake from DAOv1' })
    if (status === MIGRATION_TRACKER.unstaked) setStep({ step: 'Step 2/2', desc: 'Stake to DAOv3' })
    if (status === MIGRATION_TRACKER.staked) setStep({ step: 'Step 2/2', desc: 'Completed!' })
  }, [status])

  if (showMigration)
    return (
      <>
        <UpgradeButton onClick={() => setShowUpgradeModal(true)}>
          Upgrade
          <StyledIcon icon="upgrade" />
        </UpgradeButton>
        <MyModal
          title={'Upgrade to pNetwork DAO v3!'}
          show={showUpgradeModal}
          size="md"
          onClose={() => setShowUpgradeModal(false)}
        >
          <Text variant={'text4'}>
            {fomattedAvailableToUnstakePntAmount} are eligible to be staked to the new pNetwork DAO v3.
          </Text>
          <MigrationContainer>
            {step !== '' ? (
              <StepsContainer>
                <h4>
                  <StepsBadge bg="success">{step.step}</StepsBadge>
                </h4>
                <Text variant={'text4'}>{step.desc}</Text>
              </StepsContainer>
            ) : null}
            {!status ? (
              <ButtonsContainer>
                <ControlButton onClick={begin}>Begin</ControlButton>
              </ButtonsContainer>
            ) : status === MIGRATION_TRACKER.staked ? (
              <ButtonsContainer>
                <ControlButton onClick={finish}>Finish</ControlButton>
              </ButtonsContainer>
            ) : (
              <>
                {enableV1Unstake && !enableV3Stake && !enableV3Approve ? (
                  <>
                    {isUnstaking ? (
                      <Spinner aria-label="Loading Spinner" data-testid="loader-unstake" />
                    ) : (
                      <MigrateButton disabled={!enableV1Unstake} onClick={handleUnstake}>
                        Unstake from DAOv1
                      </MigrateButton>
                    )}
                  </>
                ) : enableV3Approve && !enableV3Stake ? (
                  <>
                    {isApproving ? (
                      <Spinner aria-label="Loading Spinner" data-testid="loader-approve" />
                    ) : (
                      <MigrateButton onClick={handleApprove}>Approve stake</MigrateButton>
                    )}
                  </>
                ) : !enableV3Approve && enableV3Stake ? (
                  <>
                    {isStaking ? (
                      <Spinner aria-label="Loading Spinner" data-testid="loader-stake" />
                    ) : (
                      <MigrateButton onClick={handleStake}>Stake on DAOv3</MigrateButton>
                    )}
                  </>
                ) : (
                  <Spinner aria-label="Loading Spinner" data-testid="loader" />
                )}
              </>
            )}
          </MigrationContainer>
          {enableV3Stake ? (
            <Row className="mt-2">
              <Col className="text-center">
                <AdvancedOptionsText variant={'text4'} onClick={onShowOrHideAdvancedOptions}>
                  {showAdvancedOptions ? 'Hide' : 'Show'} advanced Options
                </AdvancedOptionsText>
              </Col>
            </Row>
          ) : null}
          {showAdvancedOptions && (
            <Fragment>
              <Line />
              <Row>
                <Col xs={6}>
                  <Text>Lock time</Text>
                </Col>
                <Col xs={6} className="text-end">
                  <Text variant={'text2'}>{duration} days</Text>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Slider
                    min={7}
                    max={730}
                    defaultValue={duration}
                    value={duration}
                    onChange={(_days) => setDuration(_days)}
                  />
                </Col>
              </Row>
              <Row className="mt-2 mb-1">
                <Col>
                  <ReceiverInput
                    placeholder="receiver here ...."
                    value={receiver}
                    onChange={(_e) => setReceiver(_e.target.value)}
                  />
                </Col>
              </Row>
              <Line />
            </Fragment>
          )}
        </MyModal>
      </>
    )
  else return null
}

export default MigrateModal
