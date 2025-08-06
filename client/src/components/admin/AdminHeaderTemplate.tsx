import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Settings } from 'lucide-react';

interface AdminHeaderTemplateProps {
  title: string;
  filePath?: string;
  backLink?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function AdminHeaderTemplate({
  title,
  filePath,
  backLink = "/admin",
  backLabel = "Retour Admin",
  children
}: AdminHeaderTemplateProps) {
  return (
    <div className="mb-8 admin-template-header pt-6" data-template="true">
      <div className="max-w-7xl mx-auto px-6">
        {/* Ligne de navigation avec retour */}
        <div className="mb-1">
          <Link href={backLink}>
            <span className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm admin-programmatic cursor-pointer">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {backLabel}
            </span>
          </Link>
        </div>
        
        {/* Ligne principale avec titre et icône app */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-extralight text-gray-800 uppercase tracking-wide admin-header-title">
              {title}
            </h1>
            {filePath && (
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  {filePath}
                </p>
                <p className="text-xs text-blue-600" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  {window.location.pathname}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 mr-16">
            {children}
            
            {/* Zone app - Carré arrondi comme une app de téléphone */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 shadow-sm">
              <span className="text-xs font-mono font-black text-black leading-none">YHOM</span>
              <span className="text-[10px] font-mono font-black text-black leading-none">.APP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}