import Avatar from '../common/Avatar';

function ContactItem({ contact, onMessageContact }) {
  const role = contact.role || 'Team Member';

  return (
    <div className="contact-list-item">
      <div className="contact-avatar-wrapper">
        <Avatar
          name={contact.name}
          image={contact.avatar}
          size="medium"
        />
      </div>

      <div className="contact-details">
        <div className="contact-name-row">
          <span className="contact-name">{contact.name}</span>
        </div>
        <span className="contact-role">{role}</span>
        <span className="contact-email">{contact.email}</span>
      </div>

      <button
        type="button"
        className="btn-contact-action"
        onClick={() => onMessageContact(contact)}
        aria-label={`Send message to ${contact.name}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="msg-icon"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Message
      </button>
    </div>
  );
}

export default ContactItem;
