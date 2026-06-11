export const doctors = [
    { id: "d1", name: "Dr. Amit Gupta", specialty: "Medical Oncology", experience: "18 years", image: "PS", rating: 4.9, patients: 1200, languages: ["English", "Hindi", "Marathi"], available: true },
    { id: "d2", name: "Dr. Arjun Mehta", specialty: "Surgical Oncology", experience: "22 years", image: "AM", rating: 4.8, patients: 980, languages: ["English", "Hindi", "Gujarati"], available: true },
    { id: "d3", name: "Dr. Sunita Rao", specialty: "Radiation Oncology", experience: "15 years", image: "SR", rating: 4.9, patients: 850, languages: ["English", "Hindi", "Telugu", "Kannada"], available: false },
    { id: "d4", name: "Dr. Rajan Nair", specialty: "Hematology-Oncology", experience: "12 years", image: "RN", rating: 4.7, patients: 670, languages: ["English", "Hindi", "Malayalam"], available: true },
];

export const packages = [
    {
        id: "p1", name: "Diagnostic Starter", price: 2999, currency: "₹", period: "one-time",
        tag: "Most Popular",
        features: ["Initial consultation", "Basic blood panel", "Doctor assignment", "Health history intake", "Secure patient portal access", "2 follow-up chats"],
        color: "teal",
    },
    {
        id: "p2", name: "Care Plus", price: 8999, currency: "₹", period: "month",
        tag: "Recommended",
        features: ["Everything in Starter", "Unlimited doctor chats", "Monthly oncologist review", "Symptom tracking dashboard", "Personalized treatment timeline", "Family member access (1)", "Priority appointment slots"],
        color: "teal-dark",
    },
    {
        id: "p3", name: "Comprehensive Heal", price: 24999, currency: "₹", period: "quarter",
        tag: "Full Care",
        features: ["Everything in Care Plus", "3 in-person consultations", "Full diagnostic imaging review", "Chemotherapy planning support", "Nutrition & wellness program", "24/7 nurse helpline", "3 family member access", "Home care coordination"],
        color: "gold",
    },
    {
        id: "p4", name: "Platinum Continuum", price: 74999, currency: "₹", period: "year",
        tag: "Enterprise",
        features: ["Everything in Comprehensive", "Dedicated case manager", "International second opinion", "Annual full-body cancer screening", "Genetic counselling session", "Unlimited family access", "Concierge home visits", "Travel & logistics support"],
        color: "slate",
    },
];

export const testimonials = [
    {
        id: "t1", name: "Meera Joshi", age: 52, cancer: "Breast Cancer Survivor", location: "Pune",
        text: "Apex Onco Care gave me hope when I needed it most. Dr. Sharma's guidance through my chemotherapy was extraordinary. The app kept my family updated at every step.",
        rating: 5, year: "2023", avatar: "MJ",
    },
    {
        id: "t2", name: "Rajesh Patel", age: 61, cancer: "Lung Cancer — Remission", location: "Ahmedabad",
        text: "Being able to chat directly with my oncologist between appointments changed everything. I never felt alone in this journey. The treatment timeline feature helped me understand exactly what was happening.",
        rating: 5, year: "2023", avatar: "RP",
    },
    {
        id: "t3", name: "Anita Krishnan", age: 47, cancer: "Lymphoma Survivor", location: "Chennai",
        text: "The multilingual support in Tamil was a game-changer for my mother who doesn't speak English. The doctors were patient and thorough. I recommend Apex to every family dealing with cancer.",
        rating: 5, year: "2024", avatar: "AK",
    },
    {
        id: "t4", name: "Suresh Nambiar", age: 58, cancer: "Prostate Cancer — Treated", location: "Kochi",
        text: "From registration to my final consultation, the experience was seamless. The science of healing approach combining chemo with holistic care made a real difference in my recovery.",
        rating: 5, year: "2024", avatar: "SN",
    },
];

export const chatMessages = [
    { id: 1, sender: "doctor", name: "Dr. Priya Sharma", message: "Good morning! I've reviewed your latest blood reports. Your CBC values are showing improvement from last week.", time: "09:14 AM", type: "text" },
    { id: 2, sender: "patient", name: "You", message: "That's a relief, Doctor. I was worried about the fatigue I've been experiencing.", time: "09:16 AM", type: "text" },
    { id: 3, sender: "doctor", name: "Dr. Priya Sharma", message: "The fatigue is expected at this stage of your treatment cycle. I'm attaching your updated treatment timeline.", time: "09:17 AM", type: "text" },
    { id: 4, sender: "doctor", name: "Dr. Priya Sharma", message: "Treatment Timeline — Cycle 3", time: "09:17 AM", type: "file", fileType: "PDF", fileName: "cycle3_timeline.pdf" },
    { id: 5, sender: "patient", name: "You", message: "Thank you. Should I come in for my next infusion on the 22nd as scheduled?", time: "09:20 AM", type: "text" },
    { id: 6, sender: "doctor", name: "Dr. Priya Sharma", message: "Yes, the 22nd at 10:00 AM works. I've already blocked the slot. Please ensure you're well hydrated the evening before.", time: "09:22 AM", type: "text" },
    { id: 7, sender: "system", name: "System", message: "Appointment confirmed: 22nd May, 10:00 AM — Infusion Centre, Floor 2", time: "09:22 AM", type: "appointment" },
];

