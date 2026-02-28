"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

interface Deployment {
  id: string;
  name: string;
  status: string;
  neonProjectId: string | null;
  neonDatabaseUrl: string | null;
  createdAt: string;
  updatedAt: string;
  environment: string;
}

export default function DeploymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDeployment = async () => {
    try {
      const response = await fetch(`/api/deployments/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Deployment not found");
        }
        throw new Error("Failed to fetch deployment");
      }
      const data = await response.json();
      setDeployment(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load deployment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeployment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-refresh polling
  useEffect(() => {
    if (!deployment) return;

    const shouldPoll =
      deployment.status !== "SUCCESS" && deployment.status !== "FAILED";

    if (!shouldPoll) return;

    const interval = setInterval(() => {
      fetchDeployment();
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment?.status]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case "DEV":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {environment}
          </span>
        );
      case "UAT":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
            {environment}
          </span>
        );
      case "PROD":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            {environment}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
            {environment}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
            {status}
          </span>
        );
      case "FAILED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            {status}
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 animate-pulse">
            {status}
          </span>
        );
      case "PROVISIONING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {status}
          </span>
        );
      case "DEPLOYING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 animate-pulse">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const extractRegion = (url: string | null): string => {
    if (!url) return "N/A";
    // Extract region from Neon connection string if available
    // Format: postgres://user:pass@host.region.neon.tech/db
    const match = url.match(/@([^.]+)\.([^.]+)\.neon\.tech/);
    if (match) {
      return match[2] || "N/A";
    }
    return "N/A";
  };

  const extractHost = (url: string | null): string => {
    if (!url) return "N/A";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || "N/A";
    } catch {
      return "N/A";
    }
  };

  const handleCopyConnectionString = async () => {
    if (!deployment?.neonDatabaseUrl) return;

    try {
      await navigator.clipboard.writeText(deployment.neonDatabaseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-cyan-500"></div>
          <p className="mt-4 text-slate-400">Loading deployment...</p>
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Deployment not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 text-white font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Circle */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-cyan-500 opacity-20 blur-3xl animate-pulse"></div>

      {/* Navbar */}
      <nav className="sticky top-0 backdrop-blur-md bg-white/5 border-b border-white/10 flex justify-between items-center px-6 py-4 z-50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">InfraPilot</h1>
          <p className="text-xs text-slate-400">by Codezista</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 text-white font-medium"
        >
          Back to Dashboard
        </button>
      </nav>

      {/* Main Container */}
      <div className="container mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight mb-2">
              {deployment.name}
            </h2>
            <p className="text-slate-400">Deployment Details</p>
          </div>

          {/* Glass Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deployment Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Deployment Name
                    </label>
                    <p className="mt-2 text-lg font-medium text-white">
                      {deployment.name}
                    </p>
                  </div>

                  {/* Environment */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Environment
                    </label>
                    <div className="mt-2">{getEnvironmentBadge(deployment.environment)}</div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="mt-2">{getStatusBadge(deployment.status)}</div>
                  </div>

                  {/* Neon Project ID */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Neon Project ID
                    </label>
                    <p className="mt-2 text-sm text-slate-300 font-mono">
                      {deployment.neonProjectId || "N/A"}
                    </p>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Created At
                    </label>
                    <p className="mt-2 text-sm text-slate-300">
                      {formatDate(deployment.createdAt)}
                    </p>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Region
                    </label>
                    <p className="mt-2 text-sm text-slate-300">
                      {extractRegion(deployment.neonDatabaseUrl)}
                    </p>
                  </div>

                  {/* Endpoint Host */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Endpoint Host
                    </label>
                    <p className="mt-2 text-sm text-slate-300 font-mono break-all">
                      {extractHost(deployment.neonDatabaseUrl)}
                    </p>
                  </div>
                </div>

                {/* Connection String */}
                {deployment.neonDatabaseUrl && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Connection String
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deployment.neonDatabaseUrl}
                        readOnly
                        className="flex-1 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-slate-300 font-mono"
                      />
                      <button
                        onClick={handleCopyConnectionString}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Neon Operation State */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Current Operation State
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(deployment.status)}
                    {deployment.status !== "SUCCESS" &&
                      deployment.status !== "FAILED" && (
                        <span className="text-xs text-slate-400">
                          (Auto-refreshing...)
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 pb-8">
        <p>© 2026 Codezista — InfraPilot</p>
        <p className="mt-1">
          Support:{" "}
          <a
            href="mailto:infrapilot.user.support@gmail.com"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            infrapilot.user.support@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}

