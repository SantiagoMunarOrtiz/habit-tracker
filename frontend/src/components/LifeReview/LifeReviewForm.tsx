import { useState, useEffect } from 'react';
import type { User, LifeReview, LifeReviewArea } from '../../types';
import { Save, ArrowLeft, ArrowRight, CheckCircle, ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LIFE_AREAS = [
    "Physical health",
    "Emotional well-being",
    "Relationships and family",
    "Career and professional development",
    "Entrepreneurship",
    "Finances",
    "Learning and personal growth",
    "Rest and recreation",
    "Purpose and contribution",
    "Home and personal environment"
];

export function LifeReviewForm({ user, type, year, cycle, onClose }: { user: User, type: 'quarterly'|'annual', year: number, cycle: number, onClose: () => void }) {
    const [review, setReview] = useState<Partial<LifeReview>>({
        type, year, cycle, status: 'draft', areas: []
    });
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const res = await fetch(`${API_URL}/life-reviews/user/${user.id}/cycle?type=${type}&year=${year}&cycle=${cycle}`, { credentials: 'include',
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setReview(data);
                }
            } catch (error) {
                console.error("Error fetching draft", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDraft();
    }, [user.id, type, year, cycle]);

    const handleSave = async (complete: boolean = false) => {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...review,
                userId: user.id,
                status: complete ? 'completed' : 'draft',
            };

            const res = await fetch(`${API_URL}/life-reviews`, { credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify(dataToSave)
            });

            if (res.ok) {
                const saved = await res.json();
                setReview(saved);
                if (complete) onClose();
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error('Error saving review:', error);
            alert("Failed to save review. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleArea = (areaName: string) => {
        const areas = review.areas || [];
        const exists = areas.find(a => a.areaName === areaName);
        if (exists) {
            setReview({ ...review, areas: areas.filter(a => a.areaName !== areaName) });
        } else {
            setReview({ ...review, areas: [...areas, { areaName, responses: {} } as LifeReviewArea] });
        }
    };

    if (isLoading) return <div className="text-center py-20 text-gray-500">Loading draft...</div>;

    const renderAreaSelection = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-2">Step 1: Select Life Areas</h3>
            <p className="text-gray-500 text-sm">Select the areas of your life you want to evaluate this {type === 'quarterly' ? 'quarter' : 'year'}. Feel free to skip areas that are not relevant right now.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LIFE_AREAS.map(area => {
                    const isSelected = review.areas?.some(a => a.areaName === area);
                    return (
                        <button 
                            key={area}
                            onClick={() => toggleArea(area)}
                            className={`p-4 rounded-xl border text-left transition-colors flex items-center justify-between
                                ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500'}`}
                        >
                            <span className="font-medium">{area}</span>
                            {isSelected && <CheckCircle className="w-5 h-5" />}
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-end pt-6">
                <button 
                    onClick={() => { handleSave(false); setStep(2); }} 
                    disabled={!review.areas || review.areas.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    Next <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderAreaEvaluation = () => {
        const areaToEvaluate = review.areas?.[step - 2];
        if (!areaToEvaluate) return null;

        const updateAreaResponses = (key: string, value: string) => {
            const updatedAreas = [...(review.areas || [])];
            updatedAreas[step - 2] = {
                ...areaToEvaluate,
                responses: { ...(areaToEvaluate.responses  || {}), [key]: value }
            };
            setReview({ ...review, areas: updatedAreas });
        };

        const updateAreaRating = (rating: number) => {
            const updatedAreas = [...(review.areas || [])];
            updatedAreas[step - 2] = { ...areaToEvaluate, rating };
            setReview({ ...review, areas: updatedAreas });
        };

        const questions = type === 'quarterly' ? [
            { key: 'q1', label: 'What makes me feel this way?' },
            { key: 'q2', label: 'What is currently working well?' },
            { key: 'q3', label: 'What needs more attention?' },
            { key: 'q4', label: 'What is one realistic action I can take during the next three months?' },
        ] : [
            { key: 'q1', label: 'How did this area change during the year?' },
            { key: 'q2', label: 'What were my most meaningful achievements?' },
            { key: 'q3', label: 'What difficulties affected this area?' },
            { key: 'q4', label: 'What did I learn about myself?' },
            { key: 'q5', label: 'What should I improve next year?' },
        ];

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-400 mb-6 border-b border-[#333] pb-4">Evaluating: {areaToEvaluate.areaName}</h3>
                
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-300">How satisfied do I feel with this area from 1 to 10?</label>
                    <div className="flex gap-2 flex-wrap">
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <button
                                key={num}
                                onClick={() => updateAreaRating(num)}
                                className={`w-10 h-10 rounded-lg border font-bold transition-colors ${areaToEvaluate.rating === num ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#222] border-[#444] text-gray-400 hover:border-indigo-500'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    {questions.map(q => (
                        <div key={q.key}>
                            <label className="block text-sm font-bold text-gray-400 mb-2">{q.label}</label>
                            <textarea
                                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 resize-none min-h-[100px] text-sm"
                                value={(areaToEvaluate.responses )?.[q.key] || ''}
                                onChange={e => updateAreaResponses(q.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-6 border-t border-[#333]">
                    <button onClick={() => { handleSave(false); setStep(step - 1); }} className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    <button onClick={() => { handleSave(false); setStep(step + 1); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                        {step - 1 === review.areas?.length ? 'Go to Final Summary' : 'Next Area'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderFinalReflection = () => {
        const updateGeneralResponses = (key: string, value: string) => {
            setReview({
                ...review,
                responses: { ...(review.responses  || {}), [key]: value }
            });
        };

        const questions = type === 'quarterly' ? [
            { key: 'q1', label: 'Which life area needs the most attention?' },
            { key: 'q2', label: 'Which life area improved the most?' },
            { key: 'q3', label: 'What affected my well-being the most during this period?' },
            { key: 'q4', label: 'What should I continue doing?' },
            { key: 'q5', label: 'What should I stop, reduce, or change?' },
        ] : [
            { key: 'q1', label: 'How do I feel about my life overall?' },
            { key: 'q2', label: 'Which experiences were the most meaningful?' },
            { key: 'q3', label: 'Which life area improved the most?' },
            { key: 'q4', label: 'Which life area was most neglected?' },
            { key: 'q5', label: 'Did my actions reflect my priorities and values?' },
            { key: 'q6', label: 'What gave me the most energy?' },
            { key: 'q7', label: 'What consistently drained my energy?' },
            { key: 'q8', label: 'What should I continue doing?' },
            { key: 'q9', label: 'What should I stop or reduce?' },
            { key: 'q10', label: 'What should I start doing?' },
            { key: 'q11', label: 'Which relationships need more attention?' },
        ];

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-2">Final Reflection</h3>
                <p className="text-gray-500 text-sm mb-6 border-b border-[#333] pb-4">Looking at all the areas you just evaluated, reflect on the big picture.</p>

                {type === 'annual' && (
                    <div className="space-y-4 mb-6">
                        <label className="block text-sm font-bold text-gray-300">Overall Life Satisfaction (1-10)</label>
                        <div className="flex gap-2 flex-wrap">
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setReview({...review, overallSatisfaction: num})}
                                    className={`w-10 h-10 rounded-lg border font-bold transition-colors ${review.overallSatisfaction === num ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#222] border-[#444] text-gray-400 hover:border-indigo-500'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {questions.map(q => (
                        <div key={q.key}>
                            <label className="block text-sm font-bold text-gray-400 mb-2">{q.label}</label>
                            <textarea
                                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 resize-none min-h-[100px] text-sm"
                                value={(review.responses )?.[q.key] || ''}
                                onChange={e => updateGeneralResponses(q.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-[#333]">
                    <h4 className="text-lg font-bold text-indigo-400 mb-4">Concrete Actions</h4>
                    
                    <div className="space-y-4">
                        {type === 'annual' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">What kind of person do I want to become next year?</label>
                                <input type="text" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500" value={(review.threeChanges )?.identity || ''} onChange={e => setReview({...review, threeChanges: {...(review.threeChanges ), identity: e.target.value}})} />
                            </div>
                        )}
                        {type === 'annual' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Which three changes would have the greatest positive impact on my life?</label>
                                <div className="space-y-2">
                                    <input type="text" placeholder="Change 1" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 text-sm" value={(review.threeChanges )?.change1 || ''} onChange={e => setReview({...review, threeChanges: {...(review.threeChanges ), change1: e.target.value}})} />
                                    <input type="text" placeholder="Change 2" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 text-sm" value={(review.threeChanges )?.change2 || ''} onChange={e => setReview({...review, threeChanges: {...(review.threeChanges ), change2: e.target.value}})} />
                                    <input type="text" placeholder="Change 3" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 text-sm" value={(review.threeChanges )?.change3 || ''} onChange={e => setReview({...review, threeChanges: {...(review.threeChanges ), change3: e.target.value}})} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">What is my main priority for the next {type === 'quarterly' ? 'three months' : 'year'}?</label>
                            <input type="text" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 font-bold" value={review.mainPriority || ''} onChange={e => setReview({...review, mainPriority: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">What is the first concrete action I will take?</label>
                            <input type="text" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500" value={review.nextAction || ''} onChange={e => setReview({...review, nextAction: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Target Date for First Action</label>
                                <input type="date" className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500" value={review.actionTargetDate || ''} onChange={e => setReview({...review, actionTargetDate: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Additional Notes (Optional)</label>
                            <textarea className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-white outline-none focus:border-indigo-500 resize-none min-h-[80px]" value={review.notes || ''} onChange={e => setReview({...review, notes: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-[#333]">
                    <button onClick={() => { handleSave(false); setStep(step - 1); }} className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                    <button onClick={() => {
                        if (confirm('Are you sure you are ready to complete this review? It cannot be changed after completion.')) {
                            handleSave(true);
                        }
                    }} className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                        <Save className="w-5 h-5" /> Complete Review
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 shadow-xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{type === 'annual' ? `${year} Annual Review` : `Q${cycle} ${year} Review`}</h2>
                        <span className="text-sm font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 mt-2 inline-block">Draft - Autosaved</span>
                    </div>
                    {isSaving && <span className="text-xs text-gray-500 animate-pulse">Saving...</span>}
                </div>

                {step === 1 && renderAreaSelection()}
                {step > 1 && step <= (review.areas?.length || 0) + 1 && renderAreaEvaluation()}
                {step === (review.areas?.length || 0) + 2 && renderFinalReflection()}
            </div>
        </div>
    );
}