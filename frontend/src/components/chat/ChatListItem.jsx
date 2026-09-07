import Avatar from '../common/Avatar';
import { LockIcon, ChannelIcon, PinIcon } from '../common/Icons';

// Helper to format ISO dates into human-friendly time labels
const formatChatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

function ChatListItem({
  chat,
  currentUserId,
  onlineUserIds,
  isSelected,
  onSelect,
  isPinned = false,
  onTogglePin = null,
}) {
  const isChannel = Boolean(
    chat.isChannel ||
    chat.itemType === 'channel' ||
    (chat.isPrivate !== undefined && !chat.participants) ||
    (chat.members && !chat.participants)
  );

  let displayName = chat.name || 'Conversation';
  let displayAvatar = chat.avatar;
  let status = 'offline';
  let snippet = 'No messages yet';
  let time = '';
  let isMuted = Boolean(chat.muted);

  if (isChannel) {
    // Channel Item
    displayName = chat.name;
    time = formatChatTime(chat.lastMessageAt || chat.updatedAt || chat.createdAt);

    if (chat.lastMessage) {
      if (typeof chat.lastMessage === 'object') {
        const senderName =
          chat.lastMessage.sender?.name ||
          (chat.lastMessage.sender === currentUserId ? 'You' : '');
        const content = chat.lastMessage.content || '';
        snippet = senderName ? `${senderName}: ${content}` : content;
      } else {
        snippet = chat.lastMessage;
      }
    }

    // Check user-specific mute setting in channel memberSettings
    if (chat.memberSettings && Array.isArray(chat.memberSettings) && currentUserId) {
      const mySetting = chat.memberSettings.find(
        (s) => (s.userId?._id || s.userId || s.id)?.toString() === currentUserId.toString()
      );
      if (mySetting && mySetting.muted !== undefined) {
        isMuted = Boolean(mySetting.muted);
      }
    }
  } else if (chat.participants && Array.isArray(chat.participants)) {
    // Check if this is a Self Conversation ("Me" / Notes to self)
    const isSelfConv =
      chat.isMe ||
      (chat.participants &&
        Array.isArray(chat.participants) &&
        chat.participants.length > 0 &&
        chat.participants.every(
          (p) => (p._id || p.id || p)?.toString() === currentUserId?.toString()
        ));

    if (isSelfConv) {
      displayName = 'Me';
      displayAvatar = (chat.participants && chat.participants[0]?.avatar) || chat.avatar;
      snippet = chat.lastMessage
        ? (typeof chat.lastMessage === 'object' ? chat.lastMessage.content : chat.lastMessage)
        : 'Notes to self';
      time = formatChatTime(chat.lastMessageAt || chat.updatedAt || chat.createdAt);
      status = 'online';
    } else {
      // 1-on-1 Direct Conversation Item
      const otherUser = chat.participants.find(
        (p) => (p._id || p.id || p)?.toString() !== currentUserId?.toString()
      ) || chat.participants[0];

      const otherUserId = (otherUser?._id || otherUser?.id || otherUser)?.toString();
      if (otherUserId && onlineUserIds) {
        status = onlineUserIds.has(otherUserId) ? 'online' : 'offline';
      }

      displayName = otherUser?.name || chat.name || 'Teammate';
      displayAvatar = otherUser?.avatar;
      time = formatChatTime(chat.lastMessageAt || chat.updatedAt || chat.createdAt);

      if (chat.lastMessage) {
        snippet = typeof chat.lastMessage === 'object' ? chat.lastMessage.content : chat.lastMessage;
      }
    }

    // Check user-specific mute setting in direct conversation memberSettings
    if (chat.memberSettings && Array.isArray(chat.memberSettings) && currentUserId) {
      const mySetting = chat.memberSettings.find(
        (s) => (s.userId?._id || s.userId || s.id)?.toString() === currentUserId.toString()
      );
      if (mySetting && mySetting.muted !== undefined) {
        isMuted = Boolean(mySetting.muted);
      }
    }
  } else {
    // Fallback for static items
    snippet = chat.lastMessage || 'No messages yet';
    time = chat.time || '';
    status = chat.status || 'offline';
  }

  const unreadCount = Number(chat.unread || 0);

  return (
    <button
      type="button"
      className={`chat-list-item ${isSelected ? 'selected' : ''} ${isChannel ? 'channel-chat-item' : ''}`}
      onClick={() => onSelect(chat)}
      aria-label={`Open ${displayName}`}
    >
      <div className="chat-item-avatar">
        {isChannel ? (
          <div className="channel-icon-hash-badge" title={chat.isPrivate ? 'Private Channel' : 'Public Channel'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chat.isPrivate ? <LockIcon size={16} /> : <ChannelIcon size={16} />}
          </div>
        ) : (
          <Avatar
            name={displayName}
            image={displayAvatar}
            size="medium"
          />
        )}
      </div>

      <div className="chat-item-content">
        <div className="chat-item-header">
          <span className="chat-item-name" title={displayName}>
            {displayName}
            {isPinned && (
              <span className="pinned-badge-indicator" title="Pinned to top">
                <PinIcon size={12} strokeWidth={2.2} />
              </span>
            )}
            {isMuted && <span className="mute-icon-indicator" title="Muted"> 🔕</span>}
          </span>
          <div className="chat-item-header-actions">
            {onTogglePin && (
              <button
                type="button"
                className={`btn-pin-item ${isPinned ? 'pinned-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                aria-label={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
              >
                <PinIcon size={13} strokeWidth={2.2} />
              </button>
            )}
            <span className="chat-item-time">{time}</span>
          </div>
        </div>

        <div className="chat-item-footer">
          <p className="chat-item-snippet">{snippet}</p>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ChatListItem;
