"use client";
import { CircleArrowLeft, CircleArrowRight, Check } from "lucide-react";
import { useState } from "react";
import authService from "@/app/services/auth.service";
import { useRouter } from "next/navigation";

export default function Register_form() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		role: 'student',
		profilePicture: '',
		phone: '',
		school: '',
		level: ''
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const validateStep = (currentStep) => {
		switch (currentStep) {
			case 1:
				if (!formData.username || formData.username.length < 3) {
					setError('Username must be at least 3 characters long');
					return false;
				}
				if (!formData.phone) {
					setError('Phone number is required');
					return false;
				}
				break;
			case 2:
				if (!formData.school) {
					setError('School name is required');
					return false;
				}
				if (!formData.level) {
					setError('Level is required');
					return false;
				}
				break;
			case 3:
				if (!formData.email || !formData.email.includes('@')) {
					setError('Valid email is required');
					return false;
				}
				if (!formData.password || formData.password.length < 6) {
					setError('Password must be at least 6 characters long');
					return false;
				}
				break;
		}
		setError('');
		return true;
	};

	const handleNext = () => {
		if (validateStep(step)) {
			if (step < 3) {
				setStep(step + 1);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateStep(step)) return;

		try {
			setLoading(true);
			setError('');
			
			// Prepare user data for registration
			const userData = {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				role: formData.role,
				profilePicture: formData.profilePicture,
				level: formData.level,
				school: formData.school,
				phone: formData.phone
			};

			console.log('Attempting to register user with data:', { ...userData, password: '[REDACTED]' });
			
			const response = await authService.register(userData);
			console.log('Registration successful:', response);
			
			router.push('/dashboard');
		} catch (err) {
			console.error('Registration error:', err);
			setError(err.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
			// If it's an email or username conflict, go back to the relevant step
			if (err.message.includes('email')) {
				setStep(3);
			} else if (err.message.includes('username')) {
				setStep(1);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Error message */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<strong className="font-bold">Erreur: </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{/* Checks */}
			<div className="relative flex justify-between">
				{/* Left Charge */}
				<div className="absolute left-[56px] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-[#054bb4bf] z-30"></div>
				<div
					className={`absolute left-[56px] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-skblue ${
						step > 1 ? "-translate-x-0" : "-translate-x-[100%]"
					} transition-all duration-700 z-30`}
				></div>
				<div className="absolute left-[56px] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-white -translate-x-[100%] transition-all duration-500 z-30"></div>

				{/* Right Charge */}
				<div className="absolute right-[56px] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-[#054bb480] z-20"></div>

				<div
					className={`absolute right-[calc(56px+(100%-168px))] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-skblue ${
						step == 3 ? "translate-x-[200%]" : "translate-x-[100%]"
					} transition-all duration-500 z-20`}
				></div>

				<div
					className={`absolute right-[calc(56px+(100%-168px))] top-1/4 w-[calc((100%-168px)/2)] h-1 bg-white translate-x-[100%] transition-all duration-500 z-20`}
				></div>

				{/* Check 1 */}
				<div className="flex flex-col items-center w-[51px]">
					<div className="bg-skblue text-white flex justify-center items-center rounded-full p-2.5 w-10 h-10 mb-2 z-50">
						<Check />
					</div>
					<p className="text-skblue text-sm">Étape 1</p>
				</div>
				{/* Check 2 */}
				<div className="flex flex-col items-center w-[51px]">
					<div
						className={`${
							step > 1 ? "bg-skblue" : "bg-[#4478C7]"
						} text-white flex justify-center items-center rounded-full p-2.5 w-10 h-10 mb-2 z-50 transition-all duration-500 delay-500`}
					>
						<Check
							className={`${
								step > 1 ? "scale-100" : "scale-0"
							} transition-all duration-500 delay-500`}
						/>
					</div>
					<p
						className={`${
							step > 1 ? "text-skblue" : "text-[#4478C7]"
						} text-sm transition-all duration-500 delay-500`}
					>
						Étape 2
					</p>
				</div>
				{/* Check 3 */}
				<div className="flex flex-col items-center w-[51px]">
					<div
						className={`${
							step == 3 ? "bg-skblue" : "bg-[#4478C7]"
						} text-white flex justify-center items-center rounded-full p-2.5 w-10 h-10 mb-2 z-50 transition-all duration-500 delay-500`}
					>
						<Check
							className={`${
								step == 3 ? "scale-100" : "scale-0"
							} transition-all duration-500 delay-500`}
						/>
					</div>
					<p
						className={`${
							step == 3 ? "text-skblue" : "text-[#4478C7]"
						} text-sm transition-all duration-500 delay-500`}
					>
						Étape 3
					</p>
				</div>
			</div>
			{/* Start Form */}
			<form
				className="flex flex-col gap-4 text-neutral-600 overflow-hidden"
				onSubmit={handleSubmit}
			>
				<div
					className={`flex gap-10 w-[calc(300%+120px)] ${
						step == 1
							? "translate-x-0"
							: step == 2
							? "-translate-x-1/3"
							: step == 3
							? "-translate-x-2/3"
							: ""
					} transition-all duration-1000`}
				>
					{/* First Fields */}
					<div className="flex flex-col gap-4 w-[calc(33.3333%-40px)]">
						<div className="flex flex-col gap-1">
							<label className="px-5">Nom complet</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre Nom..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Numéro de téléphone</label>
							<input
								type="text"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre numéro..."
							/>
						</div>
					</div>
					{/* Second Fields */}
					<div className="flex flex-col gap-4 w-[calc(33.3333%-40px)]">
						<div className="flex flex-col gap-1">
							<label className="px-5">Lycée</label>
							<input
								type="text"
								name="school"
								value={formData.school}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre lycée..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Niveau</label>
							<input
								type="text"
								name="level"
								value={formData.level}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ex: 2ème année Bac SMA"
							/>
						</div>
					</div>
					{/* Third Fields */}
					<div className="flex flex-col gap-4 w-[calc(33.3333%-40px)]">
						<div className="flex flex-col gap-1">
							<label className="px-5">Adresse email</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre email..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Mot de passe</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre mot de passe..."
							/>
						</div>
					</div>
				</div>
				{/* Submit */}
				<div className="flex gap-5">
					<button
						type="button"
						onClick={() => {
							if (step > 1) setStep(step - 1);
						}}
						className={`${
							step == 1
								? "bg-neutral-300 hover:bg-neutral-400 text-white border-neutral-300"
								: "bg-white hover:bg-blue-100 text-skblue border-skblue"
						} py-2.5 mt-3 flex justify-center border gap-2 w-full ${
							step == 1 ? "cursor-not-allowed" : "cursor-pointer"
						}`}
						disabled={step === 1}
					>
						<CircleArrowLeft /> Précédent
					</button>
					{step === 3 ? (
						<button
							type="submit"
							disabled={loading}
							className="bg-skblue text-white py-2.5 mt-3 flex justify-center gap-2 hover:bg-[#003381] w-full cursor-pointer disabled:opacity-50"
						>
							{loading ? "Enregistrement..." : "S'inscrire"}
							<CircleArrowRight />
						</button>
					) : (
						<button
							type="button"
							onClick={handleNext}
							className="bg-skblue text-white py-2.5 mt-3 flex justify-center gap-2 hover:bg-[#003381] w-full cursor-pointer"
						>
							Suivant <CircleArrowRight />
						</button>
					)}
				</div>
			</form>
		</>
	);
}
