import {
  CircleFadingPlay,
  History,
  Languages,
  LucideIcon,
  Mic,
  PersonStanding,
  Rss,
  ScanSearch,
  Search,
  ShieldCheck,
  TextWrap,
  TrendingUp,
} from 'lucide-react'
import Style from './CardsFeat.module.css'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  status?: string
}

const features: Feature[] = [
  {
    icon: Search,
    title: 'Decentralized Search',
    description:
      'Search across multiple sources at once and choose the algorithms you rely on.',
  },
  {
    icon: Rss,
    title: 'News Feed',
    description: 'Follow trusted news sources chosen by the community.',
  },
  {
    icon: CircleFadingPlay,
    title: 'Videos Feed',
    description: 'Discover the latest videos and reactions.',
  },
  {
    icon: TrendingUp,
    title: 'Trends',
    description: 'See what is trending near you in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Search Source Info',
    description:
      'Compare estimated privacy, security, and carbon-footprint levels for each search source.',
  },
  {
    icon: History,
    title: 'Search History',
    description:
      'Your 10 most recent searches stay stored locally on your device.',
  },
  {
    icon: TextWrap,
    title: 'Autocomplete',
    description: 'Get helpful search suggestions as you type.',
  },
  {
    icon: Mic,
    title: 'Voice Search',
    description: 'Search hands-free using your voice.',
  },
  {
    icon: ScanSearch,
    title: 'Reverse Search',
    description: 'Search supported sources using an image or file.',
    status: 'COMING SOON',
  },
  {
    icon: Languages,
    title: 'Internationalization',
    description:
      'Choose local sources or explore search sources from around the world.',
  },
  {
    icon: PersonStanding,
    title: 'Accessibility',
    description:
      'Use dark or light themes, clear contrast, keyboard navigation, and screen-reader support.',
  },
]

export default function CardsFeat() {
  return (
    <div className={Style.container}>
      <h2>Search on your terms</h2>
      <p>
        Explore trusted sources, stay in control of how you search, and make
        informed choices.
      </p>

      <ul className={Style.card}>
        {features.map((feature) => (
          <li key={feature.title}>
            <figure aria-hidden="true">
              <feature.icon />
            </figure>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            {feature.status && (
              <span className={Style.status}>{feature.status}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
