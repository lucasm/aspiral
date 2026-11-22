import axios from 'axios'
import { NextResponse } from 'next/server'

import { ITrends } from '../../../../interfaces/trends'

interface NearbyPlace {
  id: string
  displayName: { text: string }
  googleMapsUri?: string
  photos?: { name: string }[]
  rating?: number
  userRatingCount?: number
}

interface NearbySearchResponse {
  places?: NearbyPlace[]
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const latitude = searchParams.get('latitude')
  const longitude = searchParams.get('longitude')
  const language = searchParams.get('language')

  const parsedLatitude = latitude === null ? Number.NaN : Number(latitude)
  const parsedLongitude = longitude === null ? Number.NaN : Number(longitude)

  if (
    !Number.isFinite(parsedLatitude) ||
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    !Number.isFinite(parsedLongitude) ||
    parsedLongitude < -180 ||
    parsedLongitude > 180 ||
    !language
  ) {
    return NextResponse.json(
      {
        message:
          'Valid latitude, longitude, and language parameters are required.',
        latitude,
        longitude,
        language,
      },
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
    const { data } = await axios.post<NearbySearchResponse>(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        languageCode: language,
        locationRestriction: {
          circle: {
            center: {
              latitude: parsedLatitude,
              longitude: parsedLongitude,
            },
            radius: 5000,
          },
        },
        maxResultCount: 20,
        rankPreference: 'POPULARITY',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.googleMapsUri,places.photos,places.rating,places.userRatingCount',
        },
      }
    )

    const trends = (data.places ?? []).map((place) => ({
      title: place.displayName.text,
      url:
        place.googleMapsUri ??
        `https://www.google.com/maps/place/?q=place_id:${place.id}`,
      image: place.photos?.[0]
        ? `/api/trends/local/photo?name=${encodeURIComponent(place.photos[0].name)}`
        : undefined,
      photos: place.photos?.map(({ name }) => ({ name })),
      rating: place.rating,
      userRatingCount: place.userRatingCount,
    }))

    const responsePayload: ITrends = {
      credits_title: 'Google Maps',
      credits_url: 'https://maps.google.com',
      data: trends,
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { message: 'Error fetching data', error },
      { status: 500 }
    )
  }
}
