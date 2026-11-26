import axios from 'axios'
import { NextResponse } from 'next/server'

import type { ITrends } from '@/interfaces/trends'
import { getWoeid } from '@/utils/woeid'

interface TwitterTrend {
  name: string
}

interface TwitterPlaceTrends {
  trends?: TwitterTrend[]
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')

  if (!country) {
    return NextResponse.json(
      { message: 'Parâmetro COUNTRY_CODE está ausente' },
      { status: 400 }
    )
  }

  const countryWoeid = getWoeid(country)
  if (!countryWoeid) {
    return NextResponse.json(
      { message: 'Código de país não suportado' },
      { status: 400 }
    )
  }

  const legacyApiToken = process.env.TWITTER_LEGACY_API
  if (!legacyApiToken) {
    console.error('Missing TWITTER_LEGACY_API')
    return NextResponse.json(
      { message: 'Twitter API is not configured.' },
      { status: 500 }
    )
  }

  try {
    const { data } = await axios.get<TwitterPlaceTrends[]>(
      'https://api.twitter.com/1.1/trends/place.json',
      {
        params: { id: countryWoeid },
        headers: {
          Authorization: `Bearer ${legacyApiToken}`,
        },
      }
    )

    const trends =
      data[0]?.trends?.map((item) => ({
        title: item.name,
      })) ?? []

    const responsePayload: ITrends = {
      credits_title: 'X',
      credits_url: 'https://x.com/',
      data: trends,
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Error fetching legacy X trends:', {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { message: 'Error fetching data.' },
      { status: 500 }
    )
  }
}
