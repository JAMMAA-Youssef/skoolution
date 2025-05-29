"use client";
import { Bell, Pencil, Search } from "lucide-react";
import { useEffect, useState } from "react";
import authService from "@/app/services/auth.service";
import Image from "next/image";

export default function Header() {
	const [userData, setUserData] = useState({
		level: "2ème année Bac SMA",
		username: "",
		profilePicture: "/sk/testimony_4.webp"
	});

	useEffect(() => {
		const loadUserData = async () => {
			try {
				const currentUser = authService.getCurrentUser();
				console.log('Current user data in Header:', currentUser); // Debug log
				if (currentUser) {
					setUserData({
						level: currentUser.level || "2ème année Bac SMA",
						username: currentUser.username || "",
						profilePicture: currentUser.profilePicture || "/sk/testimony_4.webp"
					});
				}
			} catch (error) {
				console.error('Error loading user data in Header:', error);
			}
		};

		loadUserData();
	}, []);

	return (
		<section>
			<div className="w-full flex gap-3 items-center justify-between">
				<div className="relative w-full">
					<input
						type="search"
						placeholder="Rechercher une leçon, un test, une matière ..."
						className="border border-neutral-200 p-3 pl-12 w-full bg-white placeholder:text-sm h-10"
					/>
					<Search
						size={20}
						className="absolute top-1/2 -translate-y-1/2 left-4 text-neutral-500 rounded-sm"
					/>
				</div>
				<div className="flex items-center gap-1">
					<div className="flex justify-end">
						<button className="bg-skblue text-white flex items-center justify-center gap-2 px-1.5 md:py-3 md:px-6 h-9 md:h-10 w-9 md:w-auto rounded-full md:rounded-none cursor-pointer">
							<Pencil size={18} />
							<span className="hidden md:inline text-nowrap">
								{userData.level}
							</span>
						</button>
					</div>
					<div className="flex justify-end">
						<button className="text-neutral-400 flex items-center justify-center gap-1 w-9 rounded-full cursor-pointer">
							<span>|</span>
							<Bell size={18} />
						</button>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium hidden md:block">{userData.username}</span>
						<div className="w-9 flex justify-end">
							<Image
								src={userData.profilePicture}
								alt={userData.username || "Profile"}
								width={36}
								height={36}
								className="border-2 border-skblue rounded-full"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
