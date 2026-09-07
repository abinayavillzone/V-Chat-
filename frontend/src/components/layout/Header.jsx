import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import NotificationBell from '../notifications/NotificationBell';
import SearchDropdown from '../search/SearchDropdown';
import { searchAll } from '../../services/searchService';

function Header({
  activeTab,
  selectedTitle,
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  onSelectNotification,
  onSelectSearchResult,
}) {
  const { user } = useAuth();
  const userName = user?.name || 'Teammate';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all');
  const [searchResults, setSearchResults] = useState({
    messages: [],
    files: [],
    channels: [],
    users: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Debounced Global Search Execution
  const performSearch = useCallback(
    async (query, filter) => {
      if (!query.trim()) {
        setSearchResults({ messages: [], files: [], channels: [], users: [] });
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const data = await searchAll(query.trim(), filter);
        if (data.success) {
          setSearchResults(
            data.results || { messages: [], files: [], channels: [], users: [] }
          );
        }
      } catch (err) {
        console.error('Search error:', err.message);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length >= 1 && trimmed !== '#') {
      setIsSearchOpen(true);
      setIsSearching(true);
      searchDebounceRef.current = setTimeout(() => {
        performSearch(searchQuery, searchFilter);
      }, 250);
    } else {
      setIsSearchOpen(false);
      setSearchResults({ messages: [], files: [], channels: [], users: [] });
      setIsSearching(false);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, searchFilter, performSearch]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result, type) => {
    setIsSearchOpen(false);
    onSearchChange('');
    if (onSelectSearchResult) {
      onSelectSearchResult(result, type);
    }
  };

  // Section title mapping
  const getSectionTitle = () => {
    if (selectedTitle) return selectedTitle;
    switch (activeTab) {
      case 'chats':
        return 'Chats';
      case 'channels':
        return 'Channels';
      case 'contacts':
        return 'Team Members';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="btn-hamburger"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h2 className="header-section-title">{getSectionTitle()}</h2>
      </div>

      <div className="header-center" ref={searchContainerRef}>
        <SearchBar
          placeholder="Search workspace (messages, files, channels)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {isSearchOpen && (
          <SearchDropdown
            query={searchQuery}
            results={searchResults}
            loading={isSearching}
            activeFilter={searchFilter}
            onFilterChange={setSearchFilter}
            onSelectResult={handleResultClick}
            onClose={() => {
              setIsSearchOpen(false);
              onSearchChange('');
            }}
          />
        )}
      </div>

      <div className="header-right">
        {/* Real-Time Notification Bell & Dropdown */}
        <NotificationBell onSelectNotification={onSelectNotification} />

        <div className="header-user-pill">
          <Avatar name={userName} image={user?.avatar} size="small" />
          <span className="header-user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
