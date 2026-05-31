'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './WidgetVideoStories.module.css'

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
  category: string
}

const WidgetVideoStories = ({ locale, category }: Readonly<Props>) => {
  const t = useTranslations()
  const [videosByChannel, setVideosByChannel] = useState<VideoByChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channelErrors, setChannelErrors] = useState<ChannelError[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const videoPlayerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        setChannelErrors([])

        const response = await fetch(`/api/videos?locale=${encodeURIComponent(locale)}&category=${encodeURIComponent(category)}`)

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
  }, [locale, category])

  const scrollToVideo = useCallback(() => {
    if (videoPlayerRef.current) {
      const topPosition = videoPlayerRef.current.getBoundingClientRect().top + window.scrollY - 80
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
          <div className={styles.errorTitle}>⚠️ Some sources had issues:</div>
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
          <button type="button" className={styles.closeButton} onClick={closeVideo} aria-label="Close video">
            ✕
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

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={12}
        slidesPerView={1.2}
        breakpoints={{
          280: { slidesPerView: 2.1, spaceBetween: 12 },
          768: { slidesPerView: 3.5, spaceBetween: 14 },
          1200: { slidesPerView: 4.5, spaceBetween: 16 },
        }}
        navigation
        pagination={{ clickable: true }}
        className={styles.swiperContainer}>
        {videosByChannel.map((channel) => (
          <SwiperSlide key={channel.channelName} className={styles.slide}>
            <div className={styles.channelGroup}>
              <div className={styles.channelName}>{channel.channelName}</div>
              <ul className={styles.videosList}>
                {channel.videos.map((video) => (
                  <li key={video.url} className={styles.videoItem}>
                    <button type="button" className={styles.videoButton} onClick={() => handleVideoClick(video.url)}>
                      <img src={video.image} alt={video.title} className={styles.videoThumbnail} loading="lazy" />
                      <div className={styles.overlay}>
                        <div className={styles.playIcon}>▶</div>
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
    </section>
  )
}

export default WidgetVideoStories
