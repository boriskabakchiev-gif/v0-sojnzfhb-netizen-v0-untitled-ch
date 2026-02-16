"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface BannerSettings {
  start_date: string
  end_date: string
  message: string
  is_visible: boolean
}

export function HolidayBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [settings, setSettings] = useState<BannerSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/banner-settings")
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          // Only show banner if settings say it should be visible
          if (data.is_visible) {
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.error("Failed to fetch banner settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.height = "100%"
    }
    setTimeout(() => setIsAnimating(true), 100)

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.height = ""
    }
  }, [isVisible])

  if (isLoading || !isVisible || !settings) return null

  const displayMessage = settings.message
    .replace("{start_date}", settings.start_date)
    .replace("{end_date}", settings.end_date)

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => {
        setIsAnimating(false)
        setTimeout(() => setIsVisible(false), 300)
      }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Banner Container */}
      <div
        className={`relative w-[95vw] h-[85vh] bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-2xl overflow-hidden transition-transform duration-700 ${
          isAnimating ? "scale-100 rotate-0" : "scale-50 rotate-12"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated snowflakes background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 text-white animate-pulse">❄</div>
          <div className="absolute top-20 right-20 w-24 h-24 text-white animate-pulse animation-delay-200">❄</div>
          <div className="absolute bottom-20 left-32 w-28 h-28 text-white animate-pulse animation-delay-400">❄</div>
          <div className="absolute bottom-32 right-40 w-36 h-36 text-white animate-pulse animation-delay-600">❄</div>
          <div className="absolute top-40 left-1/2 w-20 h-20 text-white animate-pulse animation-delay-300">❄</div>
        </div>

        {/* Top decorative stripe */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-green-600 via-red-600 to-green-600"></div>

        {/* Bottom decorative stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-green-600 via-red-600 to-green-600"></div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(() => setIsVisible(false), 300)
          }}
          className="absolute top-6 right-6 z-10 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 group"
          aria-label="Затвори"
        >
          <X className="h-8 w-8 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-8 md:px-16">
          {/* Bell icon animation */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              isAnimating ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
            }`}
          >
            <div className="text-9xl animate-swing">🔔</div>
          </div>

          {/* Main title */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white text-center mb-12 transition-all duration-1000 delay-200 ${
              isAnimating ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
          >
            <span className="block mb-2 text-yellow-300 drop-shadow-2xl">ВАЖНО СЪОБЩЕНИЕ!</span>
          </h1>

          {/* Message with dates */}
          <div
            className={`bg-yellow-400 text-red-900 px-8 py-6 transform rotate-1 shadow-2xl max-w-4xl transition-all duration-1000 delay-400 ${
              isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
          >
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center uppercase">
              {displayMessage}
            </p>
          </div>

          {/* Emoji decoration */}
          <div
            className={`mt-8 flex gap-6 text-6xl transition-all duration-1000 delay-800 ${
              isAnimating ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            }`}
          >
            <span className="animate-bounce">🎄</span>
            <span className="animate-bounce animation-delay-200">🎅</span>
            <span className="animate-bounce animation-delay-400">🎁</span>
          </div>

          {/* Additional info */}
          <p
            className={`mt-8 text-xl sm:text-2xl md:text-3xl text-white/90 text-center max-w-3xl transition-all duration-1000 delay-1000 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
          >
            Приятни празници и успешна Нова година! 🎉
          </p>

          {/* Click to close hint */}
          <p className="mt-12 text-lg text-white/70 text-center animate-pulse">Кликнете навсякъде, за да затворите</p>
        </div>

        {/* Animated border glow */}
        <div className="absolute inset-0 border-8 border-yellow-400 pointer-events-none animate-pulse"></div>
      </div>

      <style jsx>{`
        @keyframes swing {
          0%,
          100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  )
}
