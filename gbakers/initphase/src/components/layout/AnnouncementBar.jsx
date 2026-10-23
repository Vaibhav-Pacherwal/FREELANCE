import './AnnouncementBar.css';

export default function AnnouncementBar() {
  /* Seasonal / offer message — replace content as needed */
  const message =
    'Freshly baked, delivered with love · Free delivery on orders above ₹999 · Same-day delivery available';

  return (
    <div className="announcement-bar" role="marquee" aria-label="Announcements">
      <div className="announcement-bar__track">
        <span className="announcement-bar__text">{message}</span>
        <span className="announcement-bar__separator" aria-hidden="true">✦</span>
        <span className="announcement-bar__text">{message}</span>
        <span className="announcement-bar__separator" aria-hidden="true">✦</span>
        <span className="announcement-bar__text">{message}</span>
        <span className="announcement-bar__separator" aria-hidden="true">✦</span>
        <span className="announcement-bar__text">{message}</span>
        <span className="announcement-bar__separator" aria-hidden="true">✦</span>
      </div>
    </div>
  );
}
