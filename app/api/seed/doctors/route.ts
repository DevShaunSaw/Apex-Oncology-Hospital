import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const hospitalSpecialists = [
    // 1. Head, Department of Oncology
    {
        name: "Dr. Amit M. Gupta",
        department: "Department of Oncology",
        position: "Head, Department of Oncology & Senior Surgical Oncologist",
        degree: "Mch. Surgical Oncology, Tata Memorial Hospital",
        yoe: "22 Years",
        experience: "HPB - GI & Thoracic oncology, Breast & Gynaec Oncology, Uro-Oncology, Head and Neck Oncology (Maharashtra Ratna Awardee 2022) · 9 AM–12 PM & 6–9 PM Daily",
        email: "amitgupta@gmail.com",
        rating: 4.9,
    },
    // 2. Head, Department of Histopathology & Pathology
    {
        name: "Dr. Pranjali A. Gupta",
        department: "Department of Histopathology & Pathology",
        position: "Head, Department of Histopathology & Pathology",
        degree: "MD Pathology, Tata Memorial Hospital",
        yoe: "20 Years",
        experience: "Histopathology & Pathology Best Doctors Mumbai 2026 (Outlook) · 5–7 PM Monday to Saturday",
        email: "pranjali@email.com",
        rating: 4.9,
    },

    // 3-9. Department of Surgical, Medical & Hemat Oncology
    {
        name: "Dr. Amit Gupta",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Senior Consultant - Surgical Oncology",
        degree: "MS, Mch Surgical Oncology",
        yoe: "16 Years",
        experience: "Advanced Cancer Surgery, Thoracic & Minimally Invasive HPB Oncology",
        email: "amit.surgical@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Vikas Gupta",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Consultant - Surgical Oncology",
        degree: "MS, DNB Surgical Oncology",
        yoe: "14 Years",
        experience: "Minimally Invasive & Laparoscopic Surgical Oncology Procedures",
        email: "vikas.gupta@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Nita Nair",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Lead Consultant - Breast & Gynaecologic Oncology",
        degree: "Mch Surgical Oncology",
        yoe: "16 Years",
        experience: "Comprehensive Breast Oncoplastic Surgery & Gynaecologic Oncology",
        email: "nita.nair@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Deep Vora",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Consultant - Medical Oncology",
        degree: "DM Medical Oncology",
        yoe: "11 Years",
        experience: "Precision Chemotherapy, Targeted Immunotherapy & Molecular Oncology",
        email: "deep.vora@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Rohit Pai",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Consultant - Medical Oncology",
        degree: "DM Medical Oncology",
        yoe: "12 Years",
        experience: "Systemic Cancer Therapies, Clinical Research & Targeted Regimens",
        email: "rohit.pai@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Kunal Goyal",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Lead Specialist - Hemato-Oncology & CAR-T Therapy",
        degree: "DM Hematoncology & CART T cell therapy specialist",
        yoe: "10 Years",
        experience: "CAR-T Cell Therapy Specialist & Bone Marrow Stem Cell Transplantation",
        email: "kunal.goyal@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Mischil Parekh",
        department: "Department of Surgical, Medical & Hemat Oncology",
        position: "Consultant - Bone & Soft Tissue Oncology",
        degree: "MS, Fellowship in Bone & Soft tissue oncology",
        yoe: "9 Years",
        experience: "Bone & Soft Tissue Sarcoma, Limb Preservation Surgeries & Reconstruction",
        email: "mischil.parekh@apex.com",
        rating: 4.8,
    },

    // 10-14. Department of General Medicine, Endocrine & Clinical Hematology
    {
        name: "Dr. Digambar Panchal",
        department: "Department of General Medicine, Endocrine & Clinical Hematology",
        position: "Consultant - Clinical Hematology",
        degree: "MD, DNB Clinical Hematology",
        yoe: "13 Years",
        experience: "Benign & Malignant Hematology, Myeloma Care · Evening 6–8 PM Daily",
        email: "digambar.panchal@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Rohit Barnabas",
        department: "Department of General Medicine, Endocrine & Clinical Hematology",
        position: "Consultant Endocrinologist & Diabetologist",
        degree: "MD, DM Endocrinology",
        yoe: "12 Years",
        experience: "Specialist in Endocrine Tumors, Thyroid Neoplasms & Diabetic Oncology Care",
        email: "rohit.barnabas@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Shailendra Singh",
        department: "Department of General Medicine, Endocrine & Clinical Hematology",
        position: "Senior Consultant Physician",
        degree: "MD Medicine",
        yoe: "14 Years",
        experience: "Internal Medicine & Comprehensive Inpatient Critical Care",
        email: "shailendra.singh@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Rahul Nikumbhe",
        department: "Department of General Medicine, Endocrine & Clinical Hematology",
        position: "Consultant Physician - Internal Medicine",
        degree: "MD Medicine",
        yoe: "11 Years",
        experience: "Systemic Multi-Organ Inpatient Care & Peri-operative Oncology Medicine",
        email: "rahul.nikumbhe@apex.com",
        rating: 4.7,
    },
    {
        name: "Dr. Saurabh",
        department: "Department of General Medicine, Endocrine & Clinical Hematology",
        position: "Consultant Physician",
        degree: "MD Medicine",
        yoe: "8 Years",
        experience: "Internal Medicine & Acute Oncology Supportive Care Protocols",
        email: "saurabh.physician@apex.com",
        rating: 4.7,
    },

    // 15-16. Department of Urology & Andrology
    {
        name: "Dr. Tarun Rochlani",
        department: "Department of Urology & Andrology",
        position: "Lead Consultant - Urologist & Andrologist",
        degree: "Mch. Urology",
        yoe: "13 Years",
        experience: "Uro-Oncology, Prostate & Bladder Surgeries · Everyday 7–9 PM",
        email: "tarun.rochlani@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Bhushan Patil",
        department: "Department of Urology & Andrology",
        position: "Consultant - Urologist & Andrologist",
        degree: "Mch Urology",
        yoe: "12 Years",
        experience: "Advanced Endourology, Reconstructive Surgeries & Stone Treatment",
        email: "bhushan.patil@apex.com",
        rating: 4.8,
    },

    // 17-18. Department of Respiratory Medicine
    {
        name: "Dr. Rishabh Raj",
        department: "Department of Respiratory Medicine",
        position: "Consultant - Pulmonology & Critical Care",
        degree: "DM Respiratory Medicine And Critical Care",
        yoe: "10 Years",
        experience: "Interventional Bronchoscopy & Thoracic Oncology · Tuesday & Thursday 3–5 PM",
        email: "rishabh.raj@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Vikas Oswal",
        department: "Department of Respiratory Medicine",
        position: "Senior Consultant - Pulmonology & Chest Medicine",
        degree: "TB chest Specialist",
        yoe: "15 Years",
        experience: "Advanced Chest Medicine, Thoracic Care & MDR-TB Management",
        email: "vikas.oswal@apex.com",
        rating: 4.9,
    },

    // 19-22. Department of Pain & Palliative Oncology
    {
        name: "Dr. P. N. Jain",
        department: "Department of Pain & Palliative Oncology",
        position: "Chief Consultant - Pain & Palliative Oncology",
        degree: "DM Pain & palliative oncology",
        yoe: "24 Years",
        experience: "Pioneer in Advanced Interventional Cancer Pain Management & Nerve Blocks",
        email: "pn.jain@apex.com",
        rating: 5.0,
    },
    {
        name: "Dr. Piyush Wani",
        department: "Department of Pain & Palliative Oncology",
        position: "Consultant - Interventional Pain Specialist",
        degree: "DNB Anaesthesia & Fellowship In Pain Medicine",
        yoe: "11 Years",
        experience: "Neurolytic Blocks, Epidural Infusions & Chronic Pain Alleviation",
        email: "piyush.wani@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Mahesh Menon",
        department: "Department of Pain & Palliative Oncology",
        position: "Consultant - Pain Medicine & Palliative Care",
        degree: "MD, Fellowship in Pain medicine",
        yoe: "12 Years",
        experience: "Multimodal Analgesia & Supportive Palliative Protocols",
        email: "mahesh.menon@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Prarthna Jayaseelan",
        department: "Department of Pain & Palliative Oncology",
        position: "Consultant - Palliative Oncology",
        degree: "DM Palliative Oncology",
        yoe: "9 Years",
        experience: "Holistic Quality of Life, Symptom Care & Family Support Counseling",
        email: "prarthna.j@apex.com",
        rating: 4.8,
    },

    // 23-26. Department of Spine & Orthopaedics
    {
        name: "Dr. Naushad Hussain",
        department: "Department of Spine & Orthopaedics",
        position: "Senior Consultant - Spine & Orthopaedic Surgery",
        degree: "MS Orthopaedics",
        yoe: "16 Years",
        experience: "Complex Spine Surgeries, Joint Preservation & Decompression",
        email: "naushad.hussain@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Faiz Khan",
        department: "Department of Spine & Orthopaedics",
        position: "Consultant - Orthopaedic & Spine Surgeon",
        degree: "MS Orthopaedics",
        yoe: "12 Years",
        experience: "Trauma Reconstruction & Spine Surgeries · Evening 7–8 PM Daily",
        email: "faiz.khan@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Ameya Nandanwar",
        department: "Department of Spine & Orthopaedics",
        position: "Consultant - Orthopaedic Physical Therapy Specialist",
        degree: "MS Orthopaedicstherapy specialist",
        yoe: "10 Years",
        experience: "Musculoskeletal Rehabilitation, Functional Mobility & Gait Training",
        email: "ameya.nandanwar@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Kushal Gori",
        department: "Department of Spine & Orthopaedics",
        position: "Consultant - Joint Reconstruction & Orthopaedics",
        degree: "MS Orthopaedics",
        yoe: "11 Years",
        experience: "Arthroscopic Surgery, Joint Replacement & Orthopaedic Oncology Care",
        email: "kushal.gori@apex.com",
        rating: 4.8,
    },

    // 27-32. Department of General, Laparoscopic & Bariatric Surgery
    {
        name: "Dr. Harsh Sheth",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Lead Consultant - Laparoscopic & Bariatric Surgery",
        degree: "MS General Surgery, Fellowship in Bariatric Surgery",
        yoe: "14 Years",
        experience: "Advanced Laparoscopic, Bariatric & Upper GI Oncology Procedures",
        email: "harsh.sheth@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Dilip Bhosale",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Senior Consultant - General & GI Surgery",
        degree: "MS General Surgery",
        yoe: "20 Years",
        experience: "Emergency & Elective Laparoscopic Surgeries, GI Oncosurgery",
        email: "dilip.bhosale@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. K.P. Madhukar",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Senior Consultant Surgeon",
        degree: "MS General Surgery",
        yoe: "17 Years",
        experience: "Complex Abdominal Wall Reconstruction & GI Surgical Procedures",
        email: "kp.madhukar@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Aashik Shetty",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Consultant - General & Laparoscopic Surgery",
        degree: "MS General Surgery",
        yoe: "11 Years",
        experience: "Minimally Invasive Abdominal & Soft Tissue Surgeries",
        email: "aashik.shetty@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Chetan Shenoy",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Consultant - General Surgeon",
        degree: "MS General Surgery",
        yoe: "10 Years",
        experience: "Trauma Care, Hernia Repair & General Surgical Interventions",
        email: "chetan.shenoy@apex.com",
        rating: 4.7,
    },
    {
        name: "Dr. Nikhil Gawde",
        department: "Department of General, Laparoscopic & Bariatric Surgery",
        position: "Consultant - General & Laparoscopic Surgery",
        degree: "DNB General Surgery",
        yoe: "9 Years",
        experience: "Colorectal, Laparoscopic & General Surgery Specialist",
        email: "nikhil.gawde@apex.com",
        rating: 4.7,
    },

    // 33-35. Department of Interventional Cardiology
    {
        name: "Dr. Prof. Anil Potdar",
        department: "Department of Interventional Cardiology",
        position: "Professor & Chief Interventional Cardiologist",
        degree: "DM Cardio, Interventional Cardiologist",
        yoe: "28 Years",
        experience: "Complex Coronary Interventions, Hybrid OT-Cathlab & Valvuloplasty",
        email: "anil.potdar@apex.com",
        rating: 5.0,
    },
    {
        name: "Dr. Vedanti Shringare",
        department: "Department of Interventional Cardiology",
        position: "Consultant - Interventional Cardiologist",
        degree: "DM Cardio, Interventional Cardiologist",
        yoe: "12 Years",
        experience: "Cardio-Oncology, Preventive Cardiology & Heart Failure Care",
        email: "vedanti.shringare@apex.com",
        rating: 4.8,
    },
    {
        name: "Dr. Shankar Machigar",
        department: "Department of Interventional Cardiology",
        position: "Consultant - Interventional Cardiologist",
        degree: "DM Cardio, Interventional Cardiologist",
        yoe: "13 Years",
        experience: "Coronary Angioplasty & Structural Heart Interventions",
        email: "shankar.machigar@apex.com",
        rating: 4.8,
    },

    // 36-37. Department of Radiology & Interventional Radiology
    {
        name: "Dr. Shashikant Yadav",
        department: "Department of Radiology & Interventional Radiology",
        position: "Lead Consultant Radiologist",
        degree: "DNB Radiology",
        yoe: "14 Years",
        experience: "Oncology Diagnostic Imaging, High-Resolution CT & 3T MRI Protocols",
        email: "shashikant.yadav@apex.com",
        rating: 4.9,
    },
    {
        name: "Dr. Amit Sahu",
        department: "Department of Radiology & Interventional Radiology",
        position: "Consultant - Interventional Radiologist",
        degree: "Fellowship in Interventional Radiology",
        yoe: "11 Years",
        experience: "Minimally Invasive Tumor Ablation, Biopsies & Embolization",
        email: "amit.sahu@apex.com",
        rating: 4.8,
    },
];

