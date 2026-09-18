import React from 'react';
import Badge from './Badge';

export default function SectionHeading({
  badge,
  badgeVariant = 'neutral',
  title,
  italicWord,
  description,
  align = 'left',
  action,
  className = ''
}) {
  const isCenter = align === 'center';

  return (
    <div className={`mb-12 md:mb-16 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-4xl'} ${className}`}>
      {badge && (
        <div className={`mb-4 flex ${isCenter ? 'justify-center' : 'justify-start'}`}>
          <Badge variant={badgeVariant} dot>{badge}</Badge>
        </div>
      )}

      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${isCenter ? 'items-center text-center' : ''}`}>
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#121316] leading-[1.15]">
            {title}{' '}
            {italicWord && (
              <span className="font-editorial text-[#52525b] font-normal italic">
                {italicWord}
              </span>
            )}
          </h2>

          {description && (
            <p className="mt-4 text-base sm:text-lg text-[#52525b] font-normal leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {action && !isCenter && (
          <div className="flex-shrink-0 pt-2 md:pt-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
