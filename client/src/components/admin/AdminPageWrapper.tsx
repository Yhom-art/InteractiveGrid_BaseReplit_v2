import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings } from 'lucide-react';

interface AdminPageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backLink?: string;
  backLabel?: string;
}

export function AdminPageWrapper({ 
  title, 
  subtitle, 
  children, 
  backLink = "/",
  backLabel = "GridMap"
}: AdminPageWrapperProps) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        zIndex: 1000
      }}
      className="bg-gradient-to-br from-slate-50 to-blue-50"
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header unifié */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={backLink} className="p-2 hover:bg-gray-200 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}