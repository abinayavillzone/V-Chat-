import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import InChatSearch from './InChatSearch';
import ForwardModal from './ForwardModal';
import MessageInfoModal from './MessageInfoModal';
import PinnedMessagesPanel from './PinnedMessagesPanel';
import ConversationMenu from './ConversationMenu';
import PollModal from './PollModal';
import { PinIcon } from '../common/Icons';

function ChatWindow({
  chat,
  messages = [],
  currentUserId,
  conversations = [],
  channels = [],
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onDeleteMessageForMe,
  onForwardMessage,
  onTyping,
  onStopTyping,
  typingUser = null,
  isOtherUserOnline = false,
  otherUserLastSeen = null,
  onBack,
  loading = false,
  isSending = false,
  highlightedMessageId = null,
  hasMore = false,
  loadingOlder = false,
  onLoadOlder = null,
  onCreateTodo = null,
  onReaction = null,
  savedMessageIds = new Set(),
  onSave = null,
  onUnsave = null,
  onPin = null,
  onUnpin = null,
  pinnedMessages = [],
  pinnedLoading = false,
  muted = false,
  onMarkRead = null,
  onMarkUnread = null,
  onToggleMute = null,
  isPlanDisabled = false,
  isExpired = false,
  isSuspended = false,
  onPollVoted = null,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localHighlightId, setLocalHighlightId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [showPinned, setShowPinned] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [activePollModalMessage, setActivePollModalMessage] = useState(null);

  const convId = (chat._id || chat.id)?.toString();

  // Reset states when switching conversations
  useEffect(() => {
    setIsSearchOpen(false);
    setLocalHighlightId(null);
    setReplyingTo(null);
    setForwardingMessage(null);
    setInfoMessage(null);
    setActivePollModalMessage(null);
  }, [convId]);

  // Sync active poll modal message with updated messages (e.g. on new votes)
  useEffect(() => {
    if (activePollModalMessage) {
      const current = messages.find(
        (m) =>
          (m._id || m.id)?.toString() ===
          (activePollModalMessage._id || activePollModalMessage.id)?.toString()
      );
      if (current && current.poll) {
        setActivePollModalMessage(current);
      }
    }
  }, [messages, activePollModalMessage]);

  // Extract participant display info
  let displayName = chat.name;
  let displayAvatar = chat.avatar;
  let statusText = 'Direct Message';
  let isOnline = isOtherUserOnline;

  if (chat.participants && Array.isArray(chat.participants)) {
    const otherUser = chat.participants.find(
      (p) => (p._id || p.id || p)?.toString() !== currentUserId?.toString()
    ) || chat.participants[0];

    displayName = otherUser?.name || 'Teammate';
    displayAvatar = otherUser?.avatar;

    const allowsOnline = otherUser?.settings?.privacy?.onlineStatus !== false;
    const allowsLastSeen = otherUser?.settings?.privacy?.lastSeen !== false;

    if (isOnline && allowsOnline) {
      statusText = 'Online';
    } else if (otherUserLastSeen && allowsLastSeen) {
      statusText = 'Recently Seen';
    } else {
      statusText = 'Offline';
    }
  } else {
    statusText = chat.type === 'group' ? 'Group Discussion' : (isOnline ? 'Online' : 'Offline');
  }

  const handleSelectMessageFromSearch = (messageId) => {
    setLocalHighlightId(messageId);
    setTimeout(() => {
      setLocalHighlightId(null);
    }, 4000);
  };

  const handleSendMessageWithReply = (content, files, replyToId) => {
    onSendMessage(content, files, replyToId);
    setReplyingTo(null);
  };

  const activeHighlightId = localHighlightId || highlightedMessageId;

  return (
    <div className="chat-window-container">
      {/* Chat Window Header */}
      <div className="chat-window-header">
        {isSearchOpen ? (
          <InChatSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            conversationId={convId}
            contextTitle={displayName || 'this conversation'}
            onSelectMessage={handleSelectMessageFromSearch}
          />
        ) : (
          <>
            <div className="chat-header-left">
              {onBack && (
                <button
                  type="button"
                  className="btn-back-mobile"
                  onClick={onBack}
                  aria-label="Back to conversations"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="back-icon"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
              )}

              <Avatar
                name={displayName}
                image={displayAvatar}
                size="medium"
                status={isOnline ? 'online' : 'offline'}
              />

              <div className="chat-header-info">
                <h3 className="chat-header-name">{displayName}</h3>
                <span className="chat-header-status">{statusText}</span>
              </div>
            </div>

            <div className="chat-header-actions">
              {onCreateTodo && !isPlanDisabled && (
                <button
                  type="button"
                  className="btn-header-todo-action"
                  title="Add a To-Do in this conversation"
                  aria-label="Add a To-Do in this conversation"
                  onClick={() => onCreateTodo({ conversation: chat })}
                >
                  <span>☑️ + To-Do</span>
                </button>
              )}

              <div className="header-actions-group">
                <button
                  type="button"
                  className="btn-icon-action"
                  title="Search in conversation"
                  aria-label="Search in conversation"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>

                <div className="header-menu-container">
                  <button
                    type="button"
                    className="btn-icon-action"
                    title="Conversation options"
                    aria-label="Conversation options"
                    onClick={() => setShowConversationMenu((prev) => !prev)}
                  >
                    ⋮
                  </button>
                  <ConversationMenu
                    isOpen={showConversationMenu}
                    onClose={() => setShowConversationMenu(false)}
                    muted={muted}
                    onToggleMute={onToggleMute}
                    onOpenPinned={() => setShowPinned(true)}
                    label={displayName}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Pinned Message Banner */}
      {pinnedMessages && pinnedMessages.length > 0 && (() => {
        const latestPin = pinnedMessages[0];
        const pinDoc = latestPin?.messageId || latestPin;
        const pinSender = pinDoc?.sender?.name || (pinDoc?.sender === currentUserId ? 'You' : 'Teammate');
        const pinSnippet = pinDoc?.deleted
          ? 'This message was deleted'
          : (pinDoc?.content || (pinDoc?.attachments?.length ? `📎 ${pinDoc.attachments[0].fileName}` : 'Pinned message'));
        const targetId = (pinDoc?._id || pinDoc?.id || latestPin?.messageId)?.toString();

        return (
          <div
            className="chat-pinned-message-top-bar"
            onClick={() => targetId && handleSelectMessageFromSearch(targetId)}
            role="button"
            tabIndex={0}
            title="Click to jump to pinned message"
          >
            <div className="pinned-bar-left">
              <span className="pinned-bar-icon">
                <PinIcon size={14} strokeWidth={2.2} />
              </span>
              <div className="pinned-bar-text-group">
                <div className="pinned-bar-header-row">
                  <span className="pinned-bar-title">
                    Pinned Message{pinnedMessages.length > 1 ? ` (${pinnedMessages.length})` : ''}
                  </span>
                  <span className="pinned-bar-sender">· {pinSender}</span>
                </div>
                <p className="pinned-bar-snippet">{pinSnippet}</p>
              </div>
            </div>
            <div className="pinned-bar-right-actions">
              {pinnedMessages.length > 1 && (
                <button
                  type="button"
                  className="btn-pinned-bar-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPinned(true);
                  }}
                  title="View all pinned messages"
                >
                  All ({pinnedMessages.length})
                </button>
              )}
              {onUnpin && (
                <button
                  type="button"
                  className="btn-pinned-bar-unpin"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (targetId) onUnpin(targetId);
                  }}
                  title="Unpin message"
                  aria-label="Unpin message"
                >
                  <PinIcon size={13} strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Message Stream */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        highlightedMessageId={activeHighlightId}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        onLoadOlder={onLoadOlder}
        onReply={(msg) => setReplyingTo(msg)}
        onForward={(msg) => setForwardingMessage(msg)}
        onEdit={onEditMessage}
        onDelete={onDeleteMessage}
        onDeleteForMe={onDeleteMessageForMe}
        onCreateTodo={onCreateTodo ? (msg) => onCreateTodo({ conversation: chat, sourceMessage: msg }) : null}
        onShowInfo={(msg) => setInfoMessage(msg)}
        onSelectMessage={handleSelectMessageFromSearch}
        onReaction={onReaction}
        savedMessageIds={savedMessageIds}
        onSave={onSave}
        onUnsave={onUnsave}
        onPin={onPin}
        onUnpin={onUnpin}
        onOpenPollModal={(msg) => setActivePollModalMessage(msg)}
      />

      {/* Real-Time Typing Indicator Bubble */}
      {typingUser && (
        <div className="typing-indicator-bar">
          <div className="typing-bubble">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-text">{typingUser}</span>
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      {isPlanDisabled ? (
        <div className="plan-disabled-input-bar">
          <span className="plan-disabled-text">
            {isExpired ? 'Your subscription plan has expired.' : 'Your subscription has been Ended'}
          </span>
        </div>
      ) : (
        <MessageInput
          onSendMessage={handleSendMessageWithReply}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          placeholder={`Message ${displayName}...`}
          disabled={isSending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          members={chat?.participants || []}
          onCreatePoll={(pollData) => {
            onSendMessage({
              content: `📊 Poll: ${pollData.question}`,
              poll: pollData,
              messageType: 'poll',
            });
          }}
        />
      )}

      {/* Poll Voting & Results Modal */}
      {activePollModalMessage && (
        <PollModal
          isOpen={Boolean(activePollModalMessage)}
          onClose={() => setActivePollModalMessage(null)}
          message={activePollModalMessage}
          currentUserId={currentUserId}
          onVoteSuccess={(updatedPoll, msgId) => {
            const targetId = msgId || activePollModalMessage._id || activePollModalMessage.id;
            setActivePollModalMessage((prev) => (prev ? { ...prev, poll: updatedPoll } : null));
            onPollVoted?.(targetId, updatedPoll);
          }}
        />
      )}

      {/* Forward Modal */}
      {forwardingMessage && (
        <ForwardModal
          isOpen={Boolean(forwardingMessage)}
          onClose={() => setForwardingMessage(null)}
          message={forwardingMessage}
          conversations={conversations}
          channels={channels}
          currentUserId={currentUserId}
          onConfirmForward={onForwardMessage}
        />
      )}

      {/* Message Info Modal */}
      {infoMessage && (
        <MessageInfoModal
          isOpen={Boolean(infoMessage)}
          onClose={() => setInfoMessage(null)}
          message={infoMessage}
        />
      )}
      <PinnedMessagesPanel
        isOpen={showPinned}
        onClose={() => setShowPinned(false)}
        pinnedMessages={pinnedMessages}
        loading={pinnedLoading}
        onUnpin={onUnpin}
        onSelectMessage={(messageId) => {
          setShowPinned(false);
          onSelectMessageFromSearch(messageId);
        }}
      />
    </div>
  );
}

export default ChatWindow;
