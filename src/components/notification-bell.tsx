"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import Link from "next/link"

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "justo ahora"
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`
  return `hace ${Math.floor(seconds / 86400)}d`
}

export function NotificationBell() {
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    enabled: isAdmin,
  })

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: queryKeys.notifications.lists(),
    queryFn: getNotifications,
    enabled: isAdmin && open,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  if (!isAdmin) return null

  return (
    <div className="relative">
      <button
        type="button"
        className="relative p-2 rounded-md text-foreground hover:bg-accent transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-[9999] w-[400px] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="text-sm font-semibold">Notificaciones</h4>
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors ${
                      !n.read ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate">{n.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                          {timeAgo(n.created_at)}
                        </p>

                        {n.type === "post_pending" && (
                          <Link
                            href={`/admin/pending/${n.post_id}`}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver post completo
                          </Link>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-1 shrink-0">
                        {!n.read && (
                          <button
                            type="button"
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                            onClick={() => markReadMutation.mutate(n.id)}
                            title="Marcar como leída"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-red-500"
                          onClick={() => deleteMutation.mutate(n.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}