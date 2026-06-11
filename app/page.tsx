"use client";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import { RegisterPage, LoginPage } from "./components/AuthPages";
import PatientDashboard from "./components/PatientDashboard";
import ChatPage from "./components/ChatPage";
import PackagesPage from "./components/PackagesPage";
import ServicesPage from "./components/ServicesPage";
import EventsPage from "./components/EventsPage";
import AboutPage from "./components/AboutPage";
import AppointmentsPage from "./components/AppointmentsPage";
import { DiseaseInfoPage, SymptomsPage, DoctorDashboard, AdminDashboard } from "./components/OtherPages";
import { useApp } from "./context/AppContext";

export default function App() {
  const { page } = useApp();

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "register": return <RegisterPage />;
      case "login": return <LoginPage />;
      case "patient-dashboard": return <PatientDashboard />;
      case "doctor-dashboard": return <DoctorDashboard />;
      case "admin-dashboard": return <AdminDashboard />;
      case "chat": return <ChatPage />;
      case "packages": return <PackagesPage />;
      case "services": return <ServicesPage />;
      case "events": return <EventsPage />;
      case "about": return <AboutPage />;
      case "appointments": return <AppointmentsPage />;
      case "disease-info": return <DiseaseInfoPage />;
      case "symptoms": return <SymptomsPage />;
      default: return <HomePage />;
    }
  };

  const noNav = ["register", "login"].includes(page);

  return (
    <div className="min-h-screen">
      {!noNav && <Navbar />}
      {renderPage()}
    </div>
  );
}