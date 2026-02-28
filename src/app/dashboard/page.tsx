"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Deployment {
  id: string;
  name: string;
  status: string;
  neonProjectId: string;
  createdAt: string;
  environment: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deploymentName, setDeploymentName] = useState("");
  const [environment, setEnvironment] = useState<string>("DEV");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/deployments");
      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }
      const data = await response.json();
      setDeployments(data);
      setFilteredDeployments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load deployments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  // Filter deployments based on active filter
  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredDeployments(deployments);
    } else {
      setFilteredDeployments(
        deployments.filter((d) => d.environment === activeFilter)
      );
    }
  }, [activeFilter, deployments]);

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
        body: JSON.stringify({ name: deploymentName, environment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create deployment");
      }

      setDeploymentName("");
      setEnvironment("DEV");
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
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
            {status}
          </span>
        );
    }
  };

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
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 text-white font-medium"
        >
          Create Deployment
        </button>
      </nav>

      {/* Main Container */}
      <div className="container mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center mt-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Cloud Infrastructure Dashboard
          </h2>
          <p className="mt-4 text-slate-400">
            Manage and monitor your cloud infrastructure deployments
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Deployments Section */}
        <div className="mt-12 max-w-5xl mx-auto">
          {/* Filter Tabs */}
          <div className="mb-4 flex gap-2 border-b border-white/10">
            {["All", "DEV", "UAT", "PROD"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
                  activeFilter === filter
                    ? "text-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter}
                {activeFilter === filter && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"
                    layoutId="activeFilter"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10">
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-cyan-500"></div>
                <p className="mt-4 text-slate-400">Loading deployments...</p>
              </div>
            ) : filteredDeployments.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-slate-400">No deployments found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-sm text-slate-400 px-6 py-4">
                      Name
                    </th>
                    <th className="text-left text-sm text-slate-400 px-6 py-4">
                      Environment
                    </th>
                    <th className="text-left text-sm text-slate-400 px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-sm text-slate-400 px-6 py-4">
                      Neon Project ID
                    </th>
                    <th className="text-left text-sm text-slate-400 px-6 py-4">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredDeployments.map((deployment) => (
                    <tr
                      key={deployment.id}
                      onClick={() => router.push(`/dashboard/${deployment.id}`)}
                      className="px-6 py-4 hover:bg-white/5 transition duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">
                          {deployment.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEnvironmentBadge(deployment.environment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(deployment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400 font-mono">
                          {deployment.neonProjectId || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400">
                          {formatDate(deployment.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-500">
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

      {/* Create Deployment Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setDeploymentName("");
                setEnvironment("DEV");
                setError(null);
              }
            }}
          >
            <motion.div
              className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all duration-200"
                    placeholder="Enter deployment name"
                    disabled={creating}
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="environment"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Environment
                  </label>
                  <select
                    id="environment"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 transition-all duration-200"
                    disabled={creating}
                  >
                    <option value="DEV">DEV</option>
                    <option value="UAT">UAT</option>
                    <option value="PROD">PROD</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setDeploymentName("");
                      setEnvironment("DEV");
                      setError(null);
                    }}
                    className="px-4 py-2 text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={creating}
                  >
                    {creating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    )}
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
