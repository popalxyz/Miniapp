"use client"

// Farcaster notification service for sending alerts
export interface FarcasterNotificationConfig {
  apiKey?: string
  webhookUrl?: string
  enabled: boolean
}

export interface NotificationPayload {
  title: string
  body: string
  targetUrl?: string
  imageUrl?: string
}

class FarcasterNotificationService {
  private config: FarcasterNotificationConfig = {
    enabled: false,
  }

  configure(config: Partial<FarcasterNotificationConfig>) {
    this.config = { ...this.config, ...config }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.config.enabled) {
      console.log("[v0] Farcaster notifications disabled")
      return false
    }

    try {
      // For now, we'll simulate the notification
      // In production, this would call the Farcaster Mini App notification API
      console.log("[v0] Sending Farcaster notification:", payload)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.body,
          icon: "/favicon.ico",
        })
      }

      return true
    } catch (error) {
      console.error("[v0] Failed to send Farcaster notification:", error)
      return false
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("[v0] Failed to request notification permission:", error)
      return false
    }
  }

  // Format alert data for Farcaster notification
  formatAlertNotification(alert: any, currentPrice: number): NotificationPayload {
    const priceFormatted = `$${currentPrice.toLocaleString()}`

    let title = ""
    let body = ""

    switch (alert.alertType) {
      case "above":
        title = `🚀 ${alert.tokenSymbol} Price Alert`
        body = `${alert.tokenName} has reached ${priceFormatted}, above your target of $${alert.targetPrice?.toLocaleString()}`
        break
      case "below":
        title = `📉 ${alert.tokenSymbol} Price Alert`
        body = `${alert.tokenName} has dropped to ${priceFormatted}, below your target of $${alert.targetPrice?.toLocaleString()}`
        break
      case "change":
        const changeSign = (alert.changePercentage || 0) >= 0 ? "+" : ""
        title = `📊 ${alert.tokenSymbol} Price Movement`
        body = `${alert.tokenName} has moved ${changeSign}${alert.changePercentage}% to ${priceFormatted}`
        break
      default:
        title = `🔔 ${alert.tokenSymbol} Alert`
        body = `Price alert triggered for ${alert.tokenName} at ${priceFormatted}`
    }

    return {
      title,
      body,
      targetUrl: `/token/${alert.tokenAddress}`,
      imageUrl: `/placeholder.svg?height=64&width=64&query=${alert.tokenSymbol} token logo`,
    }
  }
}

export const farcasterNotifications = new FarcasterNotificationService()
