"use client"

import { useEffect, useState, useRef } from "react"
import pkg from "../package.json"

interface ServiceStatus {
  name: string
  url: string
  address: string
  status: "CHECKING" | "ONLINE" | "OFFLINE" | "TIMEOUT"
}

const getStatusColor = (status: ServiceStatus["status"]) => {
  switch (status) {
    case "ONLINE":
      return "text-accent"
    case "OFFLINE":
      return "text-destructive"
    case "TIMEOUT":
      return "text-chart-3"
    default:
      return "text-muted"
  }
}

const SERVICES: Omit<ServiceStatus, "status">[] = [
  { name: "Jellyfin", url: "http://192.168.1.200:8096", address: "dell:8096" },
  { name: "qBittorrent", url: "http://192.168.1.200:8080", address: "dell:8080" },
]
const IP_ALIASES: Record<string, string> = {
  "192.168.1.200": "dell",

}

const checkServiceStatus = async (url: string): Promise<ServiceStatus["status"]> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return "ONLINE"
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "TIMEOUT"
    }
    return "OFFLINE"
  }
}

export default function Home() {
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES.map((s) => ({ ...s, status: "CHECKING" as const })),
  )
  const [checked, setChecked] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  

  const servicesRef = useRef<(HTMLButtonElement | null)[]>([])
  
  const [darkMode, setDarkMode] = useState(false)
const [mounted, setMounted] = useState(false)

useEffect(() => {
  const stored = localStorage.getItem("theme")

  queueMicrotask(() => {
    setDarkMode(stored ? stored === "dark" : true)
    setMounted(true)
  })
}, [])

useEffect(() => {
  if (!mounted) return

  const root = document.documentElement
  if (darkMode) {
    root.classList.add("dark")
    localStorage.setItem("theme", "dark")
  } else {
    root.classList.remove("dark")
    localStorage.setItem("theme", "light")
  }
}, [darkMode, mounted])

  

  const [lastScan, setLastScan] = useState<number | null>(null)

  useEffect(() => {
    const checkAllServices = async () => {
      const updated = await Promise.all(
        SERVICES.map(async (service) => ({
          ...service,
          status: await checkServiceStatus(service.url),
        })),
      )
      setServices(updated)
      setChecked(true)
      setLastScan(Date.now())
    }

    checkAllServices()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1))
          break
        case "ArrowDown":
        case "Tab":
          e.preventDefault()
          setFocusedIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0))
          break
        case "Enter":
          e.preventDefault()
          servicesRef.current[focusedIndex]?.click()
          break
        case "m":
        case "M":
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault()
            setDarkMode(!darkMode)
          }
          break
        case "?":
          e.preventDefault()
          alert(
            "Keyboard Navigation:\n↑/↓ - Navigate services\nEnter - Open service\nCtrl+Shift+M - Toggle dark mode\n? - Show this help",
          )
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusedIndex, services.length, darkMode])

  useEffect(() => {
    servicesRef.current[focusedIndex]?.focus()
  }, [focusedIndex])

if (!mounted) return null

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300`}
    >


      <div className="fixed inset-0 pointer-events-none">
        
        <div className="paper-noise fixed inset-0 pointer-events-none z-0" />

        {/* Grid background */}
        <div className="absolute inset-0 grid-background hidden dark:block" />

        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines hidden dark:block" />

        {/* Glowing corners */}
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl bg-green-500/10 hidden dark:block" />
<div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-3xl bg-cyan-500/10 hidden dark:block" />

      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl font-mono">
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-primary/30">
            <div>
              <p className="text-foreground text-sm sm:text-base mb-2">
                <span className="text-primary">aviiciii@homelab</span>
                <span className="text-muted">:~$</span>
                <span className="text-accent ml-2 glitch-text">services</span>
              </p>
              <p className="text-xs text-muted/70">[sys]: {pkg.version}</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xs px-3 py-2 border border-primary/50 hover:border-primary transition-colors text-primary hover:bg-primary/10 kb-focus rounded"
              title="Toggle dark mode (Ctrl+Shift+M)"
            >
              {darkMode ? "[ DARK ]" : "[ LIGHT ]"}
            </button>
          </div>

          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded text-xs space-y-2">
            <div className="text-muted">{`> system_info --brief`}</div>
            <div className="text-primary">
              Network Name: spider
            </div>
            <div className="text-primary">
              {`Services: ${services.filter((s) => s.status === "ONLINE").length}/${services.length} ONLINE`}
            </div>
            <div className="text-primary">{`Last scan: ${
              checked && lastScan
              ? new Date(lastScan).toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" })
               + " " + new Date(lastScan).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
              : "in progress"
            }`}</div>
            
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-xs text-muted/70 mb-4">{`> list_services --status`}</p>
            {services.map((service, index) => (
              <button
                key={service.name}
                ref={(el) => {
                  servicesRef.current[index] = el
                }}
                onClick={() => (window.location.href = service.url)}
                onFocus={() => setFocusedIndex(index)}
                className={`w-full text-left px-4 py-4 transition-all duration-200 group border-l-2 ${
                  focusedIndex === index
                  ? "border-accent bg-accent/10 kb-focus"
                  : "border-transparent hover:border-primary/50 hover:bg-primary/5"
                } `}
                title={`Open ${service.name} (Enter)`}
                >
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <span className="text-primary group-hover:text-accent transition-colors">
                    {focusedIndex === index ? ">" : " "}
                  </span>
                  <span className="flex-1 font-semibold">{service.name}</span>
                  <span className="text-muted text-xs">{service.address}</span>
                  <div className={`flex items-center gap-2 ${getStatusColor(service.status)}`}>
                    <span
  className={`inline-block w-2 h-2 rounded-full ${
    service.status === "ONLINE"
      ? "bg-accent status-pulse"
      : service.status === "OFFLINE"
        ? "bg-destructive"
        : "bg-chart-3"
  }`}
/>
                    <span className="font-bold text-xs">[{service.status}]</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t-2 border-primary/30 pt-6 space-y-3">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded text-xs space-y-2">
              <p className="text-muted">{`> cat system_log.txt`}</p>
              <p className="text-primary">{`[INFO] Dark mode: ${darkMode ? "ENABLED" : "DISABLED"}`}</p>
              {Object.entries(IP_ALIASES).map(([ip, alias]) => (
                <p key={ip} className="text-primary">{`[INFO] [ipv4] ${alias}: ${ip}`}</p>
              ))}

            </div>
            <p className="text-xs text-muted text-center">refresh to re-run checks // press ? for help // Ctrl+Shift+M to toggle theme</p>
          </div>
        </div>
      </div>
    </div>
  )
}
