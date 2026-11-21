import Styles from './ButtonRetry.module.css'

type Props = {
  readonly onClick: () => void
  readonly feedName?: string
  readonly errorMessage?: string
  readonly showFeedback?: boolean
}

const FEEDBACK_EMAIL = 'feedback@aspiral.app'

export default function ButtonRetry({
  onClick,
  feedName,
  errorMessage,
  showFeedback = false,
}: Props) {
  const feedbackSubject = encodeURIComponent(
    `Error on feed: ${feedName || 'unknown'}`
  )
  const feedbackBody = encodeURIComponent(
    `Hey,\n\nFeed "${feedName}" error.\n\n${errorMessage || 'unknown'}\n\nThanks!`
  )
  const mailtoLink = `mailto:${FEEDBACK_EMAIL}?subject=${feedbackSubject}&body=${feedbackBody}`

  return (
    <span>
      <p className={Styles.error}>{errorMessage || 'Error: UNKNOWN_ERROR'}</p>

      <span className={Styles.actions}>
        <button className={Styles.retry} type="button" onClick={onClick}>
          ↻ Reload
        </button>

        {showFeedback && (
          <a className={Styles.feedback} href={mailtoLink}>
            Feedback
          </a>
        )}
      </span>
    </span>
  )
}
