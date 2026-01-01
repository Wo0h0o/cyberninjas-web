'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { ForumNotification } from '@/lib/forum-types'
import styles from './NotificationBell.module.css'

export default function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<ForumNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return

        try {
            setLoading(true)
            const res = await fetch('/api/forum/notifications?limit=10')
            const data = await res.json()

            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch and polling
    useEffect(() => {
        if (user) {
            fetchNotifications()

            // Poll every 30 seconds for new notifications
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/forum/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: notificationId })
            })

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification:', error)
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch('/api/forum/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mark_all_read: true })
            })

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all notifications:', error)
        }
    }

    // Notification icon based on type
    const getNotificationIcon = (type: ForumNotification['type']) => {
        switch (type) {
            case 'mention': return '📢'
            case 'reply': return '💬'
            case 'reaction': return '👍'
            case 'solution': return '✅'
            case 'wiki_edit': return '📝'
            case 'achievement': return '🏆'
            default: return '🔔'
        }
    }

    if (!user) return null

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Нотификации"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Нотификации</h3>
                        {unreadCount > 0 && (
                            <button className={styles.markAllButton} onClick={markAllAsRead}>
                                Маркирай всички
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationsList}>
                        {loading && notifications.length === 0 ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🔔</span>
                                <p>Няма нотификации</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.topic_id
                                        ? `/forum/topic/${(notification as any).topic_slug || notification.topic_id}`
                                        : '/forum'
                                    }
                                    className={`${styles.notification} ${!notification.is_read ? styles.unread : ''}`}
                                    onClick={() => {
                                        if (!notification.is_read) {
                                            markAsRead(notification.id)
                                        }
                                        setIsOpen(false)
                                    }}
                                >
                                    <span className={styles.notificationIcon}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className={styles.notificationContent}>
                                        <p className={styles.notificationTitle}>{notification.title}</p>
                                        {notification.message && (
                                            <p className={styles.notificationMessage}>
                                                {notification.message.substring(0, 60)}
                                                {notification.message.length > 60 ? '...' : ''}
                                            </p>
                                        )}
                                        <time className={styles.notificationTime}>
                                            {formatTimeAgo(notification.created_at)}
                                        </time>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <Link href="/forum" className={styles.viewAllLink} onClick={() => setIsOpen(false)}>
                        Към форума →
                    </Link>
                </div>
            )}
        </div>
    )
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'сега'
    if (diffMins < 60) return `${diffMins} мин`
    if (diffHours < 24) return `${diffHours}ч`
    if (diffDays < 7) return `${diffDays}д`

    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })
}
