import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator'

const getNickname = (_address) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, colors],
    seed: _address?.toLowerCase(),
    style: 'capital',
    separator: ' '
  })

export { getNickname }
