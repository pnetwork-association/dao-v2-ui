import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { Fragment, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { useNickname } from '../../../hooks/use-nickname'

import Avatar from '../../base/Avatar'
import Button from '../../base/Button'
import AccountModal from '../AccountModal'

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
  padding-top: 0;
`

const CustomConnectButton = () => {
  const [showAccountModal, setShowAccountModal] = useState(false)
  const nickname = useNickname()

  return (
    <Fragment>
      <ConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
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
                    <Button onClick={openChainModal} type="button">
                      Wrong network
                    </Button>
                  )
                }

                return (
                  <div>
                    {/*<button
      onClick={openChainModal}
      style={{ display: 'flex', alignItems: 'center' }}
      type="button"
    >
      {chain.hasIcon && (
        <div
          style={{
            background: chain.iconBackground,
            width: 12,
            height: 12,
            borderRadius: 999,
            overflow: 'hidden',
            marginRight: 4,
          }}
        >
          {chain.iconUrl && (
            <img
              alt={chain.name ?? 'Chain icon'}
              src={chain.iconUrl}
              style={{ width: 12, height: 12 }}
            />
          )}
        </div>
      )}
      {chain.name}
          </button>*/}

                    <ConnectedButton onClick={() => setShowAccountModal(true)}>
                      {/*account.displayBalance
        ? ` (${account.displayBalance})`
        : ''*/}
                      <StyledAvatar size={6} address={account.address} />
                      {nickname}
                    </ConnectedButton>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
      <AccountModal show={showAccountModal} onClose={() => setShowAccountModal(false)} />
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
            <Logo src="../assets/svg/PNT.svg" />
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
