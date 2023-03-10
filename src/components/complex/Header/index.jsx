import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { Fragment, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { bsc, polygon } from 'wagmi/chains'
import { FaInfoCircle } from 'react-icons/fa'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'

import { useNickname } from '../../../hooks/use-nickname'

import Avatar from '../../base/Avatar'
import Button from '../../base/Button'
import AccountModal from '../AccountModal'
import ChainModal from '../ChainModal'

const Logo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 15px;
  @media (max-width: 767.98px) {
    width: 30px;
    height: 30px;
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
`

const SelectChainButton = styled(ConnectedButton)`
  display: flex;
  align-items: space-between;
  z-index: 1;
`

const StyledAvatar = styled(Avatar)`
  border-radius: 50px;
  margin-right: 10px;
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
  font-size: 15px;
  display: flex;
`

const StyledFaInfoCircle = styled(FaInfoCircle)`
  margin-right: 5px;
  cursor: pointer;
`

const StyledPopover = styled(Popover)`
  border: 1px solid ${({ theme }) => theme.superLightGray};
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
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={
                              <StyledPopover>
                                <Popover.Body>
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                                  dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                  mollit anim id est laborum.
                                </Popover.Body>
                              </StyledPopover>
                            }
                          >
                            <div>
                              <StyledFaInfoCircle />
                            </div>
                          </OverlayTrigger>
                          {chain.id === polygon.id ? 'Native mode' : 'Compatibility mode'}
                        </ModeContainer>

                        <SelectChainButton onClick={() => setShowChainModal(true)}>
                          {(chain.hasIcon || chain.id === bsc.id) && (
                            <div>
                              {chain.id === bsc.id && (
                                <ChainImg alt={chain.name ?? 'Chain icon'} src={'./assets/svg/bsc.svg'} />
                              )}
                              {chain.iconUrl && <ChainImg alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} />}
                            </div>
                          )}
                          <ChainName>{chain.name}</ChainName>
                        </SelectChainButton>
                      </div>
                    }
                    <ConnectedButton onClick={() => setShowAccountModal(true)}>
                      {/*account.displayBalance
        ? ` (${account.displayBalance})`
        : ''*/}
                      <StyledAvatar size={6} address={account.address} />
                      {nickname}
                    </ConnectedButton>
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
          <StyledLinkMobile withmargin="true" to={'/staking'} active={(pathname === '/staking').toString()}>
            Staking
          </StyledLinkMobile>
          <StyledLinkMobile withmargin="true" to={'/lending'} active={(pathname === '/lending').toString()}>
            Lending
          </StyledLinkMobile>
          <StyledLinkMobile withmargin="true" to={'/nodes'} active={(pathname === '/nodes').toString()}>
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
