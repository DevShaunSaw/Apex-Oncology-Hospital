"use client";
import { useApp } from "../context/AppContext";
import { packages } from "../data/mockData";
import { Check, Zap } from "lucide-react";

const colorMap: Record<string, string> = {
    teal: "from-teal-600 to-teal-500",
    "teal-dark": "from-teal-800 to-teal-600",
    gold: "from-amber-500 to-amber-400",
    slate: "from-slate-700 to-slate-600",
};

const bgMap: Record<string, string> = {
    teal: "bg-teal-50 border-teal-200",
    "teal-dark": "bg-teal-50 border-teal-300",
    gold: "bg-amber-50 border-amber-200",
    slate: "bg-slate-50 border-slate-200",
};

const tagColorMap: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700",
    "teal-dark": "bg-teal-200 text-teal-800",
    gold: "bg-amber-100 text-amber-700",
    slate: "bg-slate-200 text-slate-700",
};

export default function PackagesPage() {
    const { setPage } = useApp();
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-16 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl font-display mb-3">Care Packages</h1>
                <p className="text-teal-200 max-w-xl mx-auto">Transparent pricing. Comprehensive coverage. Choose the plan that matches your care needs.</p>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {/* Doctor Suggests callout */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-10 flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0 text-white">
                        <Zap size={18} />
                    </div>
                    <div>
                        <div className="font-semibold text-teal-800">Doctor Recommendation</div>
                        <p className="text-teal-600 text-sm mt-0.5">Based on your diagnosis (Breast Cancer — Stage II), <strong>Dr. Priya Sharma</strong> recommends the <strong>Care Plus</strong> or <strong>Comprehensive Heal</strong> package for full treatment coverage.</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg.id} className={`relative rounded-2xl border-2 bg-white overflow-hidden flex flex-col transition-all hover:shadow-card-hover ${pkg.color === "teal-dark" ? "border-teal-500 shadow-teal-glow scale-[1.02]" : "border-slate-200"}`}>
                            {/* Header */}
                            <div className={`bg-gradient-to-br ${colorMap[pkg.color]} text-white p-6`}>
                                {pkg.tag && (
                                    <div className="inline-flex items-center bg-white/20 rounded-full px-3 py-0.5 text-xs font-semibold mb-3">
                                        {pkg.tag}
                                    </div>
                                )}
                                <h3 className="text-xl font-display font-semibold mb-1">{pkg.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{pkg.currency}{pkg.price.toLocaleString("en-IN")}</span>
                                    <span className="text-sm opacity-80">/ {pkg.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-5 flex-1">
                                <ul className="space-y-2.5">
                                    {pkg.features.map(f => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                                            <Check size={15} className="text-teal-500 shrink-0 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="p-5 pt-0">
                                <button onClick={() => setPage("register")}
                                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${pkg.color === "teal-dark" ? "bg-teal-600 text-white hover:bg-teal-700" : "border border-teal-300 text-teal-700 hover:bg-teal-50"}`}>
                                    Choose {pkg.name.split(" ")[0]}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compare note */}
                <div className="text-center mt-10">
                    <p className="text-slate-500 text-sm">All packages include a secure patient portal, encrypted medical records, and HIPAA-compliant data storage.</p>
                    <button onClick={() => setPage("chat")} className="mt-4 text-teal-600 font-medium text-sm hover:underline">Have questions? Chat with a doctor →</button>
                </div>
            </div>
        </div>
    );
}