export const appointments = [
    { id: "a1", patient: "Meera Joshi", doctor: "Dr. Priya Sharma", date: "2024-05-22", time: "10:00 AM", type: "Infusion — Cycle 3", status: "confirmed" },
    { id: "a2", patient: "Rajesh Patel", doctor: "Dr. Arjun Mehta", date: "2024-05-23", time: "2:30 PM", type: "Post-Surgery Review", status: "pending" },
    { id: "a3", patient: "Anita Krishnan", doctor: "Dr. Sunita Rao", date: "2024-05-25", time: "11:00 AM", type: "Radiation Planning", status: "confirmed" },
    { id: "a4", patient: "Suresh Nambiar", doctor: "Dr. Rajan Nair", date: "2024-05-28", time: "9:00 AM", type: "Initial Consultation", status: "pending" },
];

export const events = [
    { id: "e1", title: "Understanding Chemotherapy", type: "Seminar", date: "June 8, 2024", time: "11:00 AM – 1:00 PM", speaker: "Dr. Priya Sharma", seats: 30, registered: 22, mode: "In-Person + Online", location: "Apex Onco Care, Mumbai" },
    { id: "e2", title: "Nutrition During Cancer Treatment", type: "Workshop", date: "June 15, 2024", time: "10:00 AM – 12:00 PM", speaker: "Ms. Deepa Nair, Dietitian", seats: 20, registered: 18, mode: "Online", location: "Zoom Webinar" },
    { id: "e3", title: "Healing Beyond Medicine", type: "Seminar", date: "June 22, 2024", time: "3:00 PM – 5:00 PM", speaker: "Dr. Arjun Mehta + Dr. Sunita Rao", seats: 50, registered: 34, mode: "In-Person", location: "Apex Onco Care Auditorium" },
    { id: "e4", title: "Family Support Circle", type: "Support Group", date: "Every Saturday", time: "4:00 PM – 5:30 PM", speaker: "Counsellor Rekha Iyer", seats: 15, registered: 11, mode: "In-Person + Online", location: "Apex Onco Care / Google Meet" },
];

export const services = [
    { icon: "🧬", title: "Medical Oncology", desc: "Comprehensive cancer diagnosis, staging, and systemic therapy planning with leading oncologists." },
    { icon: "🔬", title: "Radiation Therapy", desc: "Precision radiation with IMRT, IGRT, and stereotactic body radiation therapy (SBRT)." },
    { icon: "⚕️", title: "Surgical Oncology", desc: "Minimally invasive and reconstructive cancer surgery by experienced surgical oncologists." },
    { icon: "💉", title: "Chemotherapy", desc: "State-of-the-art infusion centre with personalised chemotherapy and immunotherapy regimens." },
    { icon: "🌿", title: "Integrative Healing", desc: "Science-backed holistic care combining chemo with yoga, nutrition, mindfulness, and acupuncture." },
    { icon: "🧠", title: "Psycho-Oncology", desc: "Mental health support for patients and families navigating the emotional journey of cancer." },
    { icon: "🩸", title: "Haematology", desc: "Expert diagnosis and treatment of blood cancers — leukaemia, lymphoma, and myeloma." },
    { icon: "📋", title: "Second Opinions", desc: "International-standard second opinion service with detailed case review within 72 hours." },
];

export const diseaseInfo = [
    { id: "di1", name: "Breast Cancer", stage: "Stage II", description: "Hormone receptor-positive invasive ductal carcinoma. Responds well to combined hormone therapy and chemotherapy.", treatmentPhases: ["Surgery (Lumpectomy)", "Chemotherapy — 6 cycles", "Radiation Therapy", "Hormone Therapy — 5 years"], prognosis: "Good", nextStep: "Cycle 3 Chemotherapy" },
];

export const patientProfile = {
    name: "Meera Joshi",
    age: 52,
    id: "AOC-2024-00128",
    doctor: "Dr. Priya Sharma",
    package: "Care Plus",
    status: "Active Treatment",
    disease: "Breast Cancer — Stage II",
    since: "February 2024",
    nextAppointment: "May 22, 2024 — 10:00 AM",
    symptoms: [
        { date: "May 14", symptom: "Mild nausea", severity: "Low" },
        { date: "May 12", symptom: "Fatigue", severity: "Moderate" },
        { date: "May 10", symptom: "Hair thinning", severity: "Low" },
    ],
    vitals: { bp: "118/76", weight: "62 kg", temp: "98.4°F", lastUpdated: "May 15, 2024" },
};

export const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "mr", label: "मराठी" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "ml", label: "മലയാളം" },
    { code: "kn", label: "ಕನ್ನಡ" },
];