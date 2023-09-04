import styled from 'styled-components'
import { Tabs } from 'react-bootstrap'

const StyledTabs = styled(Tabs)`
  --bs-nav-tabs-border-width: 1px;
  --bs-nav-tabs-border-color: transparent;
  --bs-nav-tabs-border-radius: 0.375rem;
  --bs-nav-tabs-link-hover-border-color: transparent transparent transparent;
  --bs-nav-tabs-link-active-color: ${({ theme }) => theme.secondary1} !important;
  --bs-nav-tabs-link-active-bg: trasparent;
  --bs-nav-tabs-link-active-border-color: transparent transparent transparent;

  .nav-link {
    color: ${({ theme }) => theme.text1};
    border-bottom: 1px solid ${({ theme }) => theme.superLightGray};
    padding: 1rem !important;
    font-weight: bold !important;
    font-size: 15px;

    @media (max-width: 767.98px) {
      padding: 0.5rem !important;
      font-size: 13px;
    }
  }

  .nav-item .nav-item.show .nav-link,
  .nav-item .nav-link.active {
    border-bottom: 2px solid ${({ theme }) => theme.secondary1} !important;
  }
`

export default StyledTabs
