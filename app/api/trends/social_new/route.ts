import axios from 'axios'
import { NextResponse } from 'next/server'

import type { ITrends } from '@/interfaces/trends'
import { getWoeid } from '@/utils/woeid'

interface TwitterTrend {
  trend_name: string
}

interface TwitterTrendsResponse {
  data?: TwitterTrend[]
}

interface TwitterBearerResponse {
  access_token: string
  expires_in?: number
}

interface TwitterApiError {
  detail?: string
  title?: string
  message?: string
  errors?: { message?: string }[]
}

function getTwitterApiErrorMessage(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const error = payload as Record<string, unknown>
  for (const key of ['detail', 'title', 'message']) {
    if (typeof error[key] === 'string') {
      return error[key]
    }
  }

  const firstError = Array.isArray(error.errors) ? error.errors[0] : undefined
  if (
    typeof firstError === 'object' &&
    firstError !== null &&
    'message' in firstError &&
    typeof firstError.message === 'string'
  ) {
    return firstError.message
  }

  return undefined
}

let cachedBearerToken: { value: string; expiresAt: number } | undefined

function encodeCredential(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )
}

async function getBearerToken(
  apiKey: string,
  apiSecret: string
): Promise<string> {
  if (cachedBearerToken && cachedBearerToken.expiresAt > Date.now()) {
    return cachedBearerToken.value
  }

  const credentials = `${encodeCredential(apiKey)}:${encodeCredential(apiSecret)}`
  const { data } = await axios.post<TwitterBearerResponse>(
    'https://api.x.com/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(credentials).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    }
  )

  if (!data.access_token) {
    throw new Error('X did not return an app-only access token.')
  }

  const lifetimeMs =
    typeof data.expires_in === 'number' && data.expires_in > 0
      ? Math.max(data.expires_in - 60, 1) * 1000
      : 60 * 60 * 1000

  cachedBearerToken = {
    value: data.access_token,
    expiresAt: Date.now() + lifetimeMs,
  }

  return data.access_token
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

  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_KEY_SECRET
  if (!apiKey || !apiSecret) {
    console.error(
      'Missing X app-only credentials: TWITTER_API_KEY and TWITTER_API_KEY_SECRET'
    )
    return NextResponse.json(
      { message: 'Twitter API is not configured.' },
      { status: 500 }
    )
  }

  let requestStage: 'token' | 'trends' = 'token'

  try {
    const bearerToken = await getBearerToken(apiKey, apiSecret)
    requestStage = 'trends'

    const response = await fetch(
      `https://api.x.com/2/trends/by/woeid/${countryWoeid}`,
      {
        cache: 'force-cache',
        next: { revalidate: 600 },
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorPayload: unknown = await response.json().catch(() => undefined)
      const upstreamMessage =
        getTwitterApiErrorMessage(errorPayload) || response.statusText

      console.error('X trends API request failed', {
        status: response.status,
        message: upstreamMessage,
      })

      return NextResponse.json(
        {
          message: 'X trends API request failed.',
          requestStage,
          upstreamStatus: response.status,
          ...(upstreamMessage ? { details: upstreamMessage } : {}),
        },
        { status: 502 }
      )
    }

    const data = (await response.json()) as TwitterTrendsResponse
    const trends = data.data?.map((item) => ({ title: item.trend_name })) ?? []

    const responsePayload: ITrends = {
      credits_title: 'X',
      credits_url: 'https://x.com/',
      data: trends,
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    if (axios.isAxiosError<TwitterApiError>(error)) {
      const upstreamMessage = getTwitterApiErrorMessage(error.response?.data)
      const message = 'X app-only token request failed.'

      console.error(message, {
        status: error.response?.status,
        message: upstreamMessage ?? error.message,
      })

      return NextResponse.json(
        {
          message,
          ...(error.response?.status
            ? { upstreamStatus: error.response.status }
            : {}),
          ...(upstreamMessage ? { details: upstreamMessage } : {}),
        },
        { status: 502 }
      )
    }

    console.error(
      requestStage === 'token'
        ? 'Error fetching X app-only token:'
        : 'Error fetching X trends:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      {
        message:
          requestStage === 'token'
            ? 'Error fetching X app-only token.'
            : 'X trends API request failed.',
        requestStage,
      },
      { status: requestStage === 'token' ? 500 : 502 }
    )
  }
}
