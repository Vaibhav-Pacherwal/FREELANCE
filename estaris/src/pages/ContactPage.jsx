import React, { useState } from 'react';
import {
  MessageSquare,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/common/SocialIcons';
import { siteConfig } from '../data/siteConfig';
import Badge from '../components/common/Badge';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Bespoke Website',
    scopeTier: 'Brand & Business Website',
    timeline: '2 to 4 Weeks',
    description: ''
  });

  const [submittedMethod, setSubmittedMethod] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = () => {
    return encodeURIComponent(
      `*New Project Inquiry — ESTARIS*\n\n` +
      `*Name:* ${formData.name || 'Not provided'}\n` +
      `*Email:* ${formData.email || 'Not provided'}\n` +
      `*Phone/WhatsApp:* ${formData.phone || 'Not provided'}\n` +
      `*Project Type:* ${formData.projectType}\n` +
      `*Estimated Scope:* ${formData.scopeTier}\n` +
      `*Target Timeline:* ${formData.timeline}\n\n` +
      `*Project Description:*\n${formData.description || 'No additional description entered.'}`
    );
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const url = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank');
    setSubmittedMethod('whatsapp');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    const recipient = siteConfig.contact.inquiryEmail || 'estaris438@gmail.com';
    const subject = `Estaris Project Inquiry — ${formData.projectType || 'New Project'}`;
    const body =
      `Hello Estaris,

I would like to discuss an upcoming project with your studio.

Name: ${formData.name.trim() || 'Not provided'}
Email: ${formData.email.trim() || 'Not provided'}
Phone / WhatsApp: ${formData.phone.trim() || 'Not provided'}
Project Classification: ${formData.projectType}
Project Scope Tier: ${formData.scopeTier}
Target Timeline: ${formData.timeline}

Project Overview:
${formData.description.trim() || 'No additional description provided.'}

Looking forward to your response.

Regards,
${formData.name.trim() || 'Prospective Client'}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    setSubmittedMethod('email');
  };

  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <Badge variant="neutral" dot size="sm" className="mb-4">
            Start a Project
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#121316] leading-tight">
            Have something{' '}
            <span className="font-editorial italic font-normal text-[#52525b]">
              worth building?
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#52525b] leading-relaxed">
            Tell us about your project, timeline, and goals. Your submission formats a direct message via WhatsApp or prepares an email draft with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Interactive Project Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-[#e7e5e0] rounded-3xl p-6 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e7e5e0] text-xs text-[#71717a]">
              <span className="text-[#18181b] font-semibold">Scope Formulation Form</span>
              <span className="font-medium">Direct Founder Dispatch</span>
            </div>

            <form className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="inquiry-name" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                    Your Name *
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="inquiry-email" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                    Email Address *
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-2">
                <label htmlFor="inquiry-phone" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                  Phone / WhatsApp Number
                </label>
                <input
                  id="inquiry-phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98121 51633"
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors"
                />
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <label htmlFor="inquiry-type" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                  Project Type
                </label>
                <select
                  id="inquiry-type"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors cursor-pointer font-sans"
                >
                  <option value="Bespoke Website">Bespoke Website / Brand Flagship</option>
                  <option value="E-Commerce Platform">E-Commerce Platform & Storefront</option>
                  <option value="Full-Stack Web Application">Full-Stack Web Application (SaaS / Portal)</option>
                  <option value="Custom Software">Custom Software & Tooling</option>
                  <option value="Other / Consultation">Other / Technical Consultation</option>
                </select>
              </div>

              {/* Scope & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="inquiry-scope" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                    Scope Tier
                  </label>
                  <select
                    id="inquiry-scope"
                    name="scopeTier"
                    value={formData.scopeTier}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors cursor-pointer font-sans"
                  >
                    <option value="Brand & Business Website">Brand & Business Website</option>
                    <option value="E-Commerce Storefront Engine">E-Commerce Storefront Engine</option>
                    <option value="Full-Stack Custom Application">Full-Stack Custom Application</option>
                    <option value="To be discussed based on requirements">To be discussed based on requirements</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="inquiry-timeline" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                    Target Timeline
                  </label>
                  <select
                    id="inquiry-timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors cursor-pointer font-sans"
                  >
                    <option value="Urgent (1 to 2 Weeks)">Urgent (1 to 2 Weeks)</option>
                    <option value="2 to 4 Weeks">Standard (2 to 4 Weeks)</option>
                    <option value="1 to 2 Months">Comprehensive (1 to 2 Months)</option>
                    <option value="Flexible / Ongoing">Flexible / Ongoing</option>
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <label htmlFor="inquiry-desc" className="text-xs uppercase tracking-wider text-[#71717a] font-semibold block">
                  Project Overview & Key Goals
                </label>
                <textarea
                  id="inquiry-desc"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us what you're building, desired pages or features, reference websites, or technical requirements..."
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] text-sm focus:border-[#18181b] focus:outline-none transition-colors resize-y font-sans"
                />
              </div>

              {/* Dual Action Triggers */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="w-full sm:w-1/2 py-3.5 px-4 rounded-full bg-[#f4f3ef] hover:bg-[#eae8e2] border border-[#e7e5e0] text-[#18181b] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <Mail className="w-4 h-4 text-[#18181b]" />
                  <span>Inquire via Email</span>
                </button>
              </div>

              <div className="text-[11px] text-[#71717a] text-center pt-2">
                * Note: Inquiries directly launch your preferred channel with your inputs formatted.
              </div>
            </form>
          </div>

          {/* Right Column: Studio Contact Details & Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white border border-[#e7e5e0] p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#18181b]">
                Direct Studio Channels
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-1">
                  <div className="text-[11px] text-[#71717a] uppercase font-semibold">Inquiries Email</div>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.contact.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#18181b] hover:underline block"
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-1">
                  <div className="text-[11px] text-[#71717a] uppercase font-semibold">Instant WhatsApp Line</div>
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi%20Estaris,%20I'd%20like%20to%20discuss%20a%20project.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#18181b] hover:underline flex items-center gap-1.5"
                  >
                    <span>{siteConfig.contact.phone}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#71717a]" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] space-y-1">
                  <div className="text-[11px] text-[#71717a] uppercase font-semibold">Location & Timezone</div>
                  <div className="text-sm text-[#18181b] font-medium">
                    {siteConfig.contact.timezone} • New Delhi, India / Remote
                  </div>
                  <div className="text-xs text-[#71717a] pt-0.5">
                    Responses typically returned within 12 to 24 hours.
                  </div>
                </div>
              </div>

              {/* Social Profiles */}
              <div className="pt-4 border-t border-[#e7e5e0]">
                <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold mb-3">Studio Profiles:</div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={siteConfig.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-xs text-[#18181b] font-medium hover:bg-[#eae8e2] flex items-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Studio GitHub</span>
                  </a>
                  <a
                    href={siteConfig.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-xs text-[#18181b] font-medium hover:bg-[#eae8e2] flex items-center gap-1.5 transition-colors"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>Studio LinkedIn</span>
                  </a>
                  <a
                    href={siteConfig.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-xs text-[#18181b] font-medium hover:bg-[#eae8e2] flex items-center gap-1.5 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Studio Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Availability Guarantee */}
            <div className="p-6 rounded-3xl bg-white border border-[#e7e5e0] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold uppercase tracking-wider">Availability: Taking on Select Projects</span>
              </div>
              <p className="text-xs text-[#52525b] leading-relaxed">
                We accept a limited roster of concurrent builds per sprint to ensure uncompromising code quality and direct founder attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
