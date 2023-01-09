export const styleRainbowKit = (_theme) => ({
  blurs: {
    //modalOverlay: 'blur(4px)',
  },
  radii: {
    actionButton: '8px',
    connectButton: '8px',
    modal: '8px',
    modalMobile: '8px'
  },
  fonts: {
    body: "'Chivo', sans-serif"
  },
  colors: {
    accentColor: _theme.bg2,
    accentColorForeground: _theme.text1,
    actionButtonBorder: _theme.bg3,
    actionButtonBorderMobile: _theme.bg3,
    actionButtonSecondaryBackground: _theme.bg2,
    closeButton: _theme.text1,
    closeButtonBackground: _theme.bg3,
    connectButtonBackground: _theme.bg2,
    connectButtonBackgroundError: _theme.bg2,
    connectButtonInnerBackground: _theme.bg2,
    connectButtonText: _theme.text1,
    connectButtonTextError: _theme.red,
    connectionIndicator: _theme.green,
    downloadBottomCardBackground: `linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), ${_theme.bg3}`,
    downloadTopCardBackground: `linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), ${_theme.bg3}`,
    error: _theme.red,
    generalBorder: 'transparent',
    generalBorderDim: _theme.bg3,
    menuItemBackground: _theme.bg2,
    modalBackdrop: 'rgba(0, 0, 0, 0.3)',
    modalBackground: _theme.bg3,
    modalBorder: _theme.bg3,
    modalText: _theme.text1,
    modalTextDim: _theme.bg3,
    modalTextSecondary: _theme.text1,
    profileAction: _theme.bg3,
    profileActionHover: _theme.bg2,
    profileForeground: _theme.bg3,
    selectedOptionBorder: _theme.bg3,
    standby: _theme.bg3
  },
  shadows: {
    //connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    //dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
    //profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    //selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    //selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    //walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
  }
})
