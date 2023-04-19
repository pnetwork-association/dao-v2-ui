import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { Fragment, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { bsc, polygon } from 'wagmi/chains'
import { FaInfoCircle } from 'react-icons/fa'

import { useNickname } from '../../../hooks/use-nickname'

import Avatar from '../../base/Avatar'
import Button from '../../base/Button'
import AccountModal from '../AccountModal'
import ChainModal from '../ChainModal'
import Tooltip from '../../base/Tooltip'
import Text from '../../base/Text'

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 15px;
  @media (max-width: 767.98px) {
    width: 30px;
    height: 30px;
    margin-right: 0px;
  }
`

const StyledLink = styled(Link)`
  font-size: 18px;
  color: ${({ active, theme }) => (active === 'true' ? theme.text4 : theme.text3)} !important;
  letter-spacing: 0px;
  @media (max-width: 767.98px) {
    font-size: 17px;
    margin-top: 5px;
  }
  text-decoration: none;
  margin-left: ${({ withmargin }) => (withmargin === 'true' ? 20 : 0)}px;

  @media (max-width: 767.98px) {
    margin-left: ${({ withmargin }) => (withmargin === 'true' ? 10 : 0)}px;
  }
`

const StyledLinkMobile = styled(StyledLink)`
  background: ${({ theme }) => theme.secondary4};
  padding: 5px 20px;
  border-radius: 20px;
  font-size: 12px;
`

const HeaderContainer = styled(Container)`
  max-width: 100% !important;
  padding: 5px 30px;
  background: ${({ theme }) => theme.bg3};
  @media (max-width: 767.98px) {
    padding: 5px 15px;
  }
`

const ConnectedButton = styled(Button)`
  color: ${({ theme }) => theme.text4};
  height: 40px;
  width: auto;
  @media (max-width: 767.98px) {
    height: 35px;
    width: 35px;
  }
`

const SelectChainButton = styled(Button)`
  display: flex;
  align-items: space-between;
  z-index: 1;
  color: ${({ theme }) => theme.text4};
  height: 40px;
  width: auto;
  @media (max-width: 767.98px) {
    height: 35px;
  }
`

const StyledAvatar = styled(Avatar)`
  border-radius: 50px;
  margin-right: 10px;
  @media (max-width: 767.98px) {
    margin-right: 0;
    height: 30px !important;
    width: 30px !important;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-align: row;
  @media (max-width: 767.98px) {
    margin-top: 5px;
  }
`

const StyledNav = styled(Nav)`
  @media (max-width: 767.98px) {
    display: none !important;
  }
`

const ContainerLinkMobile = styled.div`
  display: none !important;
  margin-top: 5px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  @media (max-width: 767.98px) {
    display: flex !important;
  }
`

const StyledNavbar = styled(Navbar)`
  padding: 0;
`

const ChainName = styled.span`
  margin-left: 10px;
`

const ChainImg = styled.img`
  border-radius: 50px;
  height: 24px;
  width: 24px;
`

const ConnectButtonButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 767.98px) {
    gap: 4px;
  }
`

const ModeContainer = styled.div`
  height: 40px;
  left: 30px;
  padding-right: 40px;
  padding-left: 20px;
  background: ${({ theme }) => theme.bg1};
  border: 1.5px solid ${({ theme }) => theme.secondary4};
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  color: ${({ theme }) => theme.text2};
  display: flex;
  @media (max-width: 767.98px) {
    left: 30px;
    padding-right: 30px;
    padding-left: 10px;
    height: 35px;
  }
`

const StyledFaInfoCircle = styled(FaInfoCircle)`
  margin-right: 5px;
  cursor: pointer;
`

const NicknameText = styled(Text)`
  @media (max-width: 767.98px) {
    display: none;
  }
`

const CustomConnectButton = () => {
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showChainModal, setShowChainModal] = useState(false)
  const nickname = useNickname()

  return (
    <Fragment>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== 'loading'
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

          return (
            <div>
              {(() => {
                if (!connected) {
                  return <Button onClick={openConnectModal}>Connect Wallet</Button>
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={() => setShowChainModal(true)} type="button">
                      Wrong network
                    </Button>
                  )
                }

                return (
                  <ConnectButtonButtonsContainer>
                    {
                      <div className="d-flex">
                        <ModeContainer>
                          <Tooltip
                            id="network-mode-tooltip"
                            placement="bottom"
                            overlayType="popover"
                            text="The pNetwork DAO v2 is available natively on the Polygon chain, but can be used on other chains in compatibility mode.
                            Compatibility mode is currently available on the BNB chain and Ethereum."
                          >
                            <div>
                              <StyledFaInfoCircle />
                            </div>
                          </Tooltip>
                          <Text variant="text2">{chain.id === polygon.id ? 'Native mode' : 'Compatibility mode'}</Text>
                        </ModeContainer>
                        <SelectChainButton onClick={() => setShowChainModal(true)}>
                          {(chain.hasIcon || chain.id === bsc.id) && (
                            <div>
                              {chain.id === bsc.id && (
                                <ChainImg alt={chain.name ?? 'Chain icon'} src={'./assets/svg/bsc.svg'} />
                              )}
                              {chain.iconUrl && chain.id !== bsc.id && (
                                <ChainImg alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} />
                              )}
                            </div>
                          )}
                          <ChainName>{chain.name}</ChainName>
                        </SelectChainButton>
                      </div>
                    }
                    <div className="d-flex justify-content-end">
                      <ConnectedButton onClick={() => setShowAccountModal(true)}>
                        {/*account.displayBalance
        ? ` (${account.displayBalance})`
        : ''*/}
                        <StyledAvatar size={6} address={account.address} />
                        <NicknameText variant="text4">{nickname}</NicknameText>
                      </ConnectedButton>
                    </div>
                  </ConnectButtonButtonsContainer>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
      <AccountModal show={showAccountModal} onClose={() => setShowAccountModal(false)} />
      <ChainModal show={showChainModal} onClose={() => setShowChainModal(false)} />
    </Fragment>
  )
}

const Header = (_props) => {
  const { pathname } = useLocation()

  return (
    <StyledNavbar expand="md">
      <HeaderContainer>
        <Navbar.Brand>
          <Link to={'/'}>
            <Logo src="./assets/svg/PNT.svg" />
          </Link>
        </Navbar.Brand>
        <StyledNav className="me-auto">
          <StyledLink to={'/'} active={(pathname === '/').toString()}>
            Overview
          </StyledLink>
          <StyledLink withmargin="true" to={'/staking'} active={(pathname === '/staking').toString()}>
            Staking
          </StyledLink>
          <StyledLink withmargin="true" to={'/lending'} active={(pathname === '/lending').toString()}>
            Lending
          </StyledLink>
          <StyledLink withmargin="true" to={'/nodes'} active={(pathname === '/nodes').toString()}>
            Nodes
          </StyledLink>
        </StyledNav>
        <ButtonsContainer>
          <CustomConnectButton />
          {/*<ThemeIcon
            icon="moon"
            //icon={theme === 'light' ? 'sun' : 'moon'}
            //onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
  ></ThemeIcon>*/}
        </ButtonsContainer>
        <ContainerLinkMobile>
          <StyledLinkMobile to={'/'} active={(pathname === '/').toString()}>
            Overview
          </StyledLinkMobile>
          <StyledLinkMobile to={'/staking'} active={(pathname === '/staking').toString()}>
            Staking
          </StyledLinkMobile>
          <StyledLinkMobile to={'/lending'} active={(pathname === '/lending').toString()}>
            Lending
          </StyledLinkMobile>
          <StyledLinkMobile to={'/nodes'} active={(pathname === '/nodes').toString()}>
            Nodes
          </StyledLinkMobile>
        </ContainerLinkMobile>
      </HeaderContainer>
      {/*<ContainerBottomMobile>
        <CustomConnectButton />
        <ThemeIcon
          icon="moon"
          //icon={theme === 'light' ? 'sun' : 'moon'}
          //onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        ></ThemeIcon>
  </ContainerBottomMobile>*/}
    </StyledNavbar>
  )
}

export default Header
