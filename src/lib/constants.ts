import { 
  Brain, 
  Dumbbell, 
  Moon, 
  Shield, 
  Apple,
  Zap,
  LucideIcon
} from 'lucide-react'

interface CategoryStyle {
  icon: LucideIcon
  color: string
  gradient: string
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'cognitive-enhancement': {
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    gradient: 'from-purple-500/5 via-transparent'
  },
  'physical-performance': {
    icon: Dumbbell,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    gradient: 'from-blue-500/5 via-transparent'
  },
  'sleep-optimization': {
    icon: Moon,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    gradient: 'from-indigo-500/5 via-transparent'
  },
  'immune-support': {
    icon: Shield,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    gradient: 'from-yellow-500/5 via-transparent'
  },
  'energy-vitality': {
    icon: Zap,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    gradient: 'from-orange-500/5 via-transparent'
  },
  'nutrition': {
    icon: Apple,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    gradient: 'from-red-500/5 via-transparent'
  },
  'default': {
    icon: Brain,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    gradient: 'from-gray-500/5 via-transparent'
  }
} as const 