import axios from 'axios'
import { NextResponse } from 'next/server'

interface PhotoMediaResponse {
  photoUri: string
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (name === null || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
    return NextResponse.json(
      { message: 'A valid photo name is required.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_MAPS_PLACES_API_KEY
  if (!apiKey) {
    console.error('Missing GOOGLE_MAPS_PLACES_API_KEY')
    return NextResponse.json(
      { message: 'Places API is not configured.' },
      { status: 500 }
    )
  }

  try {
    const encodedName = name.split('/').map(encodeURIComponent).join('/')
    const { data: photo } = await axios.get<PhotoMediaResponse>(
      `https://places.googleapis.com/v1/${encodedName}/media`,
      {
        params: { maxWidthPx: 400, skipHttpRedirect: true },
        headers: { 'X-Goog-Api-Key': apiKey },
      }
    )

    const photoUrl = new URL(photo.photoUri)
    if (
      photoUrl.protocol !== 'https:' ||
      (photoUrl.hostname !== 'googleusercontent.com' &&
        !photoUrl.hostname.endsWith('.googleusercontent.com'))
    ) {
      return NextResponse.json(
        { message: 'Places API returned an invalid photo URL.' },
        { status: 502 }
      )
    }

    const { data, headers } = await axios.get<ArrayBuffer>(photoUrl.href, {
      responseType: 'arraybuffer',
      maxRedirects: 0,
    })
    const contentType = headers['content-type']
    if (typeof contentType !== 'string' || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Places API returned invalid photo data.' },
        { status: 502 }
      )
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Error fetching place photo:', error)
    return NextResponse.json(
      { message: 'Error fetching place photo.' },
      { status: 502 }
    )
  }
}
