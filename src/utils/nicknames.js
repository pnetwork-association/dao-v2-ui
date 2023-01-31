import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

const getNickname = (_address) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    seed: _address?.toLowerCase(),
    style: 'capital',
    separator: ' '
  })

export { getNickname }
