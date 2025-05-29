"use client";
import { faSquareRootVariable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	Atom,
	BadgeCheck,
	Book,
	BookOpen,
	ChartSpline,
	Dot,
	Earth,
	Languages,
	MoveRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import authService from "@/app/services/auth.service";
import Image from "next/image";

export default function Home() {
	const [userData, setUserData] = useState({
		username: "",
		level: "2ème année Bac SMA",
		profilePicture: "/sk/testimony_4.webp"
	});

	useEffect(() => {
		console.log('Home component mounted');
		const loadUserData = async () => {
			try {
				console.log('Attempting to load user data in Home component');
				const currentUser = authService.getCurrentUser();
				console.log('Current user data received in Home:', currentUser);
				
				if (currentUser) {
					console.log('Setting user data in Home state:', {
						username: currentUser.username || "",
						level: currentUser.level || "2ème année Bac SMA",
						profilePicture: currentUser.profilePicture || "/sk/testimony_4.webp"
					});
					
					setUserData({
						username: currentUser.username || "",
						level: currentUser.level || "2ème année Bac SMA",
						profilePicture: currentUser.profilePicture || "/sk/testimony_4.webp"
					});
				} else {
					console.warn('No user data available in Home component');
				}
			} catch (error) {
				console.error('Error loading user data in Home:', error);
			}
		};

		loadUserData();
	}, []);

	// Debug log for state changes
	useEffect(() => {
		console.log('userData state updated in Home:', userData);
	}, [userData]);

	return (
		<section className="px-0 md:px-5 py-5 flex flex-col gap-6">
			{/* Title + Cards */}
			<div className="flex flex-col gap-3">
				{/* Titles */}
				<div className="flex flex-col gap-1.5">
					<h1 className="font-bold text-3xl">Accueil</h1>
					<p className="text-neutral-500 text-[13px] sm:text-sm">
						Bienvenue dans ton espace personnalisé !
					</p>
					<h2 className="font-semibold text-xl mt-1.5">Mon apprentissage</h2>
				</div>
				{/* Cards */}
				<div className="grid grid-cols-1 min-[550px]:grid-cols-2 lg:grid-cols-4 gap-3">
					{/* First Case */}
					<Link
						href={`#`}
						className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden"
					>
						<div className="bg-[#02874F] flex justify-center items-center p-3">
							<Book className="text-white" />
						</div>
						<div className="flex flex-col justify-between p-2 gap-3 grow-1">
							<div>
								<p className="text-sm font-semibold">32</p>
								<p className="text-[12px]">Leçons complétées</p>
							</div>
							<div className="flex justify-between items-end border-t border-neutral-300 w-full">
								<p className="text-[10px] text-neutral-400">
									Voire les détailles
								</p>
								<MoveRight
									strokeWidth={1}
									className="text-neutral-400 translate-y-1"
								/>
							</div>
						</div>
					</Link>
					{/* Second Case */}
					<Link
						href={`#`}
						className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden"
					>
						<div className="bg-[#F58900] flex justify-center items-center p-3">
							<BookOpen className="text-white" />
						</div>
						<div className="flex flex-col justify-between p-2 gap-3 grow-1">
							<div>
								<p className="text-sm font-semibold">11</p>
								<p className="text-[12px]">Leçons en cours</p>
							</div>
							<div className="flex justify-between items-end border-t border-neutral-300 w-full">
								<p className="text-[10px] text-neutral-400">
									Voire les détailles
								</p>
								<MoveRight
									strokeWidth={1}
									className="text-neutral-400 translate-y-1"
								/>
							</div>
						</div>
					</Link>
					{/* Third Case */}
					<Link
						href={`#`}
						className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden"
					>
						<div className="bg-skblue flex justify-center items-center p-3">
							<BadgeCheck className="text-white" />
						</div>
						<div className="flex flex-col justify-between p-2 gap-3 grow-1">
							<div>
								<p className="text-sm font-semibold">47</p>
								<p className="text-[12px]">Tests complétés</p>
							</div>
							<div className="flex justify-between items-end border-t border-neutral-300 w-full">
								<p className="text-[10px] text-neutral-400">
									Voire les détailles
								</p>
								<MoveRight
									strokeWidth={1}
									className="text-neutral-400 translate-y-1"
								/>
							</div>
						</div>
					</Link>
					{/* Fourth Case */}
					<Link
						href={`#`}
						className="flex bg-white border border-neutral-200 rounded-xs overflow-hidden"
					>
						<div className="bg-[#6366F1] flex justify-center items-center p-3">
							<ChartSpline className="text-white" />
						</div>
						<div className="flex flex-col justify-between p-2 gap-3 grow-1">
							<div>
								<p className="text-sm font-semibold">
									32
									<span className="text-neutral-400 font-normal text-[8px]">
										/20
									</span>
								</p>
								<p className="text-[12px]">Moyenne générale</p>
							</div>
							<div className="flex justify-between items-end border-t border-neutral-300 w-full">
								<p className="text-[10px] text-neutral-400">
									Voire les détailles
								</p>
								<MoveRight
									strokeWidth={1}
									className="text-neutral-400 translate-y-1"
								/>
							</div>
						</div>
					</Link>
				</div>
			</div>
			{/* Lecons en cours */}
			<section className="flex flex-col gap-3">
				{/* Title */}
				<div>
					<p className="text-skblue skblue text-base sm:text-2xl font-semibold">
						Bravo {userData.username || 'Amina'}, tu progresses bien cette semaine 🎉
					</p>
					<h2 className="font-semibold text-xl mt-1.5">Mes leçons en cours</h2>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Card One */}
					<Link
						href="#"
						className="flex flex-col flex-grow-1 shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] rounded-xs overflow-hidden"
					>
						<div className="bg-white flex justify-center items-center h-[160px]">
							<FontAwesomeIcon
								icon={faSquareRootVariable}
								className="w-20 text-[#135EA5]"
							/>
						</div>
						<div className="bg-[#135EA5] text-white p-3 flex flex-col gap-3">
							<h3 className="font-semibold">Limites et continuité</h3>
							<div className="flex items-center justify-between text-sm text-neutral-200">
								<div className="flex items-center">
									<p>Chapitre 5</p>
									<Dot />
									<p>test 4</p>
								</div>
								<p>20%</p>
							</div>
							<div className="bg-white/50 h-3 w-full -mt-1">
								<div className="bg-white h-3 w-[20%]"></div>
							</div>
						</div>
					</Link>
					{/* Card Two */}
					<Link
						href="#"
						className="flex flex-col flex-grow-1 shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] rounded-xs overflow-hidden"
					>
						<div className="bg-white flex justify-center items-center h-[160px]">
							<Earth size={80} className="text-[#02874F]" />
						</div>
						<div className="bg-[#02874F] text-white p-3 flex flex-col gap-3">
							<h3 className="font-semibold">
								Les réactions responsables de la...
							</h3>
							<div className="flex items-center justify-between text-sm text-neutral-200">
								<div className="flex items-center">
									<p>Chapitre 3</p>
									<Dot />
									<p>test 4</p>
								</div>
								<p>45%</p>
							</div>
							<div className="bg-white/50 h-3 w-full -mt-1">
								<div className="bg-white h-3 w-[45%]"></div>
							</div>
						</div>
					</Link>
					{/* Card Three */}
					<Link
						href="#"
						className="flex flex-col flex-grow-1 shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] rounded-xs overflow-hidden"
					>
						<div className="bg-white flex justify-center items-center h-[160px]">
							<Atom size={80} className="text-[#455A64]" />
						</div>
						<div className="bg-[#455A64] text-white p-3 flex flex-col gap-3">
							<h3 className="font-semibold">Décroissance radioactive</h3>
							<div className="flex items-center justify-between text-sm text-neutral-200">
								<div className="flex items-center">
									<p>Chapitre 2</p>
									<Dot />
									<p>test 3</p>
								</div>
								<p>60%</p>
							</div>
							<div className="bg-white/50 h-3 w-full -mt-1">
								<div className="bg-white h-3 w-[60%]"></div>
							</div>
						</div>
					</Link>
					{/* Card Four */}
					<Link
						href="#"
						className="flex flex-col flex-grow-1 shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] rounded-xs overflow-hidden"
					>
						<div className="bg-white flex justify-center items-center h-[160px]">
							<Languages size={80} className="text-[#8E24AA]" />
						</div>
						<div className="bg-[#8E24AA] text-white p-3 flex flex-col gap-3">
							<h3 className="font-semibold">Limites et continuité</h3>
							<div className="flex items-center justify-between text-sm text-neutral-200">
								<div className="flex items-center">
									<p>Chapitre 2</p>
									<Dot />
									<p>test 3</p>
								</div>
								<p>35%</p>
							</div>
							<div className="bg-white/50 h-3 w-full -mt-1">
								<div className="bg-white h-3 w-[35%]"></div>
							</div>
						</div>
					</Link>
					{/* Card Five */}
					<Link
						href="#"
						className="flex flex-col flex-grow-1 shadow-[3px_3px_10px_0px_rgba(0,_0,_0,_0.1)] rounded-xs overflow-hidden"
					>
						<div className="bg-white flex justify-center items-center h-[160px]">
							<FontAwesomeIcon
								icon={faSquareRootVariable}
								className="w-20 text-[#135EA5]"
							/>
						</div>
						<div className="bg-[#135EA5] text-white p-3 flex flex-col gap-3">
							<h3 className="font-semibold">Limites et continuité</h3>
							<div className="flex items-center justify-between text-sm text-neutral-200">
								<div className="flex items-center">
									<p>Chapitre 3</p>
									<Dot />
									<p>test 3</p>
								</div>
								<p>14%</p>
							</div>
							<div className="bg-white/50 h-3 w-full -mt-1">
								<div className="bg-white h-3 w-[14%]"></div>
							</div>
						</div>
					</Link>
				</div>
			</section>
		</section>
	);
}
