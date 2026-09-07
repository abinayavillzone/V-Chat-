import React from 'react';
import { ChatIcon, ChannelIcon, TodoIcon, ContactsIcon } from '../common/Icons';

/**
 * MobileBottomNav
 * Fixed bottom navigation bar visible ONLY on mobile screens (<= 900px / 768px).
 * Provides 1-tap switching between Chats, Channels, To-Dos, and Team Members / People.
 */
function MobileBottomNav({ activeTab, onSelectTab }) {
  const navItems = [
    {
      id: 'chats',
      label: 'Chats',
      icon: ChatIcon,
      ariaLabel: 'Chats navigation tab',
    },
    {
      id: 'channels',
      label: 'Channels',
      icon: ChannelIcon,
      ariaLabel: 'Channels navigation tab',
    },
    {
      id: 'todos',
      label: 'To-Dos',
      icon: TodoIcon,
      ariaLabel: 'To-Dos navigation tab',
    },
    {
      id: 'contacts',
      label: 'People',
      icon: ContactsIcon,
      ariaLabel: 'Team Members navigation tab',
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
            aria-label={item.ariaLabel}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mobile-nav-icon-wrap">
              <IconComponent size={20} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
