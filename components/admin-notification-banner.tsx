"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BellRing, XCircle, RefreshCw, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminNotificationBanner() {
  const [lastOrderCount, setLastOrderCount] = useState(0)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [lastCustomerCount, setLastCustomerCount] = useState(0)
  const [pendingCustomersCount, setPendingCustomersCount] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isPolling, setIsPolling] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
      }
    }

    document.addEventListener("click", initAudio, { once: true })
    return () => document.removeEventListener("click", initAudio)
  }, [audioContext])

  useEffect(() => {
    checkForNewOrders(true)
    checkForPendingCustomers(true)
  }, [])

  useEffect(() => {
    if (!notificationsEnabled) return

    const pollInterval = setInterval(() => {
      checkForNewOrders(false)
      checkForPendingCustomers(false)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(pollInterval)
  }, [lastOrderCount, lastCustomerCount, notificationsEnabled])

  const checkForNewOrders = async (isInitial: boolean) => {
    if (isPolling) return

    setIsPolling(true)
    try {
      const response = await fetch("/api/admin/orders")
      if (!response.ok) return

      const data = await response.json()
      const orders = data.orders || []
      const currentOrderCount = orders.length
      const newStatusOrders = orders.filter((order: any) => order.status === "new")

      if (isInitial) {
        setNewOrdersCount(newStatusOrders.length)
        setLastOrderCount(currentOrderCount)
        setInitialCheckDone(true)

        if (newStatusOrders.length > 0 && notificationsEnabled) {
          playNotificationSound()
        }
      } else {
        if (lastOrderCount > 0 && currentOrderCount > lastOrderCount) {
          const newOrdersDiff = currentOrderCount - lastOrderCount
          setNewOrdersCount((prev) => prev + newOrdersDiff)

          newStatusOrders.forEach((order: any) => {
            toast({
              title: "🔔 Нова поръчка!",
              description: `Поръчка #${order.orderId} от ${order.customerName} - ${Number(order.totalAmount).toFixed(2)} лв.`,
              duration: 10000,
            })
          })

          playNotificationSound()
        }

        setLastOrderCount(currentOrderCount)
      }
    } catch (error) {
      console.error("Error checking for new orders:", error)
    } finally {
      setIsPolling(false)
    }
  }

  const checkForPendingCustomers = async (isInitial: boolean) => {
    try {
      const response = await fetch("/api/admin/customers/pending")
      if (!response.ok) return

      const data = await response.json()
      const customers = data.customers || []
      const currentCustomerCount = customers.length

      if (isInitial) {
        setPendingCustomersCount(currentCustomerCount)
        setLastCustomerCount(currentCustomerCount)

        if (currentCustomerCount > 0 && notificationsEnabled) {
          playNotificationSound()
        }
      } else {
        if (lastCustomerCount >= 0 && currentCustomerCount > lastCustomerCount) {
          const newCustomersDiff = currentCustomerCount - lastCustomerCount
          setPendingCustomersCount(currentCustomerCount)

          toast({
            title: "👥 Нови клиенти за одобрение!",
            description: `${newCustomersDiff} ${newCustomersDiff === 1 ? "нов клиент чака" : "нови клиенти чакат"} одобрение`,
            duration: 10000,
          })

          playNotificationSound()
        } else {
          setPendingCustomersCount(currentCustomerCount)
        }

        setLastCustomerCount(currentCustomerCount)
      }
    } catch (error) {
      console.error("Error checking for pending customers:", error)
    }
  }

  const playNotificationSound = () => {
    try {
      if (!audioContext) {
        return
      }

      if (audioContext.state === "suspended") {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      const now = audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2)

      oscillator.start(now)
      oscillator.stop(now + 0.2)
    } catch (error) {
      console.log("Could not play notification sound:", error)
    }
  }

  const clearNewOrdersBadge = () => {
    setNewOrdersCount(0)
  }

  const clearPendingCustomersBadge = () => {
    setPendingCustomersCount(0)
  }

  const handleViewOrders = () => {
    clearNewOrdersBadge()
    router.push("/admin-panel/orders")
  }

  const handleViewCustomers = () => {
    clearPendingCustomersBadge()
    router.push("/admin-panel/users/approval")
  }

  const dismissAll = () => {
    clearNewOrdersBadge()
    clearPendingCustomersBadge()
  }

  if (newOrdersCount === 0 && pendingCustomersCount === 0) {
    return null
  }

  const totalNotifications = newOrdersCount + pendingCustomersCount

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg animate-in slide-in-from-top duration-500 border-b-2 border-green-400">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {totalNotifications === 1 ? "Ново известие!" : `${totalNotifications} нови известия!`}
            </h3>
            <div className="text-sm text-green-50 space-y-1">
              {newOrdersCount > 0 && (
                <p>{newOrdersCount === 1 ? "1 нова поръчка" : `${newOrdersCount} нови поръчки`}</p>
              )}
              {pendingCustomersCount > 0 && (
                <p>
                  {pendingCustomersCount === 1
                    ? "1 клиент чака одобрение"
                    : `${pendingCustomersCount} клиенти чакат одобрение`}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {newOrdersCount > 0 && (
            <Button
              onClick={handleViewOrders}
              variant="secondary"
              size="sm"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Виж поръчките
            </Button>
          )}
          {pendingCustomersCount > 0 && (
            <Button
              onClick={handleViewCustomers}
              variant="secondary"
              size="sm"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Виж клиентите
            </Button>
          )}
          <Button onClick={dismissAll} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
