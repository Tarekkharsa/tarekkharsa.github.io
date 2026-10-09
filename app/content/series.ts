import type { Codebase, FinalePost, LessonPost, Round } from './types.ts'

export const series = {
  /** The hub's URL is already shared: it keeps the series' first name. */
  slug: 'guess-the-codebase',
  name: 'Lessons from great codebases',
  /** Used on X, where the guessing game still runs (see projects/). */
  hashtag: '#GuessTheCodebase',
} as const

export const LESSONS_PER_ROUND = 8

export interface LessonInput {
  /** Must start with the round's slug prefix, e.g. gtc2-03-... */
  slug: string
  lesson: number
  title: string
  subtitle: string
  tag: string
  readMinutes: number
  problem: string
  idea: string
  sources: string[]
  prompt: string
}

export interface RoundInput {
  number: number
  /** Publication date of every page in the round, YYYY-MM-DD. */
  date: string
  /** Lesson slugs and OG images start with this, e.g. gtc2 -> gtc2-01-..., gtc2-01.png. */
  slugPrefix: string
  codebase: Codebase
  pitch: string
  lessons: LessonInput[]
  finale: Omit<FinalePost, 'kind' | 'round' | 'date' | 'indexed'>
}

/**
 * Builds a round's posts from the parts that differ per lesson. Descriptions, OG images,
 * share text and feed entries all follow from the codebase and the lesson number.
 */
export function defineRound(input: RoundInput): Round {
  let { number, date, slugPrefix, codebase } = input
  let lessonLabel = (n: number) => `Lesson ${n} of ${LESSONS_PER_ROUND} from ${codebase.name}`

  if (input.lessons.length !== LESSONS_PER_ROUND) {
    throw new Error(`Round ${number} has ${input.lessons.length} lessons, expected ${LESSONS_PER_ROUND}`)
  }

  let lessons: LessonPost[] = input.lessons.map((lesson, index) => {
    let n = lesson.lesson
    if (n !== index + 1) throw new Error(`Round ${number}: lesson ${n} is in position ${index + 1}`)
    if (!lesson.slug.startsWith(`${slugPrefix}-0${n}-`)) {
      throw new Error(`Round ${number}: slug ${lesson.slug} must start with ${slugPrefix}-0${n}-`)
    }
    return {
      ...lesson,
      kind: 'lesson',
      round: number,
      description: `${lesson.subtitle} ${lessonLabel(n)}, with links to the source.`,
      date,
      image: {
        path: `/assets/og/${slugPrefix}-0${n}.png`,
        alt: `${lessonLabel(n)}: ${lesson.title}`,
      },
      shareText: `${lesson.title}: an engineering lesson from ${codebase.name}'s source.`,
      indexed: true,
      feed: {
        title: `${codebase.name} #${n}: ${lesson.title}`,
        summary: lesson.subtitle,
      },
    }
  })

  let finale: FinalePost = {
    ...input.finale,
    kind: 'finale',
    round: number,
    date,
    indexed: true,
  }

  return { number, codebase, pitch: input.pitch, lessons, finale }
}
