"use client"

import { useState, useRef, useEffect } from "react"
import { X, Sparkles, Gift, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WheelSegment {
  label: string
  color: string
  textColor: string
}

const segments: WheelSegment[] = [
  { label: "5% отстъпка", color: "#1a1a2e", textColor: "#fbbf24" },
  { label: "Нямаш късмет!", color: "#f8f9fa", textColor: "#1a1a2e" },
  { label: "10% отстъпка", color: "#1a1a2e", textColor: "#fbbf24" },
  { label: "Безплатна доставка", color: "#f8f9fa", textColor: "#1a1a2e" },
  { label: "Нямаш късмет!", color: "#1a1a2e", textColor: "#fbbf24" },
  { label: "15% отстъпка", color: "#f8f9fa", textColor: "#1a1a2e" },
  { label: "5% отстъпка", color: "#1a1a2e", textColor: "#fbbf24" },
  { label: "Нямаш късмет!", color: "#f8f9fa", textColor: "#1a1a2e" },
]

export function FortuneWheel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [hasSpun, setHasSpun] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Check if user has already spun today
  useEffect(() => {
    const lastSpin = localStorage.getItem("fortuneWheelLastSpin")
    if (lastSpin) {
      const lastSpinDate = new Date(lastSpin)
      const now = new Date()
      if (lastSpinDate.toDateString() === now.toDateString()) {
        setHasSpun(true)
      }
    }
    
    // Auto-open after 3 seconds if not spun today
    const timer = setTimeout(() => {
      if (!hasSpun) {
        setIsOpen(true)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [hasSpun])

  const spinWheel = () => {
    if (!email || isSpinning || hasSpun) return

    setIsSpinning(true)
    setResult(null)

    // Calculate random spin
    const segmentAngle = 360 / segments.length
    const randomSegment = Math.floor(Math.random() * segments.length)
    const extraSpins = 5 + Math.floor(Math.random() * 3) // 5-7 full rotations
    const targetRotation = extraSpins * 360 + (360 - randomSegment * segmentAngle - segmentAngle / 2)
    
    setRotation(prev => prev + targetRotation)

    // Show result after spin animation
    setTimeout(() => {
      setIsSpinning(false)
      setResult(segments[randomSegment].label)
      setHasSpun(true)
      localStorage.setItem("fortuneWheelLastSpin", new Date().toISOString())
      
      // Show confetti for winning results
      if (!segments[randomSegment].label.includes("Нямаш")) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }, 5000)
  }

  const segmentAngle = 360 / segments.length

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 group"
          aria-label="Отвори колелото на късмета"
        >
          <div className="relative">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full bg-amber-400 animate-pulse opacity-40" />
            
            {/* Main button */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Gift className="w-7 h-7 text-white" />
            </div>
            
            {/* Badge */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              !
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Завърти за награда!
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-gray-900" />
          </div>
        </button>
      )}

      {/* Modal overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSpinning) {
              setIsOpen(false)
            }
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" />
          
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'][Math.floor(Math.random() * 5)],
                    width: `${8 + Math.random() * 8}px`,
                    height: `${8 + Math.random() * 8}px`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  }}
                />
              ))}
            </div>
          )}

          {/* Modal content */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Close button */}
            <button
              onClick={() => !isSpinning && setIsOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
              disabled={isSpinning}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="relative flex flex-col lg:flex-row items-center gap-8 p-6 md:p-10">
              {/* Wheel section */}
              <div className="relative flex-shrink-0">
                {/* Outer glow */}
                <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-20 blur-xl animate-pulse" />
                
                {/* Wheel container */}
                <div className="relative">
                  {/* Pointer */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                      <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-lg" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg" style={{ top: '2px' }} />
                    </div>
                  </div>

                  {/* Outer ring with metallic effect */}
                  <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full p-3 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-2xl">
                    {/* Inner shadow ring */}
                    <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-inner">
                      {/* Wheel */}
                      <div
                        ref={wheelRef}
                        className="w-full h-full rounded-full overflow-hidden shadow-inner relative"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                        }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {segments.map((segment, index) => {
                            const startAngle = index * segmentAngle - 90
                            const endAngle = (index + 1) * segmentAngle - 90
                            const startRad = (startAngle * Math.PI) / 180
                            const endRad = (endAngle * Math.PI) / 180
                            const x1 = 50 + 50 * Math.cos(startRad)
                            const y1 = 50 + 50 * Math.sin(startRad)
                            const x2 = 50 + 50 * Math.cos(endRad)
                            const y2 = 50 + 50 * Math.sin(endRad)
                            const largeArc = segmentAngle > 180 ? 1 : 0

                            // Text position
                            const midAngle = startAngle + segmentAngle / 2
                            const textRad = (midAngle * Math.PI) / 180
                            const textX = 50 + 32 * Math.cos(textRad)
                            const textY = 50 + 32 * Math.sin(textRad)

                            return (
                              <g key={index}>
                                <path
                                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={segment.color}
                                  stroke="#d4a574"
                                  strokeWidth="0.3"
                                />
                                <text
                                  x={textX}
                                  y={textY}
                                  fill={segment.textColor}
                                  fontSize="3.5"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                  style={{ fontFamily: 'system-ui, sans-serif' }}
                                >
                                  {segment.label.split(' ').map((word, i) => (
                                    <tspan key={i} x={textX} dy={i === 0 ? 0 : 4}>
                                      {word}
                                    </tspan>
                                  ))}
                                </text>
                              </g>
                            )
                          })}
                        </svg>

                        {/* Center button */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-lg flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-inner flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative dots around the wheel */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180)
                    const x = 50 + 48 * Math.cos(angle)
                    const y = 50 + 48 * Math.sin(angle)
                    return (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-sm"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Form section */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">
                  Вземи си награда!
                </h2>
                <p className="text-gray-400 mb-6 text-pretty">
                  Абонирай се за VIP оферти по имейл и получи награда още сега!
                </p>

                {result ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-6 rounded-2xl ${
                      result.includes("Нямаш") 
                        ? "bg-gray-700/50" 
                        : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                    }`}>
                      <p className="text-lg text-gray-300 mb-2">Твоята награда:</p>
                      <p className={`text-2xl font-bold ${
                        result.includes("Нямаш") ? "text-gray-400" : "text-amber-400"
                      }`}>
                        {result}
                      </p>
                    </div>
                    {!result.includes("Нямаш") && (
                      <p className="text-sm text-gray-500">
                        Промокодът е изпратен на {email}
                      </p>
                    )}
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-6 rounded-xl transition-all duration-300"
                    >
                      Продължи към магазина
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="Въведи имейл адрес"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSpinning || hasSpun}
                        className="w-full pl-12 pr-4 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <Button
                      onClick={spinWheel}
                      disabled={!email || isSpinning || hasSpun}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
                    >
                      {isSpinning ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Завърта се...
                        </span>
                      ) : hasSpun ? (
                        "Вече завъртя днес!"
                      ) : (
                        "ЗАВЪРТИ!"
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      С абонирането се съгласявате с нашите условия за ползване
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti animation styles */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </>
  )
}
