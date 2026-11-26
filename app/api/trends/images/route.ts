import axios from 'axios'
import { NextResponse } from 'next/server'

import type { ITrends, ITrendsItem } from '@/interfaces/trends'

interface UnsplashTopic {
  title?: string
  cover_photo?: {
    links?: { html?: string }
    urls?: { small?: string }
    user?: {
      name?: string
      links?: { html?: string }
    }
  }
}

const unsplashReferralUrl =
  'https://unsplash.com/?utm_source=aspiral&utm_medium=referral'

function addUnsplashReferral(url: string): string | undefined {
  try {
    const referralUrl = new URL(url)
    if (
      referralUrl.protocol !== 'https:' ||
      !['unsplash.com', 'www.unsplash.com'].includes(referralUrl.hostname)
    ) {
      return undefined
    }

    referralUrl.searchParams.set('utm_source', 'aspiral')
    referralUrl.searchParams.set('utm_medium', 'referral')
    return referralUrl.toString()
  } catch {
    return undefined
  }
}

export async function GET(): Promise<NextResponse> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY')
    return NextResponse.json(
      { message: 'Unsplash API is not configured.' },
      { status: 500 }
    )
  }

  try {
    const { data } = await axios.get<UnsplashTopic[]>(
      'https://api.unsplash.com/topics',
      {
        params: {
          client_id: accessKey,
          per_page: 20,
          order_by: 'featured',
        },
      }
    )

    const formattedData: ITrendsItem[] = data.flatMap((topic) => {
      const image = topic.cover_photo?.urls?.small
      const author = topic.cover_photo?.user?.name
      const authorUrlValue = topic.cover_photo?.user?.links?.html
      const photoUrlValue = topic.cover_photo?.links?.html
      const authorUrl = authorUrlValue
        ? addUnsplashReferral(authorUrlValue)
        : undefined
      const photoUrl = photoUrlValue
        ? addUnsplashReferral(photoUrlValue)
        : undefined

      if (!topic.title || !image || !author || !authorUrl || !photoUrl) {
        return []
      }

      return [{ title: topic.title, image, author, authorUrl, photoUrl }]
    })

    const response: ITrends = {
      credits_title: 'Unsplash',
      credits_url: unsplashReferralUrl,
      data: formattedData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching Unsplash topics:', {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { message: 'Error fetching image data.' },
      { status: 502 }
    )
  }
}
