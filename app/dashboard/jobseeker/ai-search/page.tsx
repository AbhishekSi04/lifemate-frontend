"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Search,
  MapPin,
  Briefcase,
  IndianRupee,
  Building2,
  Clock,
  ChevronLeft,
  Bookmark,
  CheckCircle,
  Zap,
  ArrowRight,
  Loader2,
  RotateCcw,
  FileText,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface SemanticJob {
  _id: string;
  title: string;
  organizationName?: string;
  specialization?: string;
  location?: { city?: string; state?: string; country?: string };
  jobType?: string;
  shift?: string;
  isRemote?: boolean;
  experienceRequired?: { minYears?: number; maxYears?: number };
  salary?: { min?: number; max?: number; currency?: string; period?: string };
  description?: string;
  requirements?: string[];
  benefits?: string[];
  status?: string;
  postedAt?: string;
  aiExplanation?: string | null;
  relevanceScore?: number | null;
}

interface SearchResult {
  query: string;
  searchMode: "vector" | "text_fallback";
  results: SemanticJob[];
  totalFound: number;
  aiSummary: string;
}

// ─────────────────────────────────────────────
// Suggested queries
// ─────────────────────────────────────────────
const SUGGESTED_QUERIES = [
  "Night shift cardiology job in Mumbai",
  "Remote pediatrics role with flexible hours",
  "Senior surgeon position in Delhi with good pay",
  "Part-time nursing job near Bangalore",
  "Gynecologist vacancy in a private hospital",
  "ICU specialist with 5+ years experience",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatSalary = (amt?: number) => {
  if (!amt) return null;
  return `₹${(amt / 100000).toFixed(1)} LPA`;
};

const getTimeAgo = (date?: string) => {
  if (!date) return "";
  const diffDays = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const getScoreColor = (score?: number | null) => {
  if (!score) return "bg-gray-100 text-gray-500";
  if (score >= 0.85) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (score >= 0.7) return "bg-blue-50 text-blue-700 border border-blue-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function AISearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Auth guard on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "jobseeker") {
      router.push("/login");
      return;
    }

    // Load saved jobs
    fetchSavedJobs(token);

    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem("ai_search_history") || "[]");
    setSearchHistory(history.slice(0, 5));

    // Auto-focus search input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [router]);

  const fetchSavedJobs = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/saved-jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        const ids = (data.data?.items || []).map(
          (item: any) => String(item.job?._id || item.jobId || item.job)
        );
        setSavedIds(new Set(ids));
      }
    } catch {}
  };

  const saveJob = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Please log in to save jobs.");
    const isSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/jobs/${id}/${isSaved ? "unsave" : "save"}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        setSavedIds((prev) => {
          const revert = new Set(prev);
          isSaved ? revert.add(id) : revert.delete(id);
          return revert;
        });
        toast.error("Failed to update saved job.");
      } else {
        toast.success(isSaved ? "Job removed from saved." : "Job saved!");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q || q.length < 2) {
      toast.error("Please enter at least 2 characters.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/semantic-search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: q, limit: 10, explain: true }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResult(data.data);
        setQuery(q);

        // Save to history
        const history = JSON.parse(localStorage.getItem("ai_search_history") || "[]");
        const newHistory = [q, ...history.filter((h: string) => h !== q)].slice(0, 5);
        localStorage.setItem("ai_search_history", JSON.stringify(newHistory));
        setSearchHistory(newHistory);
      } else {
        toast.error(data.message || "Search failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setQuery("");
    setResult(null);
    setHasSearched(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* ── HERO SECTION ── */}
        <div className="relative w-full bg-[#002B6B] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 scale-105 blur-[1px]"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/95 via-[#002b6b]/70 to-transparent"></div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-6 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Jobs
            </button>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Powered by AI · Semantic Search
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight tracking-tight">
                Find Jobs with{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Natural Language
                </span>
              </h1>
              <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
                Describe what you're looking for in plain English — our AI
                understands context, not just keywords.
              </p>
            </motion.div>

            {/* ── SEARCH BOX ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="flex items-center bg-white rounded-full shadow-2xl shadow-black/20 p-1 border border-white/40">
                <div className="pl-4 pr-2 text-gray-400 shrink-0">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Try: "Night shift cardiology job in Mumbai"'
                  disabled={isSearching}
                  className="flex-1 py-3.5 pr-4 text-gray-800 placeholder-gray-400 outline-none text-sm sm:text-base bg-transparent disabled:opacity-60"
                />
                {query && !isSearching && (
                  <button
                    onClick={handleReset}
                    className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-90 text-white px-5 py-3.5 text-sm font-semibold transition-all rounded-full shrink-0 sm:px-7"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Searching…</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>

              {/* Suggested queries */}
              {!hasSearched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 mt-4 justify-center"
                >
                  {SUGGESTED_QUERIES.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuery(q);
                        handleSearch(q);
                      }}
                      className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-full px-3 py-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Recent searches */}
          {!hasSearched && searchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setQuery(h);
                      handleSearch(h);
                    }}
                    className="flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-full px-3 py-1.5 transition-all shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {h}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── LOADING SKELETON ── */}
          {isSearching && (
            <div className="space-y-4">
              <div className="h-6 w-56 bg-gray-200 rounded-full animate-pulse mb-6" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                      <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                      <div className="h-3.5 bg-gray-100 rounded w-full" />
                      <div className="h-3.5 bg-gray-100 rounded w-4/5" />
                      <div className="flex gap-2 mt-2">
                        <div className="h-6 bg-blue-50 rounded-md w-20" />
                        <div className="h-6 bg-gray-100 rounded-md w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RESULTS ── */}
          {!isSearching && result && (
            <AnimatePresence>
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Result header */}
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {result.totalFound} results for{" "}
                        <span className="text-blue-600">"{result.query}"</span>
                      </span>
                      {result.searchMode === "vector" ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-2 py-0.5">
                          <Sparkles className="w-3 h-3" />
                          Vector Search
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                          Text Search
                        </span>
                      )}
                    </div>

                    {/* AI Summary */}
                    {result.aiSummary && result.aiSummary !== `Found ${result.totalFound} jobs matching your search.` && (
                      <p className="text-sm text-gray-600 flex items-start gap-1.5 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                        {result.aiSummary}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    New Search
                  </button>
                </div>

                {/* Job cards */}
                {result.results.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                      Try rephrasing your query or using different keywords.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTED_QUERIES.slice(0, 3).map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuery(q);
                            handleSearch(q);
                          }}
                          className="text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.results.map((job, idx) => (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.35 }}
                        className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 p-5 sm:p-6 transition-all group"
                      >
                        {/* Card header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            {/* Icon */}
                            <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-100">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Title row */}
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3
                                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/jobseeker/jobs/${job._id}/view`
                                    )
                                  }
                                >
                                  {job.title}
                                </h3>

                                {/* Relevance badge */}
                                {job.relevanceScore != null && (
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreColor(
                                      job.relevanceScore
                                    )}`}
                                  >
                                    {Math.round(job.relevanceScore * 100)}% match
                                  </span>
                                )}

                                {job.status === "Active" && (
                                  <span className="flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full px-2 py-0.5">
                                    <CheckCircle className="w-3 h-3" />
                                    Active
                                  </span>
                                )}
                              </div>

                              {/* Org + type */}
                              <p className="text-sm text-gray-600 mb-3">
                                <span className="font-medium">
                                  {job.organizationName || "Healthcare Facility"}
                                </span>
                                {job.location?.city && (
                                  <>
                                    <span className="text-gray-300 mx-1.5">·</span>
                                    <span className="text-gray-500">
                                      {job.location.city}
                                      {job.location.state
                                        ? `, ${job.location.state}`
                                        : ""}
                                    </span>
                                  </>
                                )}
                              </p>

                              {/* Meta pills */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-3">
                                {job.experienceRequired?.minYears != null && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                    {job.experienceRequired.minYears}–
                                    {job.experienceRequired.maxYears} yrs
                                  </span>
                                )}
                                {job.location?.city && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    {job.isRemote ? "Remote" : job.location.city}
                                  </span>
                                )}
                                {(job.salary?.min || job.salary?.max) && (
                                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                                    <IndianRupee className="w-3.5 h-3.5 text-gray-400 font-normal" />
                                    {formatSalary(job.salary?.min)} –{" "}
                                    {formatSalary(job.salary?.max)}
                                  </span>
                                )}
                              </div>

                              {/* AI Explanation banner */}
                              {job.aiExplanation && (
                                <div className="flex items-start gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl px-3 py-2 mb-3">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                                  <p className="text-xs text-purple-800 leading-relaxed">
                                    <span className="font-semibold">Why it matches:</span>{" "}
                                    {job.aiExplanation}
                                  </p>
                                </div>
                              )}

                              {/* Description */}
                              {job.description && (
                                <div className="flex items-start gap-1.5 mb-3">
                                  <FileText className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {job.description}
                                  </p>
                                </div>
                              )}

                              {/* Tag chips */}
                              <div className="flex flex-wrap items-center gap-2">
                                {job.specialization && (
                                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                                    {job.specialization}
                                  </span>
                                )}
                                {job.jobType && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                    {job.jobType}
                                  </span>
                                )}
                                {job.shift && job.shift !== "Day" && (
                                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md">
                                    {job.shift} Shift
                                  </span>
                                )}
                                {job.isRemote && (
                                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-md">
                                    Remote
                                  </span>
                                )}
                                {job.postedAt && (
                                  <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getTimeAgo(job.postedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bookmark */}
                          <button
                            onClick={() => saveJob(job._id)}
                            className={`shrink-0 p-2 rounded-full transition-all ${
                              savedIds.has(job._id)
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-300 hover:text-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            <Bookmark
                              className={`w-5 h-5 transition ${
                                savedIds.has(job._id)
                                  ? "fill-blue-600 text-blue-600"
                                  : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* View button */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            Rank #{idx + 1} by AI relevance
                          </div>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/jobseeker/jobs/${job._id}/view`
                              )
                            }
                            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 group-hover:gap-2.5 transition-all"
                          >
                            View Job <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── EMPTY STATE (never searched) ── */}
          {!isSearching && !hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              {/* How it works */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  {
                    icon: "🧠",
                    title: "Understands Context",
                    desc: "Describe your ideal job in plain English — shift, location, specialization.",
                  },
                  {
                    icon: "⚡",
                    title: "Vector Similarity",
                    desc: "AI embeds your query and finds jobs semantically, not just by keyword.",
                  },
                  {
                    icon: "💬",
                    title: "AI Explanations",
                    desc: "Each result shows why it matches your specific search intent.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* More suggested queries */}
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Try searching for
              </h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-xl px-4 py-3 transition-all shadow-sm text-left w-full sm:w-auto"
                  >
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
