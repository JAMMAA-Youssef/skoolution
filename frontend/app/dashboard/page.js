"use client";
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import Header from "../components/client/Header";
import Sidebar from "../components/client/Sidebar";
import Home from "../components/client/Home";

export default function DashboardPage() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
				<section className="flex h-dvh overflow-hidden">
					<Sidebar />
					<section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa]  overflow-y-scroll">
						<Header />
						<Home />
					</section>
				</section>
			</div>
		</ProtectedRoute>
	);
}
