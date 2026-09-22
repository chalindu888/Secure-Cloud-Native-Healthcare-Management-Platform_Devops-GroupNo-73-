import React from 'react';
import { Activity, ShieldCheck, GitBranch, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      {/* DevSecOps Status Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-300">Cluster Status:</span>
            <span className="text-emerald-400 font-medium">All Pods Healthy (3/3)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={14} className="text-blue-400" />
              Trivy Scan: <strong className="text-emerald-400 font-medium">0 Critical</strong>
            </span>
            <span className="hidden sm:inline-block text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Quality Gate: <strong className="text-emerald-400 font-medium">Passed (A)</strong>
            </span>
            <span className="hidden sm:inline-block text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <GitBranch size={14} className="text-indigo-400" />
              GitOps: <strong className="text-indigo-300 font-medium">Argo CD Synced</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Activity size={18} />
              </div>
              <span className="font-bold text-white text-lg">HealthOps</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure Cloud-Native Healthcare Management Platform with Automated DevSecOps, Role-Based Access Control, and Continuous Observability.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">DevOps Pipeline</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-blue-400 transition cursor-pointer">Continuous Integration (GitHub Actions)</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Dockerized Container Images</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Kubernetes Orchestration</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Infrastructure as Code (Terraform)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Security & Compliance</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="hover:text-blue-400 transition cursor-pointer">JWT + Role-Based Access Control (RBAC)</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Trivy Vulnerability Scanner</li>
              <li className="hover:text-blue-400 transition cursor-pointer">SonarQube Code Analysis</li>
              <li className="hover:text-blue-400 transition cursor-pointer">Prometheus & Grafana Telemetry</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Academic Project Details</h4>
            <p className="text-xs text-slate-300 font-semibold mb-1">DevOps Engineering (EC5207) - Group 73</p>
            <div className="text-xs text-slate-400 space-y-1 mt-2">
              <p>EG/2023/5897 — Silva TCK</p>
              <p>EG/2023/5902 — Siriwardena M.K.W.L</p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HealthOps Platform. Built with React & Tailwind CSS.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">Production Build</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
