import type { ComponentType } from 'react'
import {
  AtSign,
  SquarePlay,
  Globe,
  Handbag,
  Music,
  Image,
  type LucideIcon,
  GraduationCap,
  ChartNoAxesCombined,
  Landmark,
  Package,
  ArrowDownToLine,
  Gamepad2,
  Briefcase,
  Code,
  MapPin,
  Hexagon,
  Rss,
  Astroid,
  SquareDashed,
  Trophy,
  Star,
  Heart,
  Martini,
  Cpu,
  Atom,
  Asterisk,
  CircleCheckBig,
  Rocket,
} from 'lucide-react'

type CategoryIconComponent = ComponentType<any> | LucideIcon

export const getCategoryIcon = (
  categoryName: string
): CategoryIconComponent => {
  switch (categoryName) {
    case 'Home':
      return Asterisk
    case 'AI':
      return Astroid
    case 'Web':
      return Globe
    case 'Image':
      return Image
    case 'Videos':
      return SquarePlay
    case 'Music':
      return Music
    case 'Social':
      return AtSign
    case 'Local':
      return MapPin
    case 'Academic':
      return GraduationCap
    case 'Shopping':
      return Handbag
    case 'News':
      return Rss
    case 'Job':
      return Briefcase
    case 'Code':
      return Code
    case 'Legal':
      return Landmark
    case 'Apps':
      return Package
    case 'Business':
      return ChartNoAxesCombined
    case 'Games':
      return Gamepad2
    case 'Torrent':
      return ArrowDownToLine
    case 'Darknet':
      return Hexagon
    case 'Sport':
      return Trophy
    case 'Science':
      return Atom
    case 'Celebrity':
      return Martini
    case 'Culture':
      return Star
    case 'Health':
      return Heart
    case 'Tech':
      return Cpu
    case 'Fact-Check':
      return CircleCheckBig
    case 'Startups':
      return Rocket
    default:
      return SquareDashed
  }
}
