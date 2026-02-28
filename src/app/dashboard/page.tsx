"use client";

import { useState, useEffect } from "react";

interface Deployment {
  id: string;
  name: string;
  status: string;
  neonProjectId: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deploymentName, setDeploymentName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/deployments");
      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }
      const data = await response.json();
      setDeployments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load deployments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDeployments();
  }, []);

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deploymentName.trim()) {
      setError("Deployment name is required");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: deploymentName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create deployment");
      }

      setDeploymentName("");
      setShowModal(false);
      await fetchDeployments();
    } catch (err: any) {
      setError(err.message || "Failed to create deployment");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse">
            {status}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
            {status}
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></span>
            <span className="relative">{status}</span>
          </span>
        );
      case "PROVISIONING":
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Radial Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950"></div>

      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Floating Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-blue-500/10 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">InfraPilot</h1>
              <p className="text-xs text-slate-400 mt-0.5">by Codezista</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              Create Deployment
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div
          className={`transition-opacity duration-700 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Hero Header Section */}
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-white">Cloud </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
                Infrastructure
              </span>
              <span className="text-white"> Dashboard</span>
            </h2>
            <p className="text-slate-400 text-lg mt-3">
              Manage and monitor your cloud infrastructure deployments
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
              >
                New Deployment
              </button>
              <button className="px-6 py-3 border-2 border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                View Docs
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl backdrop-blur-sm transition-opacity duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {error}
            </div>
          )}

          {/* Deployments Glass Card */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800/50 overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500">
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-blue-500"></div>
                <p className="mt-4 text-slate-400">Loading deployments...</p>
              </div>
            ) : deployments.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-slate-400">No deployments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/60 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Neon Project ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {deployments.map((deployment, index) => (
                      <tr
                        key={deployment.id}
                        className="hover:bg-white/5 transition-all duration-300 cursor-pointer group hover:scale-[1.01]"
                        style={{
                          animationDelay: `${index * 30}ms`,
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors duration-200">
                            {deployment.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(deployment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-400 font-mono group-hover:text-slate-300 transition-colors">
                            {deployment.neonProjectId || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            {formatDate(deployment.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 pb-8 text-center">
        <p className="text-sm text-slate-500">
          © 2026 Codezista — InfraPilot
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Support:{" "}
          <a
            href="mailto:infrapilot.user.support@gmail.com"
            className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          >
            infrapilot.user.support@gmail.com
          </a>
        </p>
      </footer>

      {/* Create Deployment Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fade-in_0.2s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setDeploymentName("");
              setError(null);
            }
          }}
        >
          <div
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl animate-[scale-in_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Create Deployment
            </h2>
            <form onSubmit={handleCreateDeployment}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Deployment Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all duration-200"
                  placeholder="Enter deployment name"
                  disabled={creating}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setDeploymentName("");
                    setError(null);
                  }}
                  className="px-4 py-2 text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all duration-200 disabled:opacity-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  disabled={creating}
                >
                  {creating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s ease infinite;
          }
        `
      }} />
    </div>
  );
}
