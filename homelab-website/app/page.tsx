"use client"

import { useEffect, useState, useRef } from "react"

interface ServiceStatus {
  name: string
  url: string
  address: string
  status: "CHECKING" | "ONLINE" | "OFFLINE" | "TIMEOUT"
}

const SERVICES: Omit<ServiceStatus, "status">[] = [
  { name: "Jellyfin", url: "http://192.168.1.200:8096", address: "192.168.1.200:8096" },
  { name: "qBittorrent", url: "http://192.168.1.200:8080", address: "192.168.1.200:8080" },
]

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
  const [darkMode, setDarkMode] = useState(true)
  const servicesRef = useRef<(HTMLButtonElement | null)[]>([])

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

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "ONLINE":
        return "text-green-400"
      case "OFFLINE":
        return "text-red-500"
      case "TIMEOUT":
        return "text-yellow-400"
      default:
        return "text-muted"
    }
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${darkMode ? "dark" : "light"}`}
    >
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid background */}
        <div className="absolute inset-0 grid-background" />

        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines" />

        {/* Glowing corners */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl font-mono">
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-primary/30">
            <div>
              <p className="text-foreground text-sm sm:text-base mb-2">
                <span className="text-primary">user@homelab</span>
                <span className="text-muted">:~$</span>
                <span className="text-accent ml-2 glitch-text">services</span>
              </p>
              <p className="text-xs text-muted/70">[sys]: Terminal interface v1.0 // Ctrl+Shift+M to toggle theme</p>
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
              {`Services: ${services.filter((s) => s.status === "ONLINE").length}/${services.length} ONLINE`}
            </div>
            <div className="text-primary">{`Last scan: ${checked ? "complete" : "in progress"}`}</div>
            <div className="text-muted text-xs mt-2">
              Press <span className="text-accent">?</span> for keyboard help
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-xs text-muted/70 mb-4">{`> list_services --status`}</p>
            {services.map((service, index) => (
              <button
                key={service.name}
                ref={(el) => {
                  servicesRef.current[index] = el
                }}
                onClick={() => window.open(service.url, "_blank")}
                onFocus={() => setFocusedIndex(index)}
                className={`w-full text-left px-4 py-4 transition-all duration-200 group border-l-2 ${
                  focusedIndex === index
                    ? "border-accent bg-accent/10 kb-focus"
                    : "border-transparent hover:border-primary/50 hover:bg-primary/5"
                } focus:outline-none`}
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
                          ? "bg-green-400 status-pulse"
                          : service.status === "OFFLINE"
                            ? "bg-red-500"
                            : "bg-yellow-400"
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
              <p className="text-primary">{`[INFO] Status checks completed on page load`}</p>
              <p className="text-primary">{`[INFO] Keyboard navigation active (↑↓ Enter)`}</p>
              <p className="text-primary">{`[INFO] Dark mode: ${darkMode ? "ENABLED" : "DISABLED"}`}</p>
            </div>
            <p className="text-xs text-muted text-center">refresh to re-run checks // press ? for help</p>
          </div>
        </div>
      </div>
    </div>
  )
}
