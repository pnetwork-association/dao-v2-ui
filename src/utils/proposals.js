const extrapolateProposalData = (_proposal) => {
  const index = _proposal.indexOf('http')
  return index > 0
    ? {
        url: _proposal.slice(index),
        description: _proposal.slice(0, index)
      }
    : {
        url: null,
        description: _proposal
      }
}

const styleProposalHtml = (_html, _theme) => {
  let html = _html

  html = html.replace(/color:#000000/g, `color: ${_theme.text1}`)
  html = html.replace(/font-weight:700;/g, `font-weight:700;color:${_theme.text2}!important;`)
  html = html.replace(/font-weight:700/g, `font-weight:700;color:${_theme.text2}!important;`)
  html = html.replace(/font-family:"Arial"/g, "font-family: 'Chivo', sans-serif")
  html = html.replace(/Summary/g, `<span style="font-size:14pt;font-weight:700">Summary</span>`)
  html = html.replace(/Motivation/g, `<span style="font-size:14pt;font-weight:700">Motivation</span>`)
  html = html.replace(/Specification/g, `<span style="font-size:14pt;font-weight:700">Specification</span>`)
  const index = html.indexOf('</style>')

  const rules = `
    a{color: ${_theme.text4} !important;}
  `

  return html.slice(0, index) + rules + html.slice(index, html.length)
}

export { extrapolateProposalData, styleProposalHtml }
