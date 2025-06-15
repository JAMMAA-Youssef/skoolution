import React, { useState, useEffect } from "react";
import { BookOpen, Users, BarChart2 } from "lucide-react";
import authService from "@/app/services/auth.service";

export default function TeacherDashboard() {
  const [userData, setUserData] = useState({
    username: "",
    levels: [],
    profilePicture: "/sk/default-profile.png"
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUserData({
            username: currentUser.username || "",
            levels: currentUser.levels || [],
            profilePicture: currentUser.profilePicture || "/sk/default-profile.png"
          });
        }
      } catch (error) {
        console.error('Error loading user data in TeacherDashboard:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <section className="px-0 md:px-5 py-5 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-bold text-3xl">Tableau de bord enseignant</h1>
          <p className="text-neutral-500 text-[13px] sm:text-sm">
            Bienvenue dans votre espace enseignant personnalisé !
          </p>
        </div>
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden">
            <div className="bg-[#02874F] flex justify-center items-center p-3">
              <BookOpen className="text-white" />
            </div>
            <div className="flex flex-col justify-between p-2 gap-3 grow-1">
              <div>
                <p className="text-sm font-semibold">Leçons</p>
                <p className="text-[12px]">Aperçu de vos leçons actives</p>
              </div>
            </div>
          </div>
          <div className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden">
            <div className="bg-[#F58900] flex justify-center items-center p-3">
              <Users className="text-white" />
            </div>
            <div className="flex flex-col justify-between p-2 gap-3 grow-1">
              <div>
                <p className="text-sm font-semibold">Progression des élèves</p>
                <p className="text-[12px]">Suivi de la performance des élèves</p>
              </div>
            </div>
          </div>
          <div className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden">
            <div className="bg-skblue flex justify-center items-center p-3">
              <BarChart2 className="text-white" />
            </div>
            <div className="flex flex-col justify-between p-2 gap-3 grow-1">
              <div>
                <p className="text-sm font-semibold">Statistiques</p>
                <p className="text-[12px]">Voir les statistiques d'enseignement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 