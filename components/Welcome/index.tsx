import { useTranslations } from 'next-intl'

const Welcome = () => {
  const t = useTranslations('t')
  const nowDate = new Date()
  const hours = nowDate.getHours()

  // Define message based on the time of day
  function getGreetingByHour(hour: number): string {
    if (hour >= 0 && hour < 4) {
      return t('welcome.welcomeBack')
    }

    if (hour >= 4 && hour < 12) {
      return t('welcome.goodMorning')
    }

    if (hour >= 12 && hour < 18) {
      return t('welcome.goodAfternoon')
    }

    return t('welcome.goodEvening')
  }
  const greeting = getGreetingByHour(hours)

  return <h1>{greeting}</h1>
}

export default Welcome
