import { useState, useEffect } from 'react';
import type { User, LifeReview } from '../../types';
import { Target, Play, Calendar, History, ArrowRight } from 'lucide-react';
import { LifeReviewForm } from './LifeReviewForm';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function LifeReviewDashboard({ user }: { user: User }) {
    const [reviews, setReviews] = useState<LifeReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeForm, setActiveForm] = useState<{type: 'quarterly'|'annual', year: number, cycle: number} | null>(null);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_URL}/life-reviews/user/${user.id}`, { credentials: 'include',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching life reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) void fetchReviews();
    }, [user?.id]);

    const handleCloseForm = () => {
        setActiveForm(null);
        fetchReviews(); // Refresh after form closes
    };

    if (isLoading) {
        return <div className="text-center py-20 text-gray-500">Loading reviews...</div>;
    }

    if (activeForm) {
        return <LifeReviewForm user={user} type={activeForm.type} year={activeForm.year} cycle={activeForm.cycle} onClose={handleCloseForm} />;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    // Find the latest completed quarterly and annual review
    const latestQuarterly = reviews.find(r => r.type === 'quarterly' && r.status === 'completed');
    const latestAnnual = reviews.find(r => r.type === 'annual' && r.status === 'completed');

    // Check if there is an ongoing draft for the current cycle
    const currentQuarterlyDraft = reviews.find(r => r.type === 'quarterly' && r.year === currentYear && r.cycle === currentQuarter && r.status === 'draft');
    const currentAnnualDraft = reviews.find(r => r.type === 'annual' && r.year === currentYear && r.cycle === 1 && r.status === 'draft');

    const canStartQuarterly = !reviews.some(r => r.type === 'quarterly' && r.year === currentYear && r.cycle === currentQuarter && r.status === 'completed');
    const canStartAnnual = !reviews.some(r => r.type === 'annual' && r.year === currentYear && r.status === 'completed');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QUARTERLY REVIEW CARD */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-[#222]">
                        <Target className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Quarterly Review</h3>
                    <p className="text-sm text-gray-500 mb-6 relative z-10">Evaluate your life areas and set your main priority for the next 3 months.</p>
                    
                    <div className="relative z-10 flex flex-col gap-3">
                        {currentQuarterlyDraft ? (
                            <button onClick={() => setActiveForm({type: 'quarterly', year: currentYear, cycle: currentQuarter})} className="flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 px-4 py-2.5 rounded-lg font-bold hover:bg-yellow-600/30 transition-colors w-full">
                                <Play className="w-4 h-4" /> Resume Q{currentQuarter} {currentYear} Draft
                            </button>
                        ) : canStartQuarterly ? (
                            <button onClick={() => setActiveForm({type: 'quarterly', year: currentYear, cycle: currentQuarter})} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors w-full">
                                <Play className="w-4 h-4" /> Start Q{currentQuarter} {currentYear} Review
                            </button>
                        ) : (
                            <div className="text-center p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                Q{currentQuarter} Review Completed
                            </div>
                        )}
                        
                        {latestQuarterly && (
                            <div className="mt-4 p-4 bg-[#222] border border-[#333] rounded-lg">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Previous Priority (Q{latestQuarterly.cycle} {latestQuarterly.year})</div>
                                <div className="text-sm text-gray-300 font-medium">{latestQuarterly.mainPriority || 'None set'}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ANNUAL REVIEW CARD */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-[#222]">
                        <Calendar className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Annual Review</h3>
                    <p className="text-sm text-gray-500 mb-6 relative z-10">Deep reflection on your entire year to set the course for the next one.</p>
                    
                    <div className="relative z-10 flex flex-col gap-3">
                        {currentAnnualDraft ? (
                            <button onClick={() => setActiveForm({type: 'annual', year: currentYear, cycle: 1})} className="flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 px-4 py-2.5 rounded-lg font-bold hover:bg-yellow-600/30 transition-colors w-full">
                                <Play className="w-4 h-4" /> Resume {currentYear} Draft
                            </button>
                        ) : canStartAnnual ? (
                            <button onClick={() => setActiveForm({type: 'annual', year: currentYear, cycle: 1})} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full">
                                <Play className="w-4 h-4" /> Start {currentYear} Review
                            </button>
                        ) : (
                            <div className="text-center p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                {currentYear} Review Completed
                            </div>
                        )}
                        
                        {latestAnnual && (
                            <div className="mt-4 p-4 bg-[#222] border border-[#333] rounded-lg">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Previous Priority ({latestAnnual.year})</div>
                                <div className="text-sm text-gray-300 font-medium">{latestAnnual.mainPriority || 'None set'}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RECENT REVIEWS HISTORY PREVIEW */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" /> Historical Reviews
                    </h3>
                </div>
                
                <div className="space-y-4">
                    {reviews.filter(r => r.status === 'completed').length === 0 ? (
                        <div className="text-center py-8 text-gray-500 italic text-sm">No completed reviews yet.</div>
                    ) : (
                        reviews.filter(r => r.status === 'completed').map(r => (
                            <div key={r.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#222] border border-[#2a2a2a] rounded-lg gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${r.type === 'annual' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {r.type === 'annual' ? r.year : `Q${r.cycle} ${r.year}`}
                                        </span>
                                        <span className="text-xs text-gray-500">{format(new Date(r.completedAt!), 'MMM d, yyyy')}</span>
                                    </div>
                                    <h4 className="text-gray-200 font-medium text-sm">Priority: {r.mainPriority || 'None'}</h4>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4">
                                        <div className="text-xs text-gray-500">Overall</div>
                                        <div className="font-bold text-yellow-500">{r.overallSatisfaction ? `${r.overallSatisfaction}/10` : '-'}</div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white p-2 bg-[#333] hover:bg-[#444] rounded-lg transition-colors" title="View Details">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}