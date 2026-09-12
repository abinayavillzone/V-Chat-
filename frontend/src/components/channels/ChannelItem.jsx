import { LockIcon, ChannelIcon, PinIcon } from '../common/Icons';

function ChannelItem({
  channel,
  isSelected,
  onSelect,
  isDiscoverable = false,
  onJoin = null,
  isPinned = false,
  onTogglePin = null,
}) {
  const memberCount = Array.isArray(channel.members)
    ? channel.members.length
    : channel.memberCount || 0;

  const handleJoinClick = (e) => {
    e.stopPropagation();
    if (onJoin) {
      onJoin(channel._id || channel.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`channel-list-item ${isSelected ? 'selected' : ''} ${isDiscoverable ? 'discoverable-channel-item' : ''}`}
      onClick={() => onSelect(channel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(channel);
        }
      }}
      aria-label={`Select channel ${channel.name}`}
    >
      <div className="channel-icon-hash" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {channel.isPrivate ? <LockIcon size={18} /> : <ChannelIcon size={18} />}
      </div>
      <div className="channel-item-details">
        <div className="channel-name-row">
          <span className="channel-name">{channel.name}</span>
          {isPinned && (
            <span className="pinned-badge-indicator" title="Pinned to top">
              <PinIcon size={12} strokeWidth={2.2} />
            </span>
          )}
        </div>
        <div className="channel-desc-row">
          <p className="channel-desc">{channel.description || 'Team discussion'}</p>
          {channel.unread > 0 && !isDiscoverable && (
            <span className="unread-badge">{channel.unread}</span>
          )}
        </div>
      </div>

      {!isDiscoverable && onTogglePin && (
        <button
          type="button"
          className={`btn-pin-item ${isPinned ? 'pinned-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={isPinned ? 'Unpin channel' : 'Pin channel'}
          aria-label={isPinned ? 'Unpin channel' : 'Pin channel'}
        >
          <PinIcon size={13} strokeWidth={2.2} />
        </button>
      )}



      {isDiscoverable && (
        <div className="channel-item-action">
          <button
            type="button"
            className="btn-join-channel-pill"
            onClick={handleJoinClick}
            title={`Join ${channel.name}`}
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
}

export default ChannelItem;
