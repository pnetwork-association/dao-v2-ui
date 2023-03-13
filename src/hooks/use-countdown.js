import { useState, useCallback, useRef, useEffect } from 'react'
import moment from 'moment'

const calculateDuration = (_eventTime) =>
  moment.duration(Math.max(_eventTime - Math.floor(Date.now() / 1000), 0), 'seconds')

const formatDuration = (_duration) => {
  let parts = []
  if (!_duration || _duration.toISOString() === 'P0D') return

  if (_duration.days() >= 1) {
    const days = Math.floor(_duration.days())
    parts.push(days + ' ' + (days > 1 ? 'days' : 'day'))
  }

  if (_duration.hours() >= 1) {
    const hours = Math.floor(_duration.hours())
    parts.push(hours + ' ' + (hours > 1 ? 'hours' : 'hour'))
  }

  if (_duration.minutes() >= 1 && parts.length < 2) {
    const minutes = Math.floor(_duration.minutes())
    parts.push(minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute'))
  }

  if (_duration.seconds() >= 1 && parts.length < 2) {
    const seconds = Math.floor(_duration.seconds())
    parts.push(seconds + ' ' + (seconds > 1 ? 'seconds' : 'second'))
  }

  return parts.join(' and ')
}

const useCountdown = ({ eventTime, interval = 1000 }) => {
  const [duration, setDuration] = useState(calculateDuration(eventTime))
  const timerRef = useRef(0)
  const timerCallback = useCallback(() => {
    setDuration(calculateDuration(eventTime))
  }, [eventTime])

  useEffect(() => {
    timerRef.current = setInterval(timerCallback, interval)

    return () => {
      clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    formattedLeft: formatDuration(duration),
    left: duration.asSeconds(),
    percentageLeft: ((duration.asSeconds() * 100) / eventTime) * 100
  }
}

export { useCountdown }
