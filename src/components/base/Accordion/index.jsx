import styled from 'styled-components'
import { Accordion } from 'react-bootstrap'

export const StyledAccordion = styled(Accordion)`
  .accordion-button {
    background-color: ${({ theme }) => theme.white} !important;
  }

  .accordion-button:focus {
    box-shadow: none;
  }

  .accordion-button:not(.collapsed) {
    color: ${({ theme }) => theme.text2} !important;
  }

  .accordion-button::after {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${({
      theme
    }) =>
      theme.text2}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
  }
`

const AccordionItem = styled(Accordion.Item)`
  border: 0.5px solid var(${({ theme }) => theme.superLightGray});
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-bottom-width: ${({ last }) => (last === 'true' ? 0 : 0.5)}px;
`

const AccordionHeader = styled(Accordion.Header)`
  font-weight: 400;
  font-size: 15px;
  letter-spacing: 0px;
  color: ${({ theme }) => theme.text2};
  @media (max-width: 767.98px) {
    font-size: 11px;
  }
`

export default Object.assign(StyledAccordion, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Body: Accordion.Body
})
