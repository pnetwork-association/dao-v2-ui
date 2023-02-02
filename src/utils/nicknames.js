import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

const EXCEPTIONS = {
  '0xdd92eb1478d3189707ab7f4a5ace3a615cdd0476': 'DAO Treasury'
}

const getNickname = (_address) => {
  const addressLowerCase = _address?.toLowerCase()
  const exception = EXCEPTIONS[addressLowerCase]

  return (
    exception ||
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      seed: addressLowerCase,
      style: 'capital',
      separator: ' '
    })
  )
}

export { getNickname }
