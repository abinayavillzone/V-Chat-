import { useState, useEffect, useCallback } from 'react';
import AdminConfirmModal from './AdminConfirmModal';
import ChannelMembersModal from './ChannelMembersModal';
import { ChannelIcon, LockIcon, SearchIcon } from '../common/Icons';
import {
  getAdminChannels,
  createAdminChannel,
  updateAdminChannel,
  deleteAdminChannel,
} from '../../services/adminService';

function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [privacyTab, setPrivacyTab] = useState('all'); // 'all' | 'public' | 'private' | 'archived'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Members Modal State
  const [selectedChannelForMembers, setSelectedChannelForMembers] = useState(null);

  // Create Channel Modal State
  const [createModalState, setCreateModalState] = useState({
    isOpen: false,
    name: '',
    description: '',
    isPrivate: false,
    loading: false,
  });

  // Edit Channel Modal State
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    channel: null,
    name: '',
    description: '',
    isPrivate: false,
    isArchived: false,
    loading: false,
  });

  // Delete Channel Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    channel: null,
    loading: false,
  });

  // Archive / Deactivate Channel Modal State
  const [archiveModalState, setArchiveModalState] = useState({
    isOpen: false,
    channel: null,
    loading: false,
  });

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminChannels({
        page,
        limit: 15,
        search,
      });
      if (data.success) {
        setChannels(data.channels || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin channels:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const { name, description, isPrivate } = createModalState;
    if (!name.trim()) return;

    setCreateModalState((prev) => ({ ...prev, loading: true }));
    setError(null);

    try {
      const res = await createAdminChannel({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
      });
      if (res.success) {
        setSuccessMessage(`Channel #${name} created successfully`);
        setCreateModalState({ isOpen: false, name: '', description: '', isPrivate: false, loading: false });
        await loadChannels();
      }
    } catch (err) {
      console.error('Failed to create channel:', err.message);
      setError(err.response?.data?.message || 'Failed to create channel');
      setCreateModalState((prev) => ({ ...prev, loading: false }));
    } finally {
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleOpenEdit = (channel) => {
    setEditModalState({
      isOpen: true,
      channel,
      name: channel.name,
      description: channel.description || '',
      isPrivate: Boolean(channel.isPrivate),
      isArchived: Boolean(channel.isArchived),
      loading: false,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { channel, name, description, isPrivate, isArchived } = editModalState;
    if (!name.trim()) return;

    setEditModalState((prev) => ({ ...prev, loading: true }));
    setError(null);

    try {
      const res = await updateAdminChannel(channel._id, {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        isArchived,
      });
      if (res.success) {
        setSuccessMessage(`Channel #${name} updated successfully`);
        setEditModalState({ isOpen: false, channel: null, name: '', description: '', isPrivate: false, isArchived: false, loading: false });
        await loadChannels();
      }
    } catch (err) {
      console.error('Failed to update channel:', err.message);
      setError(err.response?.data?.message || 'Failed to update channel');
      setEditModalState((prev) => ({ ...prev, loading: false }));
    } finally {
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleArchivePrompt = (channel) => {
    setArchiveModalState({
      isOpen: true,
      channel,
      loading: false,
    });
  };

  const handleArchiveConfirm = async () => {
    const { channel } = archiveModalState;
    if (!channel) return;

    const nextArchived = !channel.isArchived;
    setArchiveModalState((prev) => ({ ...prev, loading: true }));
    setError(null);
    try {
      const res = await updateAdminChannel(channel._id, { isArchived: nextArchived });
      if (res.success) {
        setSuccessMessage(`Channel #${channel.name} ${nextArchived ? 'archived' : 'unarchived'} successfully`);
        setArchiveModalState({ isOpen: false, channel: null, loading: false });
        await loadChannels();
      }
    } catch (err) {
      console.error('Failed to toggle channel archive status:', err.message);
      setError(err.response?.data?.message || 'Failed to update channel status');
      setArchiveModalState((prev) => ({ ...prev, loading: false }));
    } finally {
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleDeleteConfirm = async () => {
    const { channel } = deleteModalState;
    if (!channel) return;

    setDeleteModalState((prev) => ({ ...prev, loading: true }));
    setError(null);

    try {
      const res = await deleteAdminChannel(channel._id);
      if (res.success) {
        setSuccessMessage(`Channel #${channel.name} deleted and message stream purged.`);
        setDeleteModalState({ isOpen: false, channel: null, loading: false });
        await loadChannels();
      }
    } catch (err) {
      console.error('Failed to delete channel:', err.message);
      setError(err.response?.data?.message || 'Failed to delete channel');
      setDeleteModalState((prev) => ({ ...prev, loading: false }));
    } finally {
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter channels by privacy tab
  const filteredChannels = channels.filter((ch) => {
    if (privacyTab === 'public') return !ch.isPrivate && !ch.isArchived;
    if (privacyTab === 'private') return ch.isPrivate && !ch.isArchived;
    if (privacyTab === 'archived') return ch.isArchived;
    return true;
  });

  const publicCount = channels.filter((c) => !c.isPrivate && !c.isArchived).length;
  const privateCount = channels.filter((c) => c.isPrivate && !c.isArchived).length;
  const archivedCount = channels.filter((c) => c.isArchived).length;

  return (
    <div className="admin-section-container">
      {/* 1. Sub Navigation Tabs: All / Public / Private / Archived */}
      <div className="admin-subnav-bar">
        <button
          type="button"
          className={`btn-subnav-pill ${privacyTab === 'all' ? 'active' : ''}`}
          onClick={() => setPrivacyTab('all')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ChannelIcon size={15} /> All Channels
          </span>
          <span className="subnav-badge">{totalCount}</span>
        </button>

        <button
          type="button"
          className={`btn-subnav-pill ${privacyTab === 'public' ? 'active' : ''}`}
          onClick={() => setPrivacyTab('public')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ChannelIcon size={15} /> Public
          </span>
          <span className="subnav-badge">{publicCount}</span>
        </button>

        <button
          type="button"
          className={`btn-subnav-pill ${privacyTab === 'private' ? 'active' : ''}`}
          onClick={() => setPrivacyTab('private')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LockIcon size={15} /> Private
          </span>
          <span className="subnav-badge">{privateCount}</span>
        </button>

        <button
          type="button"
          className={`btn-subnav-pill ${privacyTab === 'archived' ? 'active' : ''}`}
          onClick={() => setPrivacyTab('archived')}
        >
          <span>Archived</span>
          {archivedCount > 0 && (
            <span className="subnav-badge">{archivedCount}</span>
          )}
        </button>
      </div>

      {/* 2. Control Bar: Search and Create Action */}
      <div className="admin-control-bar">
        <div className="admin-search-input-wrapper">
          <span className="search-icon"><SearchIcon size={15} color="var(--text-muted)" /></span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search channels by name or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <button
          type="button"
          className="btn-action-small btn-primary"
          onClick={() => setCreateModalState({ isOpen: true, name: '', description: '', isPrivate: false, loading: false })}
        >
          + Create Channel
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="admin-alert-box alert-error">
          <span>{error}</span>
          <button type="button" className="btn-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {successMessage && (
        <div className="admin-alert-box alert-success">
          <span>{successMessage}</span>
          <button type="button" className="btn-dismiss" onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {/* Channels Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Description</th>
              <th>Privacy</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Members</th>
              <th>Created Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  <span className="admin-spinner" /> Loading channels...
                </td>
              </tr>
            ) : filteredChannels.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-muted">
                  {search
                    ? `No channels matching "${search}".`
                    : privacyTab !== 'all'
                    ? `No ${privacyTab} channels found in this workspace.`
                    : 'No channels created yet. Click "+ Create Channel" to add one.'}
                </td>
              </tr>
            ) : (
              filteredChannels.map((ch) => (
                <tr key={ch._id} className={ch.isArchived ? 'row-inactive' : ''}>
                  <td>
                    <div className="channel-name-cell">
                      <span className="channel-icon-pill" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'rgba(2, 132, 199, 0.08)', color: 'var(--primary-accent)' }}>
                        {ch.isPrivate ? <LockIcon size={14} /> : <ChannelIcon size={14} />}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{ch.name}</span>
                    </div>
                  </td>
                  <td className="text-muted text-snippet">{ch.description || '—'}</td>
                  <td>
                    <span className={`badge-privacy ${ch.isPrivate ? 'privacy-private' : 'privacy-public'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {ch.isPrivate ? <LockIcon size={11} /> : <ChannelIcon size={11} />}
                      {ch.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${ch.isArchived ? 'status-inactive' : 'status-active'}`}>
                      <span className="dot" /> {ch.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="text-muted">{ch.createdBy?.name || '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-member-count-pill"
                      onClick={() => setSelectedChannelForMembers(ch)}
                      title="Manage channel members"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <ChannelIcon size={13} /> {ch.memberCount} members
                    </button>
                  </td>
                  <td className="text-muted">{formatDate(ch.createdAt)}</td>
                  <td className="text-right">
                    <div className="table-actions-group">
                      <button
                        type="button"
                        className="btn-action-small btn-secondary"
                        onClick={() => handleOpenEdit(ch)}
                        title="Edit channel settings"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`btn-action-small ${ch.isArchived ? 'btn-success' : 'btn-warn'}`}
                        onClick={() => handleArchivePrompt(ch)}
                        title={ch.isArchived ? 'Unarchive channel' : 'Archive channel'}
                      >
                        {ch.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        type="button"
                        className="btn-action-small btn-danger"
                        onClick={() => setDeleteModalState({ isOpen: true, channel: ch, loading: false })}
                        title="Delete channel and purge message history"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="admin-pagination-footer">
        <span className="pagination-count">
          Showing <strong>{filteredChannels.length}</strong> of <strong>{totalCount}</strong> channels
        </span>
        <div className="pagination-controls">
          <button
            type="button"
            className="btn-page"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1 || loading}
          >
            ← Previous
          </button>
          <span className="page-indicator">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn-page"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Members Inspector Modal */}
      {selectedChannelForMembers && (
        <ChannelMembersModal
          isOpen={Boolean(selectedChannelForMembers)}
          channel={selectedChannelForMembers}
          onClose={() => setSelectedChannelForMembers(null)}
          onMembersUpdated={loadChannels}
        />
      )}

      {/* Admin Create Channel Modal */}
      {createModalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalState({ isOpen: false, name: '', description: '', isPrivate: false, loading: false })}>
          <div className="modal-container admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveCreate}>
              <div className="modal-header">
                <h3 className="modal-title">Create New Organization Channel</h3>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setCreateModalState({ isOpen: false, name: '', description: '', isPrivate: false, loading: false })}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Channel Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. engineering, announcements"
                    value={createModalState.name}
                    onChange={(e) => setCreateModalState((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Topic</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Purpose of this channel..."
                    value={createModalState.description}
                    onChange={(e) => setCreateModalState((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={createModalState.isPrivate}
                      onChange={(e) => setCreateModalState((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    <span>Private Channel (Invitation only)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCreateModalState({ isOpen: false, name: '', description: '', isPrivate: false, loading: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={createModalState.loading || !createModalState.name.trim()}>
                  {createModalState.loading ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Channel Modal */}
      {editModalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalState({ isOpen: false, channel: null, name: '', description: '', isPrivate: false, isArchived: false, loading: false })}>
          <div className="modal-container admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-header">
                <h3 className="modal-title">Edit Channel #{editModalState.channel?.name}</h3>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setEditModalState({ isOpen: false, channel: null, name: '', description: '', isPrivate: false, isArchived: false, loading: false })}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Channel Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editModalState.name}
                    onChange={(e) => setEditModalState((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Topic</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={editModalState.description}
                    onChange={(e) => setEditModalState((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editModalState.isPrivate}
                      onChange={(e) => setEditModalState((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    <span>Private Channel (Invitation only)</span>
                  </label>
                </div>

                <div className="form-checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editModalState.isArchived}
                      onChange={(e) => setEditModalState((prev) => ({ ...prev, isArchived: e.target.checked }))}
                    />
                    <span>Archive Channel (Freeze new messages)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditModalState({ isOpen: false, channel: null, name: '', description: '', isPrivate: false, isArchived: false, loading: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={editModalState.loading}>
                  {editModalState.loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Deactivate Channel Confirmation Modal */}
      {archiveModalState.isOpen && (
        <AdminConfirmModal
          isOpen={archiveModalState.isOpen}
          title={archiveModalState.channel?.isArchived ? `Unarchive Channel #${archiveModalState.channel?.name}` : `Archive Channel #${archiveModalState.channel?.name}`}
          message={
            archiveModalState.channel?.isArchived
              ? `Are you sure you want to unarchive "#${archiveModalState.channel?.name}"? Team members will immediately be able to resume messaging and operations in this channel.`
              : `Are you sure you want to archive "#${archiveModalState.channel?.name}"? New messages and posting operations will be paused, while all existing messages, discussions, and attachments will remain completely preserved and readable.`
          }
          confirmText={archiveModalState.channel?.isArchived ? 'Unarchive Channel' : 'Archive Channel'}
          isDanger={!archiveModalState.channel?.isArchived}
          loading={archiveModalState.loading}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchiveModalState({ isOpen: false, channel: null, loading: false })}
        />
      )}

      {/* Delete Channel Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModalState.isOpen}
        title={`Delete Channel #${deleteModalState.channel?.name}`}
        message={`Are you sure you want to permanently delete the channel "#${deleteModalState.channel?.name}"? All associated messages and discussion history will be purged immediately.`}
        confirmText="Delete Channel"
        isDanger={true}
        loading={deleteModalState.loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalState({ isOpen: false, channel: null, loading: false })}
      />
    </div>
  );
}

export default ChannelManagement;
