'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import {
    Sparkles,
    X,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertTriangle,
    Briefcase,
    GraduationCap,
    Code,
    Target,
    Loader2,
    FileText,
} from 'lucide-react';

interface MatchScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobTitle: string;
}

interface MatchResult {
    overallScore: number;
    breakdown: {
        skills: { score: number; matched: string[]; missing: string[] };
        experience: { score: number; assessment: string };
        education: { score: number; assessment: string };
        specialization: { score: number; assessment: string };
    };
    strengths: string[];
    improvements: string[];
    verdictSummary: string;
}

export default function MatchScoreModal({ isOpen, onClose, jobId, jobTitle }: MatchScoreModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loadingResumes, setLoadingResumes] = useState(false);

    // Fetch resumes when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchResumes();
            setMatchResult(null);
            setError('');
        }
    }, [isOpen]);

    const fetchResumes = async () => {
        try {
            setLoadingResumes(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/list`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const resumeList = response.data.data?.resumes || [];
            setResumes(resumeList);
            // Auto-select default resume or first one
            const defaultResume = resumeList.find((r: any) => r.isDefault);
            setSelectedResumeId(defaultResume?._id || resumeList[0]?._id || '');
        } catch {
            setError('Failed to load resumes. Please try again.');
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleCalculateScore = async () => {
        if (!selectedResumeId) {
            setError('Please select a resume first.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/ai/match-score`,
                { resumeId: selectedResumeId, jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMatchResult(response.data.data.matchResult);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to calculate match score. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-amber-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 90) return 'bg-emerald-50 border-emerald-200';
        if (score >= 75) return 'bg-blue-50 border-blue-200';
        if (score >= 60) return 'bg-amber-50 border-amber-200';
        if (score >= 40) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Exceptional Match';
        if (score >= 75) return 'Strong Match';
        if (score >= 60) return 'Moderate Match';
        if (score >= 40) return 'Weak Match';
        return 'Poor Match';
    };

    const getProgressColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 75) return 'bg-blue-500';
        if (score >= 60) return 'bg-amber-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const categoryIcons: Record<string, React.ReactNode> = {
        skills: <Code className="w-4 h-4" />,
        experience: <Briefcase className="w-4 h-4" />,
        education: <GraduationCap className="w-4 h-4" />,
        specialization: <Target className="w-4 h-4" />,
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

            {/* Modal Panel */}
            <Dialog.Panel className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#002B6B] to-[#004B9B] text-white p-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">AI Match Score</h2>
                                <p className="text-blue-100 text-sm truncate max-w-[300px]">{jobTitle}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Resume Selector */}
                    {!matchResult && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Resume to Compare
                                </label>
                                {loadingResumes ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading resumes...
                                    </div>
                                ) : resumes.length === 0 ? (
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No resumes found. Please create a resume first.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {resumes.map((resume: any) => (
                                            <label
                                                key={resume._id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                                                    selectedResumeId === resume._id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="resume"
                                                    value={resume._id}
                                                    checked={selectedResumeId === resume._id}
                                                    onChange={() => setSelectedResumeId(resume._id)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{resume.title}</p>
                                                    <p className="text-xs text-gray-500">{resume.personalInfo?.fullName}</p>
                                                </div>
                                                {resume.isDefault && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleCalculateScore}
                                disabled={loading || !selectedResumeId || resumes.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing Match...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Calculate Match Score
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {matchResult && (
                        <div className="space-y-5">
                            {/* Overall Score */}
                            <div className={`p-5 rounded-xl border-2 ${getScoreBg(matchResult.overallScore)} text-center`}>
                                <p className="text-sm font-medium text-gray-600 mb-1">Overall Match Score</p>
                                <p className={`text-5xl font-extrabold ${getScoreColor(matchResult.overallScore)}`}>
                                    {matchResult.overallScore}%
                                </p>
                                <p className={`text-sm font-semibold mt-1 ${getScoreColor(matchResult.overallScore)}`}>
                                    {getScoreLabel(matchResult.overallScore)}
                                </p>
                            </div>

                            {/* Verdict */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700 leading-relaxed">{matchResult.verdictSummary}</p>
                            </div>

                            {/* Category Breakdown */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Category Breakdown</h3>
                                <div className="space-y-3">
                                    {(['skills', 'experience', 'education', 'specialization'] as const).map((cat) => {
                                        const data = matchResult.breakdown[cat];
                                        return (
                                            <div key={cat} className="bg-white border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">{categoryIcons[cat]}</span>
                                                        <span className="text-sm font-semibold text-gray-900 capitalize">{cat}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                                                        {data.score}%
                                                    </span>
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(data.score)}`}
                                                        style={{ width: `${data.score}%` }}
                                                    />
                                                </div>
                                                {/* Skills detail */}
                                                {cat === 'skills' && 'matched' in data && (
                                                    <div className="mt-2 space-y-2">
                                                        {data.matched.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1">Matched Skills</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.matched.map((s, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {data.missing.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-500 mb-1">Missing Skills</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.missing.map((s, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                                                                            {s}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Assessment for other categories */}
                                                {cat !== 'skills' && 'assessment' in data && (
                                                    <p className="text-xs text-gray-600 mt-1">{data.assessment}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <h4 className="text-sm font-bold text-emerald-800">Strengths</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {matchResult.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-emerald-800">
                                                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingDown className="w-4 h-4 text-amber-600" />
                                        <h4 className="text-sm font-bold text-amber-800">Improvements</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {matchResult.improvements.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Try Again */}
                            <button
                                onClick={() => setMatchResult(null)}
                                className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Try with a different resume
                            </button>
                        </div>
                    )}
                </div>
            </Dialog.Panel>
        </Dialog>
    );
}
