"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareRootVariable } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export default function Lessons() {
	const [competence, setCompetence] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// MOCK: Replace with API call to fetch sousCompétence scores for the student
	// Example: [score for sousComp 1, score for sousComp 2, ...]
	const sousCompetenceScores = [0, 0, 0, 0, 0]; // All zero for now
	const totalSousCompetence = sousCompetenceScores.length;
	const sum = sousCompetenceScores.reduce((a, b) => a + b, 0);
	const average = totalSousCompetence ? sum / totalSousCompetence : 0;

	useEffect(() => {
		const fetchCompetence = async () => {
			try {
				const response = await axios.get("/api/competencies");
				// Find the unique competence ("Suites numériques")
				const found = response.data.find(
					(comp) => comp.competence === "Suites numériques"
				);
				setCompetence(found);
			} catch (err) {
				setError("Erreur lors du chargement de la compétence");
			} finally {
				setLoading(false);
			}
		};
		fetchCompetence();
	}, []);

	if (loading) {
		return (
			<section className="px-0 md:px-5 py-5 flex flex-col gap-6">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skblue"></div>
				</div>
			</section>
		);
	}

	if (error || !competence) {
		return (
			<section className="px-0 md:px-5 py-5 flex flex-col gap-6">
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
					{error || "Aucune compétence trouvée."}
				</div>
			</section>
		);
	}

	return (
		<section className="px-0 md:px-5 py-5 flex flex-col gap-6">
			<div className="flex flex-col gap-1.5 mb-2">
				<h1 className="font-bold text-3xl">Leçons</h1>
				<p className="text-neutral-500 text-[13px] sm:text-sm">
					Explorez les leçons disponibles pour améliorer vos compétences.
				</p>
			</div>
			<div className="grid grid-cols-1 min-[840px]:grid-cols-2 xl:grid-cols-3 gap-8">
				<Link
					href="/subjects/math/lessons/suites-numeriques"
					className="flex flex-col min-[465px]:flex-row gap-0 bg-white shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] hover:shadow-[3px_3px_15px_0px_rgba(0,_0,_0,_0.15)] transition-shadow"
				>
					<div className="flex justify-center items-center p-5 bg-skblue/10">
						<FontAwesomeIcon
							icon={faSquareRootVariable}
							className="w-9 text-[#135EA5]"
						/>
					</div>
					<div className="flex flex-col gap-1 p-3 flex-grow-1">
						<p className="font-semibold">{competence.competence}</p>
						<p className="text-neutral-400 text-xs">
							{competence.description || "Maîtrisez les concepts des suites numériques"}
						</p>
						<div>
							<p className="flex justify-end text-xs text-neutral-400">
								{average.toFixed(1)}/20 Note
							</p>
							<div className="bg-neutral-200 h-3 w-full mt-1">
								<div
									className="bg-skblue h-3 transition-all duration-300"
									style={{ width: `${(average / 20) * 100}%` }}
								></div>
							</div>
						</div>
					</div>
				</Link>
			</div>
		</section>
	);
}
