const SECONDS_IN_ONE_DAY = 86400
const SECONDS_IN_ONE_HOUR = 3600

const parseSeconds = (_seconds) => {
  const days = Math.floor(_seconds / (60 * 60 * 24))
  if (days >= 365 && days <= 730) {
    return '1 year'
  } else if (days >= 730) {
    return `${Math.round(days / 365)} years`
  } else if (days === 30) {
    return '1 month'
  } else if (days > 60 && days < 365) {
    return `${Math.round(days / 30)} months`
  } else if (days === 7) {
    return `1 week`
  } else if (days > 7 && days <= 30) {
    return `${Math.round(days / 7)} weeks`
  } else if (days === 1) {
    return '1 day'
  } else if (days > 1) {
    return `${days} days`
  } else if (_seconds >= 3600) {
    return `${Math.round(_seconds / 3600)} hours`
  } else if (_seconds >= 60) {
    return `${Math.round(_seconds / 60)} minutes`
  } else return `${Math.round(_seconds)} seconds`
}

const range = (_start, _end, _step = 1) => {
  return Array.from(Array.from(Array(Math.ceil((_end - _start) / _step)).keys()), (x) => _start + x * _step)
}

export { parseSeconds, range, SECONDS_IN_ONE_DAY, SECONDS_IN_ONE_HOUR }
