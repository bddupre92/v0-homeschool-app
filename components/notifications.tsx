"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/notifications"

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch notifications when popover opens
  useEffect(() => {
    if (open && user) {
      fetchNotifications()
    }
  }, [open, user])

  const fetchNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await getUserNotifications(user.uid)
      if (result.success) {
        setNotifications(result.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId)
      if (result.success) {
        setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const result = await markAllNotificationsAsRead(user.uid)
      if (result.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId)
      if (result.success) {
        setNotifications(notifications.filter((n) => n.id !== notificationId))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <div className="w-2 h-2 rounded-full bg-green-500" />
      case "warning":
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />
      case "error":
        return <div className="w-2 h-2 rounded-full bg-red-500" />
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center translate-x-1/3 -translate-y-1/3">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8">
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-1.5">{unreadCount}</span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="p-0">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
          <TabsContent value="unread" className="p-0">
            <NotificationList
              notifications={notifications.filter((n) => !n.read)}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  isLoading: boolean
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  getNotificationIcon: (type: Notification["type"]) => React.ReactNode
}

function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
}: NotificationListProps) {
  if (isLoading) {
    return <div className="py-6 text-center text-muted-foreground">Loading notifications...</div>
  }

  if (notifications.length === 0) {
    return <div className="py-6 text-center text-muted-foreground">No notifications to display</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-4 ${notification.read ? "" : "bg-muted/50"}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <div className="flex items-center gap-2 pt-1">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-primary hover:underline"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      View
                    </Link>
                  )}
                  {!notification.read && (
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive ml-auto"
                    onClick={() => onDelete(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
