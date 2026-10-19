/**
 * APPROVED TESTIMONIALS — Bombay Ambulance Service 24/7
 * ==================================================
 *
 * HOW TO ADD A NEW APPROVED TESTIMONIAL
 * ──────────────────────────────────────
 * 1. A customer submits a review via the website form → WhatsApp.
 * 2. Review the message on WhatsApp. Only add it here if approved.
 * 3. Copy the template below and fill in name, rating, and text.
 * 4. Optionally include a date string (e.g. "October 2026").
 * 5. Save the file, commit, and redeploy.
 *
 * Template:
 *   {
 *     name: 'Customer Name',
 *     rating: 5,           // 1 to 5
 *     text: 'Their testimonial text.',
 *     date: 'Month Year',  // optional — omit if unknown
 *   },
 *
 * RULES
 * ─────
 * - Never invent reviews or names.
 * - Rating must be an integer from 1 to 5.
 * - Keep text concise and free of personal/medical details.
 * - The site handles an empty array gracefully (section hidden).
 */

const approvedTestimonials = [
  // Add approved testimonials here. Example:
  // {
  //   name: 'Rajesh M.',
  //   rating: 5,
  //   text: 'Responded within minutes. The team was professional and caring throughout the journey.',
  //   date: 'October 2026',
  // },
]

export default approvedTestimonials
