import { useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';

function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  loading = false,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotification,
}) {
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef(new Map());

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

  // IntersectionObserver to detect when unread notification items actually become visible to the user
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const notifId = entry.target.dataset.notifId;
            const isUnread = entry.target.dataset.unread === 'true';
            if (notifId && isUnread && typeof onMarkAsRead === 'function') {
              onMarkAsRead(notifId);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.2, // Reliably marks notification as read when scrolled into view
      }
    );

    itemRefs.current.forEach((node) => {
      if (node && node.dataset.unread === 'true') {
        observer.observe(node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [notifications, onMarkAsRead]);

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

  return (
    <div className="notification-dropdown-panel" onClick={(e) => e.stopPropagation()}>
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

      <div className="notif-items-scroll" ref={scrollContainerRef}>
        {loading && notifications.length === 0 ? (
          <div className="notif-empty-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty-state">
            <span className="notif-empty-icon">🔔</span>
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const notifId = (notif._id || notif.id)?.toString();
            const senderName = notif.sender?.name || 'Teammate';
            const isUnread = !notif.isRead;

            return (
              <div
                key={notifId}
                data-notif-id={notifId}
                data-unread={isUnread}
                ref={(el) => {
                  if (el) itemRefs.current.set(notifId, el);
                  else itemRefs.current.delete(notifId);
                }}
                className={`notif-item ${isUnread ? 'unread' : 'read'}`}
                onClick={() => handleItemClick(notif)}
                role="button"
                tabIndex={0}
              >
                <div className="notif-avatar-wrapper">
                  <Avatar
                    name={senderName}
                    image={notif.sender?.avatar}
                    size="small"
                  />
                  {notif.type === 'mention' && (
                    <span className="notif-badge-mention">@</span>
                  )}
                  {notif.type === 'channel_activity' && (
                    <span className="notif-badge-channel">#</span>
                  )}
                  {notif.type === 'invitation_received' && (
                    <span className="notif-badge-mention" style={{ background: 'rgba(2, 132, 199, 0.9)' }}>✉️</span>
                  )}
                  {notif.type === 'invitation_accepted' && (
                    <span className="notif-badge-mention" style={{ background: 'rgba(5, 150, 105, 0.9)' }}>✓</span>
                  )}
                  {notif.type === 'join_request' && (
                    <span className="notif-badge-mention" style={{ background: 'rgba(2, 132, 199, 0.9)' }}>🏢</span>
                  )}
                  {notif.type === 'join_request_approved' && (
                    <span className="notif-badge-mention" style={{ background: 'rgba(5, 150, 105, 0.9)' }}>✓</span>
                  )}
                </div>

                <div className="notif-content-wrapper">
                  <div className="notif-top-row">
                    <span className="notif-sender">{senderName}</span>
                    <span className="notif-time">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="notif-text">{notif.content}</p>
                </div>

                {isUnread && <span className="notif-unread-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;