export async function POST() {
    try {
        await connectToDatabase();
        const hashedPassword = await bcrypt.hash("doctor123", 10);
        let createdCount = 0;
        let updatedCount = 0;

        for (const spec of hospitalSpecialists) {
            const existing = await User.findOne({ email: spec.email.toLowerCase() });
            if (existing) {
                existing.name = spec.name;
                existing.department = spec.department;
                existing.position = spec.position;
                existing.degree = spec.degree;
                existing.yoe = spec.yoe;
                existing.experience = spec.experience;
                existing.specialty = spec.department;
                existing.rating = spec.rating || existing.rating || 4.8;
                existing.role = "doctor";
                await existing.save();
                updatedCount++;
            } else {
                await User.create({
                    name: spec.name,
                    email: spec.email.toLowerCase(),
                    password: hashedPassword,
                    role: "doctor",
                    department: spec.department,
                    position: spec.position,
                    degree: spec.degree,
                    yoe: spec.yoe,
                    experience: spec.experience,
                    specialty: spec.department,
                    rating: spec.rating || 4.8,
                    available: true,
                });
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${createdCount} new specialists and updated ${updatedCount} existing specialists across departments with YoE and positions.`,
            total: hospitalSpecialists.length,
        });
    } catch (err: any) {
        console.error("[SEED DOCTORS ERROR]", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const doctors = await User.find({ role: "doctor" })
            .select("name email department position degree yoe experience available rating specialty")
            .sort({ department: 1, name: 1 });

        return NextResponse.json({
            success: true,
            count: doctors.length,
            doctors,
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
