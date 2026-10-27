export const HOSPITAL_DEPARTMENTS = [
    "Department of Oncology",
    "Department of Histopathology & Pathology",
    "Department of Surgical, Medical & Hemat Oncology",
    "Department of General Medicine, Endocrine & Clinical Hematology",
    "Department of Urology & Andrology",
    "Department of Respiratory Medicine",
    "Department of Pain & Palliative Oncology",
    "Department of Spine & Orthopaedics",
    "Department of General, Laparoscopic & Bariatric Surgery",
    "Department of Interventional Cardiology",
    "Department of Radiology & Interventional Radiology",
] as const;

export type HospitalDepartment = typeof HOSPITAL_DEPARTMENTS[number];
