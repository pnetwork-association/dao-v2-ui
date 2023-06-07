import React, { useEffect, useCallback, Fragment, useState, useMemo } from 'react'
import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { ethers } from 'ethers'
import { mainnet, useProvider } from 'wagmi'

import { toastifyTransaction } from '../../../utils/transaction'
import { useCreateProposal } from '../../../hooks/use-proposals'
import { formatAssetAmount } from '../../../utils/amount'
import { isValidError } from '../../../utils/errors'
import { encodeCallScript } from '../../../utils/voting-scripts'
import { getVotePresets } from '../../../utils/vote-presets'

import Modal from '../../base/Modal'
import Text from '../../base/Text'
import TextArea from '../../base/TextArea'
import Button from '../../base/Button'
import InfoBox from '../../base/InfoBox'
import Input from '../../base/Input'
import Select from '../../base/Select'
import AssetSelection from '../AssetSelection'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const UseScriptText = styled(Text)`
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

const IPFSAttachmentInput = styled(Input)`
  font-size: 17px;
`

const CreateProposalModal = ({ show, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState('paymentFromTreasury')
  const [presetParams, setPresetParams] = useState({})
  const [showEncodedScript, setShowEncodedScript] = useState(false)
  const provider = useProvider({ chainId: mainnet.id })

  const {
    canCreateProposal,
    createProposal,
    createProposalData,
    createProposalError,
    hasPermissionOrEnoughBalance,
    ipfsMultihash,
    isLoading,
    metadata,
    minOpenVoteAmount,
    script,
    setIpfsMultihash,
    setMetadata,
    setScript,
    setShowScript,
    showScript
  } = useCreateProposal()

  useEffect(() => {
    if (createProposalError) {
      if (isValidError(createProposalError)) {
        toast.error(createProposalError.message)
      }
    }
  }, [createProposalError])

  useEffect(() => {
    if (createProposalData) {
      toastifyTransaction(createProposalData)
    }
  }, [createProposalData])

  useEffect(() => {
    if (!show) {
      setMetadata('')
      setScript('')
      setShowScript(false)
      setPresetParams({})
      setSelectedPreset('paymentFromTreasury')
    }
  }, [show, setMetadata, setScript, setShowScript])

  const onShowOrHideUseScript = useCallback(() => {
    setShowScript(!showScript)
    setScript('')
    setPresetParams({})
  }, [showScript, setShowScript, setScript])

  const presets = useMemo(() => getVotePresets({ presetParams, setPresetParams, provider }), [presetParams, provider])

  const renderPresetArg = useCallback(({ id, component, props }) => {
    switch (component) {
      case 'AssetSelection':
        return <AssetSelection key={id} {...props} />
      case 'Input':
        return <Input key={id} {...props} />
      default:
        return null
    }
  }, [])

  const onSelectPreset = useCallback(
    (_preset) => {
      setSelectedPreset(_preset)
      setPresetParams({})
      setScript('')
    },
    [setScript]
  )

  useEffect(() => {
    const prepare = async () => {
      try {
        const preset = presets[selectedPreset]
        const action = await preset.prepare()
        if (action) {
          setScript(encodeCallScript([action]))
        }
      } catch (_err) {
        setScript('')
        // console.error(_err)
      }
    }

    prepare()
  }, [presetParams, presets, selectedPreset, setScript])

  return (
    <Modal show={show} title="Create Proposal" onClose={onClose} size="lg">
      {hasPermissionOrEnoughBalance && (
        <Fragment>
          <Row className="mt-2">
            <Col>
              <Text>Question</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col xs={12}>
              <TextArea rows="4" value={metadata} onChange={(_e) => setMetadata(_e.target.value)} />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Text>IPFS attachment</Text>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col xs={12}>
              <IPFSAttachmentInput value={ipfsMultihash} onChange={(_e) => setIpfsMultihash(_e.target.value)} />
            </Col>
          </Row>

          <Row>
            <Col className="text-center mt-2">
              <UseScriptText onClick={onShowOrHideUseScript} variant="text4">
                {showScript ? 'Remove' : 'Add'} script (optional)
              </UseScriptText>
            </Col>
          </Row>
          {showScript && (
            <Fragment>
              <Row className="mt-2">
                <Col>
                  <Text>Choose a preset</Text>
                </Col>
              </Row>
              <Row className="mt-1">
                <Col xs={12} lg={12}>
                  <Select
                    options={Object.values(presets).map((_preset) => ({
                      option: _preset.id,
                      component: <Text variant="text2">{_preset.name}</Text>
                    }))}
                    onSelect={onSelectPreset}
                  />
                </Col>
              </Row>
            </Fragment>
          )}
          {selectedPreset && showScript && (
            <Row>
              <Col xs={12}>
                <Text size={'sm'}>{presets[selectedPreset]?.description}</Text>
              </Col>
            </Row>
          )}
          {selectedPreset === 'custom' && showScript && (
            <Row className="mt-3">
              <Col xs={12}>
                <TextArea rows="3" value={script} onChange={(_e) => setScript(_e.target.value)} />
              </Col>
            </Row>
          )}
          {selectedPreset !== 'custom' && showScript && (
            <Fragment>
              <Row className="mt-3">
                <Col>
                  <Text>Insert parameters</Text>
                </Col>
              </Row>
              <Row className="mt-1">
                <Col xs={12} className="d-grid gap-2">
                  {presets[selectedPreset]?.args.map(renderPresetArg)}
                </Col>
              </Row>
            </Fragment>
          )}
          {selectedPreset !== 'custom' && showScript && (
            <Fragment>
              <Row className="mt-1">
                <Col lg={2}>
                  <div role="button" onClick={() => setShowEncodedScript((_showEncodedScript) => !_showEncodedScript)}>
                    {!showEncodedScript ? <FaEye /> : <FaEyeSlash />}{' '}
                    <Text size={'sm'}>{!showEncodedScript ? 'Show' : 'Hide'} script</Text>
                  </div>
                </Col>
              </Row>
              {showEncodedScript && <TextArea disabled value={script} rows={3} />}
            </Fragment>
          )}
          <Row className="mt-4 mb-2">
            <Col>
              <Button disabled={!canCreateProposal} loading={isLoading} onClick={() => createProposal?.()}>
                Create proposal
              </Button>
            </Col>
          </Row>
        </Fragment>
      )}
      {!hasPermissionOrEnoughBalance && (
        <Row className="mt-2 mb-2">
          <Col>
            <InfoBox type="warning">
              In order to be able to open a vote you should either have at least&nbsp;
              {formatAssetAmount(ethers.utils.formatEther(minOpenVoteAmount).toString(), 'daoPNT')} or be granted a
              special permission via a DAO vote
            </InfoBox>
          </Col>
        </Row>
      )}
    </Modal>
  )
}

export default CreateProposalModal
