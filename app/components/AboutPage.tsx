"use client";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { testimonials } from "../data/mockData";
import { MessageCircle, Star, Play, X } from "lucide-react";

export default function AboutPage() {
    const { setPage } = useApp();
    const [activeTestimonial, setActiveTestimonial] = useState<number | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMsg, setChatMsg] = useState("");
    const [chatHistory, setChatHistory] = useState<{ sender: string; msg: string }[]>([
        { sender: "patient", msg: "Hello! I'm Meera. Ask me anything about my experience at Apex Onco Care." }
    ]);

    const sendMsg = () => {
        if (!chatMsg.trim()) return;
        const newHistory = [...chatHistory, { sender: "visitor", msg: chatMsg }];
        setChatHistory(newHistory);
        setChatMsg("");
        setTimeout(() => {
            const replies = [
                "My experience was truly life-changing. Dr. Sharma made sure I understood every step of my treatment.",
                "The chat feature was amazing — I could reach my doctor even at 11pm when I was anxious about side effects.",
                "Honestly, Apex Onco Care gave my family peace of mind when we needed it most.",
                "The integrative healing programme helped me manage chemo side effects naturally. I'd recommend it to everyone.",
            ];
            setChatHistory(prev => [...prev, { sender: "patient", msg: replies[Math.floor(Math.random() * replies.length)] }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-20 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-display mb-4">Our Story &amp; Mission</h1>
                <p className="text-teal-200 max-w-2xl mx-auto text-lg leading-relaxed">
                    Founded by oncologists who believed cancer care deserved more humanity, Apex Onco Care combines world-class science with compassionate, personalised support.
                </p>
            </div>

            {/* Mission */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: "Our Mission", icon: "🎯", text: "Make expert oncology care accessible, transparent, and human — for every patient, regardless of background." },
                        { title: "Our Vision", icon: "🔭", text: "A world where no cancer patient feels alone in their journey — always connected to expertise, support, and hope." },
                        { title: "Our Values", icon: "💎", text: "Scientific rigor. Compassionate care. Radical transparency. Family inclusion. Holistic healing." },
                    ].map(({ title, icon, text }) => (
                        <div key={title} className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                            <div className="text-3xl mb-3">{icon}</div>
                            <h3 className="font-semibold text-teal-800 mb-2">{title}</h3>
                            <p className="text-sm text-teal-700 leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl font-display text-center text-teal-900 mb-10">Leadership Team</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { name: "Dr. Vikram Desai", role: "Founder & Chief Oncologist", years: "25 years", avatar: "VD" },
                            { name: "Dr. Priya Sharma", role: "Head — Medical Oncology", years: "18 years", avatar: "PS" },
                            { name: "Dr. Arjun Mehta", role: "Head — Surgical Oncology", years: "22 years", avatar: "AM" },
                            { name: "Ms. Nandita Roy", role: "Patient Experience Director", years: "12 years", avatar: "NR" },
                            { name: "Dr. Sunita Rao", role: "Head — Radiation Oncology", years: "15 years", avatar: "SR" },
                            { name: "Dr. Rajan Nair", role: "Head — Haematology", years: "12 years", avatar: "RN" },
                        ].map(m => (
                            <div key={m.name} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">{m.avatar}</div>
                                <div>
                                    <div className="font-semibold text-slate-800">{m.name}</div>
                                    <div className="text-xs text-teal-600">{m.role}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{m.years} experience</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Patient Testimonials with Chat */}
            <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-display text-teal-900 mb-3">Patient Stories</h2>
                    <p className="text-slate-500">Hear directly from patients who've walked this journey. <button onClick={() => setChatOpen(true)} className="text-teal-600 font-medium underline">Chat with a past patient →</button></p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {testimonials.map((t, i) => (
                        <div key={t.id} className="bg-white rounded-2xl shadow-card border border-slate-100 hover:shadow-card-hover transition-all p-5 flex flex-col">
                            <div className="flex text-amber-400 text-sm mb-3">{"★".repeat(t.rating)}</div>
                            <p className="text-slate-600 text-sm leading-relaxed italic flex-1 mb-4">"{t.text.slice(0, 150)}…"</p>
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{t.avatar}</div>
                                <div>
                                    <div className="font-semibold text-sm text-slate-800">{t.name}, {t.age}</div>
                                    <div className="text-xs text-teal-600">{t.cancer}</div>
                                    <div className="text-xs text-slate-400">{t.location} · {t.year}</div>
                                </div>
                            </div>
                            <button onClick={() => setActiveTestimonial(i)} className="mt-3 flex items-center gap-1 text-xs text-teal-600 hover:underline">
                                <Play size={11} /> Read Full Story
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Full Testimonial Modal */}
            {activeTestimonial !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveTestimonial(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setActiveTestimonial(null)} className="float-right text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl">{testimonials[activeTestimonial].avatar}</div>
                            <div>
                                <div className="font-semibold text-slate-800">{testimonials[activeTestimonial].name}</div>
                                <div className="text-teal-600 text-sm">{testimonials[activeTestimonial].cancer}</div>
                                <div className="text-xs text-slate-400">{testimonials[activeTestimonial].location}</div>
                            </div>
                        </div>
                        <div className="flex text-amber-400 mb-4">{"★".repeat(testimonials[activeTestimonial].rating)}</div>
                        <p className="text-slate-600 leading-relaxed italic">"{testimonials[activeTestimonial].text}"</p>
                        <button onClick={() => { setActiveTestimonial(null); setChatOpen(true); }} className="mt-6 w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors">
                            Chat with a Patient →
                        </button>
                    </div>
                </div>
            )}

            {/* Patient Chat Widget */}
            {chatOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-teal-100 flex flex-col overflow-hidden" style={{ maxHeight: "420px" }}>
                    <div className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">MJ</div>
                            <div>
                                <div className="text-sm font-semibold">Meera Joshi</div>
                                <div className="text-xs text-teal-300">Breast Cancer Survivor</div>
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="text-teal-300 hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                        {chatHistory.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.sender === "visitor" ? "bg-teal-600 text-white" : "bg-white border border-slate-100 text-slate-700"}`}>
                                    {m.msg}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 flex gap-2 bg-white border-t border-slate-100">
                        <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
                            placeholder="Ask Meera anything..." className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                        <button onClick={sendMsg} className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors">
                            <MessageCircle size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating chat trigger */}
            {!chatOpen && (
                <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm font-medium">
                    <MessageCircle size={18} /> Chat with a Patient
                </button>
            )}
        </div>
    );
}