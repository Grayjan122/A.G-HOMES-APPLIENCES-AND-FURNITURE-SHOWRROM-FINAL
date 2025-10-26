'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import './notifications.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const bellButtonRef = useRef(null);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserRole(sessionStorage.getItem('user_role') || '');
            fetchNotifications();
            
            // Poll for new notifications every 30 seconds
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                bellButtonRef.current &&
                !bellButtonRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const fetchNotifications = async () => {
        if (typeof window === 'undefined') return;
        
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;

        try {
            const locationId = sessionStorage.getItem('location_id');
            const role = sessionStorage.getItem('user_role');
            const accountId = sessionStorage.getItem('account_id');
            
            console.log('Fetching notifications with:', { locationId, role, accountId });
            
            const response = await axios.get(baseURL + 'notifications.php', {
                params: {
                    operation: 'GetNotifications',
                    json: JSON.stringify({
                        locationId: locationId,
                        role: role,
                        accountId: accountId
                    })
                }
            });

            console.log('Notifications response:', response.data);

            if (response.data && Array.isArray(response.data)) {
                setNotifications(response.data);
                const unread = response.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
                console.log(`Found ${response.data.length} notifications, ${unread} unread`);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        if (typeof window === 'undefined') return;
        
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;

        try {
            await axios.get(baseURL + 'notifications.php', {
                params: {
                    operation: 'MarkAsRead',
                    json: JSON.stringify({ notificationId })
                }
            });

            // Update local state
            setNotifications(prev => 
                prev.map(n => n.notification_id === notificationId ? {...n, is_read: 1} : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (typeof window === 'undefined') return;
        
        const baseURL = sessionStorage.getItem('baseURL');
        if (!baseURL) return;

        try {
            await axios.get(baseURL + 'notifications.php', {
                params: {
                    operation: 'MarkAllAsRead',
                    json: JSON.stringify({
                        locationId: sessionStorage.getItem('location_id'),
                        accountId: sessionStorage.getItem('account_id')
                    })
                }
            });

            // Update local state
            setNotifications(prev => prev.map(n => ({...n, is_read: 1})));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'stock_request':
                return '📦';
            case 'delivery':
                return '🚚';
            case 'out_of_stock':
                return '⚠️';
            case 'payment_due':
                return '💰';
            case 'overdue':
                return '🔴';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'stock_request':
                return '#007bff';
            case 'delivery':
                return '#28a745';
            case 'out_of_stock':
                return '#ffc107';
            case 'payment_due':
                return '#17a2b8';
            case 'overdue':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getDropdownPosition = () => {
        if (bellButtonRef.current) {
            const rect = bellButtonRef.current.getBoundingClientRect();
            return {
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            };
        }
        return { top: 0, right: 0 };
    };

    return (
        <div className="notification-bell-container">
            <button 
                ref={bellButtonRef}
                className="notification-bell-button"
                onClick={() => setShowDropdown(!showDropdown)}
                title="Notifications"
            >
                <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {showDropdown && typeof document !== 'undefined' && createPortal(
                <div 
                    ref={dropdownRef}
                    className="notification-dropdown"
                    style={{
                        position: 'fixed',
                        top: `${getDropdownPosition().top}px`,
                        right: `${getDropdownPosition().right}px`
                    }}
                >
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read-btn"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <span className="no-notif-icon">🔔</span>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.notification_id}
                                    className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                    onClick={() => {
                                        if (!notif.is_read) {
                                            markAsRead(notif.notification_id);
                                        }
                                    }}
                                >
                                    <div 
                                        className="notification-icon"
                                        style={{ backgroundColor: getNotificationColor(notif.type) }}
                                    >
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notif.title}</div>
                                        <div className="notification-message">{notif.message}</div>
                                        <div className="notification-time">{formatTimeAgo(notif.created_at)}</div>
                                    </div>
                                    {!notif.is_read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button 
                                className="view-all-btn"
                                onClick={() => {
                                    setShowDropdown(false);
                                    // You can navigate to a full notifications page here
                                }}
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default NotificationBell;

