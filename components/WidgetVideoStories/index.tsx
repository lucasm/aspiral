'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import { ChevronLeft, ChevronRight, Play, TriangleAlert, X } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import styles from './WidgetVideoStories.module.css'
import type { ISearchCategory } from '@/interfaces/search'

interface VideoItem {
  author: string
  title: string
  image: string
  url: string
  channelName?: string
  views?: number
}

interface VideoByChannel {
  channelName: string
  author: string
  videos: VideoItem[]
}

interface ChannelError {
  channel: string
  error: string
}

interface Props {
  locale: string
  category: ISearchCategory
}

const WidgetVideoStories = ({ locale, category }: Readonly<Props>) => {
  const channels = useMemo(
    () =>
      category.data
        .flatMap((source) => [source, ...(source.child ?? [])])
        .filter(
          (source) =>
            typeof source.videoYoutubeId === 'string' &&
            source.videoYoutubeId.trim().length > 0
        ),
    [category.data]
  )
  const [videosByChannel, setVideosByChannel] = useState<VideoByChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channelErrors, setChannelErrors] = useState<ChannelError[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const videoPlayerRef = useRef<HTMLDivElement | null>(null)
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [canGoPrevious, setCanGoPrevious] = useState(false)
  const [canGoNext, setCanGoNext] = useState(true)

  const updateNavigationState = useCallback((swiper: SwiperInstance) => {
    setCanGoPrevious(!swiper.isBeginning)
    setCanGoNext(!swiper.isEnd)
  }, [])

  useEffect(() => {
    if (channels.length === 0) {
      setVideosByChannel([])
      setError(null)
      setChannelErrors([])
      setLoading(false)
      return
    }

    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        setChannelErrors([])

        const response = await fetch(
          `/api/feedVideo?locale=${encodeURIComponent(locale)}&category=${encodeURIComponent(category.name)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }

        const data = await response.json()
        const videos = data.data || []
        const errors = data.errors || []

        // Store channel errors for display
        setChannelErrors(errors)

        // Group videos by channel
        const grouped: { [key: string]: VideoByChannel } = {}

        videos.forEach((video: VideoItem) => {
          const channel = video.channelName || video.author
          if (!grouped[channel]) {
            grouped[channel] = {
              channelName: channel,
              author: video.author,
              videos: [],
            }
          }
          grouped[channel].videos.push(video)
        })

        setVideosByChannel(Object.values(grouped))
      } catch (err) {
        console.error('Error fetching videos:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [channels, locale, category.name])

  const scrollToVideo = useCallback(() => {
    if (videoPlayerRef.current) {
      const topPosition =
        videoPlayerRef.current.getBoundingClientRect().top + window.scrollY - 16
      window.scrollTo({ top: topPosition, behavior: 'smooth' })
    }
  }, [])

  const handleVideoClick = useCallback(
    (videoId: string) => {
      setSelectedVideoId(videoId)
      setTimeout(() => {
        scrollToVideo()
      }, 100)
    },
    [scrollToVideo]
  )

  const closeVideo = useCallback(() => {
    setSelectedVideoId(null)
  }, [])

  // Don't render if loading, error, or no videos
  if (loading || error || videosByChannel.length === 0) return null

  return (
    <section className={styles.widget}>
      {channelErrors.length > 0 && (
        <div className={styles.errorsContainer}>
          <div className={styles.errorTitle}>
            <TriangleAlert aria-hidden="true" />
            Some sources had issues:
          </div>
          <ul className={styles.errorsList}>
            {channelErrors.map((err, idx) => (
              <li key={idx} className={styles.errorItem}>
                <strong>{err.channel}:</strong> {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedVideoId && (
        <div className={styles.playerContainer} ref={videoPlayerRef}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeVideo}
            aria-label="Close video">
            <X aria-hidden="true" />
          </button>
          <div className={styles.videoPlayer}>
            <iframe
              title={`YouTube video ${selectedVideoId}`}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className={styles.carouselContainer}>
        <Swiper
          modules={[Pagination]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            updateNavigationState(swiper)
          }}
          onSlideChange={updateNavigationState}
          onResize={updateNavigationState}
          onBreakpoint={updateNavigationState}
          spaceBetween={12}
          slidesPerView={1.2}
          breakpoints={{
            280: { slidesPerView: 2.5, spaceBetween: 12 },
            768: { slidesPerView: 3.5, spaceBetween: 14 },
            1200: { slidesPerView: 4.5, spaceBetween: 16 },
          }}
          pagination={{ clickable: true }}
          className={styles.swiperContainer}>
          {videosByChannel.map((channel) => (
            <SwiperSlide key={channel.channelName} className={styles.slide}>
              <div className={styles.channelGroup}>
                <div className={styles.channelName}>{channel.channelName}</div>
                <ul className={styles.videosList}>
                  {channel.videos.map((video) => (
                    <li key={video.url} className={styles.videoItem}>
                      <button
                        type="button"
                        className={styles.videoButton}
                        onClick={() => handleVideoClick(video.url)}>
                        <img
                          src={video.image}
                          alt={video.title}
                          className={styles.videoThumbnail}
                          loading="lazy"
                        />
                        <div className={styles.overlay}>
                          <div className={styles.playIcon}>
                            <Play aria-hidden="true" fill="currentColor" />
                          </div>
                        </div>
                        <p className={styles.videoTitle}>{video.title}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className={`${styles.navigationButton} ${styles.navigationPrevious}`}
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={!canGoPrevious}
          aria-label="Previous videos">
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.navigationButton} ${styles.navigationNext}`}
          onClick={() => swiperRef.current?.slideNext()}
          disabled={!canGoNext}
          aria-label="Next videos">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default WidgetVideoStories
