import { useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import { ReminderIcon } from '../common/Icons';

function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  loading = false,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
}) {
  const latestNotif = notifications.length > 0 ? notifications[0] : null;
  const latestRef = useRef(null);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Auto-mark the latest visible notification as read when dropdown opens
  useEffect(() => {
    if (!latestNotif) return;
    const notifId = (latestNotif._id || latestNotif.id)?.toString();
    const isUnread = !latestNotif.isRead;
    if (notifId && isUnread && typeof onMarkAsRead === 'function') {
      const timer = setTimeout(() => onMarkAsRead(notifId), 300);
      return () => clearTimeout(timer);
    }
  }, [latestNotif, onMarkAsRead]);

  const handleItemClick = (notification) => {
    const notifId = notification._id || notification.id;
    if (!notification.isRead && typeof onMarkAsRead === 'function') {
      onMarkAsRead(notifId);
    }
    if (typeof onSelectNotification === 'function') {
      onSelectNotification(notification);
    }
    onClose();
  };

  const senderName = latestNotif
    ? latestNotif.sender?.name || (latestNotif.type === 'reminder_due' ? 'Reminder' : 'Teammate')
    : null;
  const isUnread = latestNotif ? !latestNotif.isRead : false;
  const notifId = latestNotif ? (latestNotif._id || latestNotif.id)?.toString() : null;

  return (
    <div className="notification-dropdown-panel" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="notif-dropdown-header">
        <div className="notif-header-title-group">
          <span className="notif-title">Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-count-badge">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn-mark-all-read"
            onClick={onMarkAllAsRead}
            title="Mark all notifications as read"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Body — shows only the latest notification */}
      <div className="notif-single-body">
        {loading && !latestNotif ? (
          <div className="notif-empty-state">Loading...</div>
        ) : !latestNotif ? (
          <div className="notif-empty-state">
            <span className="notif-empty-icon"><ReminderIcon size={32} color="var(--text-muted)" /></span>
            <p>No new notifications</p>
          </div>
        ) : (
          <div
            ref={latestRef}
            data-notif-id={notifId}
            data-unread={isUnread}
            className={`notif-item ${isUnread ? 'unread' : 'read'}`}
            onClick={() => handleItemClick(latestNotif)}
            role="button"
            tabIndex={0}
          >
            <div className="notif-avatar-wrapper">
              <Avatar
                name={senderName}
                image={latestNotif.sender?.avatar}
                size="small"
              />
              {latestNotif.type === 'reminder_due' && (
                <span className="notif-badge-mention" style={{ background: 'rgba(2, 132, 199, 0.9)' }}>⏰</span>
              )}
              {latestNotif.type === 'mention' && (
                <span className="notif-badge-mention">@</span>
              )}
              {latestNotif.type === 'channel_activity' && (
                <span className="notif-badge-channel">#</span>
              )}
              {latestNotif.type === 'invitation_received' && (
                <span className="notif-badge-mention" style={{ background: 'rgba(2, 132, 199, 0.9)' }}>✉️</span>
              )}
              {latestNotif.type === 'invitation_accepted' && (
                <span className="notif-badge-mention" style={{ background: 'rgba(5, 150, 105, 0.9)' }}>✓</span>
              )}
              {latestNotif.type === 'join_request' && (
                <span className="notif-badge-mention" style={{ background: 'rgba(2, 132, 199, 0.9)' }}>🏢</span>
              )}
              {latestNotif.type === 'join_request_approved' && (
                <span className="notif-badge-mention" style={{ background: 'rgba(5, 150, 105, 0.9)' }}>✓</span>
              )}
            </div>

            <div className="notif-content-wrapper">
              <div className="notif-top-row">
                <span className="notif-sender">{senderName}</span>
                <span className="notif-time">{formatTime(latestNotif.createdAt)}</span>
              </div>
              <p className="notif-text">{latestNotif.content}</p>
            </div>

            {isUnread && <span className="notif-unread-dot" />}
          </div>
        )}
      </div>

      {/* Footer hint if there are more notifications */}
      {notifications.length > 1 && (
        <div className="notif-footer-hint">
          +{notifications.length - 1} more notification{notifications.length - 1 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
