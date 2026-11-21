import { JSX } from 'react'

import Style from './CardsFeat.module.css'
import { IconText } from '../SvgIcons'
import {
  CircleDashed,
  Earth,
  GitBranch,
  Languages,
  Mic,
  PersonStanding,
  ScanSearch,
  Search,
  Shield,
  TrendingUp,
} from 'lucide-react'

// Define the type for a feature item
interface Feature {
  icon: JSX.Element
  title: string
  description: string
}

// Create an array of feature items with their types
const features: Feature[] = [
  {
    icon: <Search />,
    title: 'Search decentralized',
    description:
      'Search the same term on multiple sources. Chose your algorithm.',
  },
  {
    icon: <Shield />,
    title: 'Safe sources',
    description:
      'The most popular sources of the internet. You can check privacy, security and carbon footprint levels.',
  },
  {
    icon: <TrendingUp />,
    title: 'Trending content',
    description: 'Real-time trends nearby you.',
  },
  {
    icon: <CircleDashed />,
    title: 'Newest stories',
    description: 'Discover new and breaking stories.',
  },
  {
    icon: <IconText />,
    title: 'Autocomplete',
    description: 'Get automatic suggestions of terms as you type.',
  },
  {
    icon: <Mic />,
    title: 'Search by voice',
    description: 'Use your voice to search anywhere.',
  },
  {
    icon: <ScanSearch />,
    title: 'Search by reverse*',
    description:
      'Upload documents and photos to reverse search on supported sources.',
  },
  {
    icon: <Languages />,
    title: 'Languages',
    description: 'Available with 4 international versions.',
  },
  {
    icon: <PersonStanding />,
    title: 'Accessibility by default',
    description:
      'Dark and light theme, balanced contrast, screen readers support, and keyboard navigation.',
  },
  {
    icon: <GitBranch />,
    title: 'Open source',
    description: 'Source code is open for contributions.',
  },
  {
    icon: <Earth />,
    title: 'Carbon neutral software',
    description: 'Our software do not use servers with high emissions.',
  },
]

export default function CardsFeat() {
  return (
    <div className={Style.container}>
      <h2>Top features</h2>

      <ul className={Style.card}>
        {features.map((feature, index) => (
          <li key={index}>
            <figure>{feature.icon}</figure>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>

      <p>* Some features in development.</p>
    </div>
  )
}
