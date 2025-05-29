"use client";
import { useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/UseClickOutside";
import { ChartNoAxesCombined, GraduationCap, Home, LogOut, Book, BarChart2, Users, LayoutDashboard, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import authService from "@/app/services/auth.service";

export default function Sidebar() {
	// Close and Open The Sidebar On Focus Change
	const [opensidebar, setOpensidebar] = useState();
	const sidebarRef = useRef(null);
	useClickOutside(sidebarRef, () => setOpensidebar(false));
	useEffect(() => {
		// Detect screen width when component mounts
		if (window.innerWidth >= 768) {
			setOpensidebar(true); // md and above => open
		}
	}, []);
	// Change color of current Link
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentTab = searchParams.get('tab');
	const user = authService.getCurrentUser();

	// Admin sidebar links
	const adminLinks = [
		{ href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
		{ href: "/dashboard?tab=users", label: "Manage Users", icon: <Users size={20} /> },
		{ href: "/dashboard?tab=subjects", label: "Manage Subjects", icon: <BookOpen size={20} /> },
		{ href: "/dashboard?tab=lessons", label: "Manage Lessons", icon: <Book size={20} /> },
	];

	// User sidebar links
	const userLinks = [
		{ href: "/dashboard", label: "dashboard", icon: <LayoutDashboard size={20} /> },
		{ href: "/subjects", label: "subjects", icon: <BookOpen size={20} /> },
		{ href: "/progression", label: "progression", icon: <BarChart2 size={20} /> },
	];

	const links = user?.role === "admin" ? adminLinks : userLinks;

	return (
		<div className="absolute md:relative z-50">
			<aside
				className={`bg-white h-dvh px-2 md:px-5 py-6 flex flex-col justify-between gap-5 shadow-sm md:shadow-[14px_4px_42px_-8px_#e3e3e3] ${
					opensidebar ? " w-[280px]" : " w-[60px] md:w-[80px]"
				}  transition-all duration-300`}
				ref={sidebarRef}
				onClick={() => setOpensidebar(true)}
			>
				{/* Logo + Links */}
				<div className="flex flex-col gap-5">
					{/* Logo */}
					<div
						className={`flex ${
							opensidebar ? "justify-start" : "justify-center"
						} items-center`}
					>
						<div className="font-poppins text-xl sm:text-2xl flex items-center gap-1 tracking-wide font-semibold uppercase">
							<span
								className={`${
									opensidebar
										? "w-auto text-xl sm:text-2xl h-[40px]"
										: "w-9 text-sm h-[30px]"
								} flex justify-center items-center px-3.5  bg-skblue text-white`}
							>
								sk
							</span>
							<span
								className={`${
									opensidebar ? "scale-100 w-auto" : "scale-0 w-0"
								} text-skblue transition-all duration-200`}
							>
								oolution
							</span>
						</div>
					</div>
					{/* Links */}
					<div className="flex items-center flex-col gap-3.5">
						{links.map((link) => {
							let isActive = false;
							if (user?.role === "admin") {
								if (link.href === "/dashboard" && pathname === "/dashboard" && !currentTab) isActive = true;
								else if (link.href.includes("tab=") && pathname === "/dashboard" && link.href.split("tab=")[1] === currentTab) isActive = true;
							} else {
								isActive = pathname === link.href;
							}
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`relative flex hover:bg-blue-50 p-2 rounded-md w-full text-neutral-500 
									${opensidebar ? "justify-start gap-3.5" : "justify-center gap-0"} 
									${isActive ? "bg-blue-50 text-skblue" : "bg-white text-neutral-500"}
									`}
								>
									{link.icon}
									<span
										className={`${
											opensidebar ? "scale-100 w-full" : "scale-0 w-0"
										} text-nowrap transition-all duration-200`}
									>
										{link.label}
									</span>
								</Link>
							);
						})}
					</div>
				</div>
				{/* Logout */}
				<Link
					href="/login"
					className={`flex ${
						opensidebar ? "justify-start" : "justify-center"
					} gap-3.5 hover:bg-blue-50 text-neutral-500 p-2 rounded-md w-fit md:w-full`}
				>
					<LogOut size={20} className="text-neutral-500" />
					<span className={`${opensidebar ? "inline-block" : "hidden"}`}>
						Logout
					</span>
				</Link>
			</aside>
		</div>
	);
}
