import { Button } from '@mantine/core'

type Props = {
  readonly onClick: () => void
  readonly feedName?: string
  readonly errorMessage?: string
  readonly showFeedback?: boolean
}

const FEEDBACK_EMAIL = 'feedback@aspiral.app'

export default function ButtonRetry({ onClick, feedName, errorMessage, showFeedback = false }: Props) {
  const feedbackSubject = encodeURIComponent(`Error on feed: ${feedName || 'unknown'}`)
  const feedbackBody = encodeURIComponent(`Hey,\n\nFeed "${feedName}" error.\n\n${errorMessage || 'unknown'}\n\nThanks!`)
  const mailtoLink = `mailto:${FEEDBACK_EMAIL}?subject=${feedbackSubject}&body=${feedbackBody}`

  return (
    <span>
      <p style={{ color: 'white' }}>{errorMessage || 'Error: UNKNOWN_ERROR'}</p>

      <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button variant="outline" size="md" onClick={onClick} color="white">
          ↻ Reload
        </Button>

        {showFeedback && (
          <Button component="a" href={mailtoLink} variant="transparent" size="md" color="black">
            Feedback
          </Button>
        )}
      </span>
    </span>
  )
}
