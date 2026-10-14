# Content Management Guide
## Dhruv Chauhan Portfolio Website

---

## How to Update Website Content from Your Phone

### Current Setup
All editable content lives in one file:
```
src/data/siteData.js
```

This file controls:
- Your biography and roles
- All testimonials/reviews
- Service categories and descriptions
- Gallery items (once photos are added)
- Contact details (phone, WhatsApp, social links)
- Character artist names and descriptions

---

## Option A — Update via GitHub (Free, Works on Phone)

**Best for:** Text changes, adding reviews, updating contact info.

**Steps:**
1. Create a free GitHub account at github.com
2. Have the developer push the project to a GitHub repository
3. On your phone: open the GitHub app or go to github.com
4. Navigate to `src/data/siteData.js`
5. Tap the pencil ✏️ icon to edit
6. Make your changes
7. Tap "Commit changes"
8. The site updates automatically (if Netlify/Vercel is connected)

**Limitations:** You need to be comfortable with a code file. Photos must be added via PR or separately.

---

## Option B — Netlify CMS (Free Tier, Mobile-Friendly UI)

**Best for:** Non-technical updates — adding reviews, photos, bios without editing code.

**Cost:** Free for personal projects on Netlify.

**Setup required:**
1. Deploy site on Netlify
2. Add Netlify CMS configuration (1–2 hours of developer time)
3. Connect GitHub repository
4. Invite Dhruv as an editor

**After setup:** Dhruv can log in at `yoursite.com/admin`, add photos, edit text, and manage content from any device.

**Note:** Not yet configured. Requires developer setup and GitHub connection.

---

## Option C — Sanity.io (Recommended for Scalability)

**Cost:** Free tier available (up to 3 users, 10GB assets).

**Best for:** Managing large photo galleries, multiple testimonials, character entries.

**Setup required:** ~4–6 hours of developer time.

**After setup:** Full mobile CMS dashboard with image uploads, drag-and-drop gallery ordering, and preview.

---

## What Requires Client Confirmation Before Launch

| Item | Status | Action Required |
|------|--------|-----------------|
| Phone number | ❌ Missing | Provide real number |
| WhatsApp number | ❌ Missing | Provide real number |
| Instagram URL | ❌ Missing | Confirm exact handle |
| YouTube channel URL | ❌ Missing | Confirm exact URL |
| Email address | ❌ Missing | Confirm contact email |
| Showreel YouTube URL | ❌ Missing | Provide video URL |
| Corporate showreel URL | ❌ Missing | Provide video URL |
| Hero photo | ❌ Missing | Provide high-res stage photo |
| Corporate event photo | ❌ Missing | Provide event photography |
| Real biography | ⚠️ Placeholder | Confirm/write real bio |
| Verified stats | ⚠️ Placeholder | Confirm events/cities/years |
| Real testimonials | ❌ Missing | Provide verified reviews |
| Client logos | ❌ Missing | Provide authorized logos |
| Gallery photos | ❌ Missing | Provide event photography |
| Character names | ⚠️ Working labels | Confirm exact spellings |
| Pricing decision | ⚠️ Pending | See pricing note below |

---

## Updating Contact Information

Edit these lines in `src/data/siteData.js`:

```js
phone: '+91-9582585258',        // → Your real number
whatsapp: 'https://wa.me/9582585258', // → Replace XXXXXXXXXX
instagram: 'https://instagram.com/dhruvchauhan', // → Your handle
youtube: 'https://youtube.com/@dhruvchauhan',    // → Your channel
showreelUrl: 'https://www.youtube.com/embed/VIDEO_ID', // → Your video
```

---

## Adding a Real Testimonial

In `src/data/siteData.js`, find the `testimonials` array and add:

```js
{
  id: 5,                          // Unique number
  text: '"Dhruv hosted our sangeet and it was absolutely magical..."',
  name: 'Priya Sharma',          // Reviewer name (get permission)
  role: 'Bride\'s Family',       // Their role/relation
  event: 'Wedding — Sangeet',    // Event type
  category: 'wedding',           // wedding | corporate | character-artist | stand-up-comedy
  source: 'Google',              // Where the review is from
  sourceUrl: 'https://g.page/...', // Direct link to review (optional)
  isPlaceholder: false,          // Set to false for real reviews
},
```

**Important:** Only add real reviews. Do not paraphrase or invent content.

---

## Adding Gallery Photos

In `src/data/siteData.js`, find `galleryItems` and add:

```js
{
  id: 'sangeet-2024-1',
  src: '/gallery/sangeet-2024-1.jpg',  // Photo filename in /public/gallery/
  alt: 'Dhruv hosting a sangeet night in Delhi',
  category: 'wedding',
  subcategory: 'Sangeet',
  type: 'image',
  caption: 'Sangeet Night — Delhi 2024',
  isPlaceholder: false,
},
```

Place the photo file in `vite-project/public/gallery/`.

**Photo requirements:**
- Format: JPEG or WebP preferred
- Size: Max 1200px wide
- File size: Keep under 500KB for fast loading

---

## Adding a YouTube Video to the Gallery

```js
{
  id: 'comedy-show-1',
  type: 'video',
  videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
  alt: 'Dhruv Chauhan stand-up comedy clip',
  category: 'stand-up-comedy',
  subcategory: 'Live Shows',
  caption: 'Stand-up Comedy Show — 2024',
  isPlaceholder: false,
},
```

---

*Last updated: October 2026*
*For technical support, contact the developer.*
