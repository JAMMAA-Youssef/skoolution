"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareRootVariable } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Header from "@/app/components/client/Header";
import Sidebar from "@/app/components/client/Sidebar";

export default function SuitesNumeriquesPage() {
  const [subCompetencies, setSubCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MOCK: Replace with API call to fetch sousCompétence scores for the student
  // Example: { [sousCompetenceId]: score }
  const mockSousCompetenceScores = {
    // Example: '683f72977047d680007a8c77': 0,
    // ...
  };

  useEffect(() => {
    const fetchSubCompetencies = async () => {
      try {
        const response = await axios.get("/api/competencies");
        // Filter for all objects with competence === "Suites numériques"
        const filtered = response.data.filter(
          comp => comp.competence === "Suites numériques"
        );
        setSubCompetencies(filtered);
      } catch (err) {
        setError("Erreur lors du chargement des sous-compétences");
      } finally {
        setLoading(false);
      }
    };
    fetchSubCompetencies();
  }, []);

  if (loading) {
    return (
      <section className="flex h-dvh overflow-hidden">
        <Sidebar />
        <section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skblue"></div>
          </div>
        </section>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex h-dvh overflow-hidden">
        <Sidebar />
        <section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
          <Header />
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="flex h-dvh overflow-hidden">
      <Sidebar />
      <section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
        <Header />
        <div className="px-0 md:px-5 py-5 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 mb-2">
            <h1 className="font-bold text-3xl">Suites numériques</h1>
            <p className="text-neutral-500 text-[13px] sm:text-sm">
              Explorez les différentes sous-compétences des suites numériques
            </p>
          </div>

          <div className="grid grid-cols-1 min-[840px]:grid-cols-2 xl:grid-cols-3 gap-8">
            {subCompetencies.map((comp) => {
              const score = mockSousCompetenceScores[comp._id] || 0;
              return (
                <Link
                  key={comp._id}
                  href={`/subjects/math/lessons/suites-numeriques/${comp._id}`}
                  className="flex flex-col min-[465px]:flex-row gap-0 bg-white shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] hover:shadow-[3px_3px_15px_0px_rgba(0,_0,_0,_0.15)] transition-shadow"
                >
                  <div className="flex justify-center items-center p-5 bg-skblue/10">
                    <FontAwesomeIcon
                      icon={faSquareRootVariable}
                      className="w-9 text-[#135EA5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1 p-3 flex-grow-1">
                    <p className="font-semibold">{comp.competence}</p>
                    <p className="text-neutral-400 text-xs">
                      {comp.sousCompetence}
                    </p>
                    <div>
                      <p className="flex justify-end text-xs text-neutral-400">
                        {score}/20 Note
                      </p>
                      <div className="bg-neutral-200 h-3 w-full mt-1">
                        <div
                          className="bg-skblue h-3 transition-all duration-300"
                          style={{ width: `${(score / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
} 