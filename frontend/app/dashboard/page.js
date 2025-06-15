"use client";
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import Header from "../components/client/Header";
import Sidebar from "../components/client/Sidebar";
import Home from "../components/client/Home";
import AdminDashboard from "../components/admin/AdminDashboard";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import TeacherLessons from "../components/teacher/TeacherLessons";
import authService from "@/app/services/auth.service";

export default function DashboardPage() {
	const user = authService.getCurrentUser();
	const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
	const tab = searchParams ? searchParams.get('tab') : null;
	return (
		<ProtectedRoute>
			<section className="flex h-dvh overflow-hidden">
				<Sidebar />
				<section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
					<Header />
					{user?.role === "admin" ? (
						<AdminDashboard />
					) : user?.role === "teacher" && tab === "lessons" ? (
						<TeacherLessons />
					) : user?.role === "teacher" ? (
						<TeacherDashboard />
					) : (
						<Home />
					)}
				</section>
			</section>
		</ProtectedRoute>
	);
}
