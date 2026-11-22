interface Props {
  category: string
}

const BlurBackground = ({ category }: Readonly<Props>) => {
  let background: string

  switch (category) {
    case 'Tech':
    case 'Apps':
    case 'Code':
    case 'Torrent':
    case 'Web':
    case 'AI':
    case 'Darknet':
      background = 'bg-[var(--color-blue)]'
      break
    case 'News':
    case 'Fact-Check':
      background = 'bg-[var(--color-red)]'
      break
    case 'Business':
    case 'Job':
    case 'Startups':
      background = 'bg-[var(--color-green)]'
      break
    case 'Sport':
    case 'Legal':
      background = 'bg-[var(--color-yellow)]'
      break
    case 'Culture':
    case 'Music':
    case 'Image':
    case 'Videos':
    case 'Games':
      background = 'bg-[var(--color-purple)]'
      break
    case 'Celebrity':
      background = 'bg-[var(--color-pink)]'
      break
    case 'Shopping':
    case 'Social':
      background = 'bg-[var(--color-orange)]'
      break
    case 'Local':
      background = 'bg-[var(--color-blueocean)]'
      break
    case 'Academic':
    case 'Science':
    case 'Health':
      background = 'bg-[var(--color-cyan)]'
      break
    default:
      background =
        'bg-[linear-gradient(270deg,var(--color-red)_14%,var(--color-orange)_28%,var(--color-yellow)_42%,var(--color-green)_56%,var(--color-blue)_70%,var(--color-purple)_84%,var(--color-pink)_98%)]'
  }

  return (
    <div
      className={`
        fixed -top-4 left-1/2 -translate-x-1/2 -z-10

        w-[90%] h-[60%] rounded-full blur-xl md:blur-2xl opacity-90

        ${background}
        `}></div>
  )
}

export default BlurBackground
