import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare
} from 'lucide-react';
import { projects } from '../data/projects';
import { siteConfig } from '../data/siteConfig';
import Button from '../components/common/Button';
import FinalCTA from '../components/home/FinalCTA';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const currentIndex = projects.findIndex(p => p.slug === slug);
  const hasMultiple = projects.length > 1;
  const nextProject = hasMultiple ? projects[(currentIndex + 1) % projects.length] : null;
  const prevProject = hasMultiple ? projects[(currentIndex - 1 + projects.length) % projects.length] : null;

  return (
    <div className="pt-32 pb-24 bg-[#faf9f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Back Link */}
        <Link 
          to="/work" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71717a] hover:text-[#18181b] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Work</span>
        </Link>

        {/* Hero Header */}
        <div className="space-y-6 max-w-4xl pb-10 border-b border-[#e7e5e0]">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#121316] text-white font-medium uppercase text-[10px] tracking-wider">
              {project.projectType}
            </span>
            <span className="text-[#71717a] font-medium">
              {project.year} · Status: {project.status}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[#121316] tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="font-serif-editorial text-2xl sm:text-3xl text-[#52525b] leading-relaxed">
            {project.tagline}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Button to="/contact" variant="primary" size="md" arrow>
              Start a Similar Project
            </Button>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=Hi%20Estaris,%20I%20saw%20your%20case%20study%20for%20${encodeURIComponent(project.title)}%20and%20want%20to%20discuss%20a%20similar%20project.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-white border border-[#e7e5e0] text-xs font-semibold text-[#18181b] hover:bg-[#f4f3ef] flex items-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Discuss via WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Project Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-7 sm:p-9 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs">
          {project.metrics.map((m, idx) => (
            <div key={idx}>
              <div className="text-[11px] text-[#71717a] uppercase tracking-wider font-semibold">{m.label}</div>
              <div className="text-lg sm:text-xl font-bold text-[#121316] mt-1">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Problem vs Solution Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-4">
            <div className="text-xs uppercase text-[#71717a] tracking-wider font-semibold">
              The Context
            </div>
            <h2 className="text-2xl font-bold text-[#121316]">Challenge & Requirements</h2>
            <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">{project.problem}</p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-4">
            <div className="text-xs uppercase text-[#71717a] tracking-wider font-semibold">
              The Solution
            </div>
            <h2 className="text-2xl font-bold text-[#121316]">Engineered Architecture</h2>
            <p className="text-sm sm:text-base text-[#52525b] leading-relaxed">{project.solution}</p>
          </div>
        </div>

        {/* Specialized Domains & Categories */}
        {project.categoriesCovered && (
          <div className="p-8 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-4">
            <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold">
              Categories Covered in Catalog:
            </div>
            <div className="flex flex-wrap gap-2.5">
              {project.categoriesCovered.map((cat, idx) => (
                <span 
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-[#faf9f6] border border-[#e7e5e0] text-xs font-medium text-[#18181b]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Underlying Architecture Layers */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold">
              System Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#121316]">
              Architectural Layers & Stack
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(project.architecture).map(([layer, spec], idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#e7e5e0] shadow-xs space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#71717a] font-semibold capitalize">
                  {layer} Layer
                </div>
                <div className="text-sm font-semibold text-[#121316]">
                  {spec}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables Checklist */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] shadow-xs space-y-6">
          <h2 className="text-2xl font-bold text-[#121316]">
            Deliverables & Engineering Highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.technicalHighlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#faf9f6] border border-[#e7e5e0]">
                <CheckCircle2 className="w-4 h-4 text-[#121316] mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#52525b] leading-relaxed">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next Pagination (Only when multiple projects exist) */}
        {hasMultiple && (
          <div className="pt-8 border-t border-[#e7e5e0] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Link
              to={`/work/${prevProject.slug}`}
              className="p-5 rounded-2xl bg-white border border-[#e7e5e0] hover:border-[#d5d2cb] flex items-center gap-3 text-[#52525b] hover:text-[#18181b] shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#71717a]" />
              <div>
                <div className="text-[10px] text-[#71717a] uppercase font-semibold">Previous Project</div>
                <div className="font-semibold text-[#121316]">{prevProject.title}</div>
              </div>
            </Link>

            <Link
              to={`/work/${nextProject.slug}`}
              className="p-5 rounded-2xl bg-white border border-[#e7e5e0] hover:border-[#d5d2cb] flex items-center justify-between text-[#52525b] hover:text-[#18181b] shadow-xs transition-colors sm:text-right"
            >
              <div>
                <div className="text-[10px] text-[#71717a] uppercase font-semibold">Next Project</div>
                <div className="font-semibold text-[#121316]">{nextProject.title}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#71717a]" />
            </Link>
          </div>
        )}

      </div>

      <FinalCTA />
    </div>
  );
}
