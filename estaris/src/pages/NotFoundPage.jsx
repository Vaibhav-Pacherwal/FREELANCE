import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-32 pb-24 px-4 bg-[#faf9f6]">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white border border-[#e7e5e0] text-center space-y-6 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#e7e5e0] text-[#18181b] font-bold text-sm">
          404
        </div>

        <div>
          <div className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
            Page Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#121316] mt-2">
            Page Not Found
          </h1>
          <p className="text-sm text-[#52525b] mt-2">
            The page you are looking for has moved or does not exist.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button to="/" variant="primary" size="md">
            Return to Studio Home
          </Button>
        </div>
      </div>
    </div>
  );
}
