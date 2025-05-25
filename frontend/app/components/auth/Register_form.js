"use client";
import { CircleArrowLeft, CircleArrowRight, Check, Scale } from "lucide-react";
import { useState } from "react";

export default function Register_form() {
	const [step, setStep] = useState(1);
	const handleSubmit = (e) => {
		e.preventDefault();
		 
	};
	return (
		<>
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
				onSubmit={(e) => {
					handleSubmit(e);
				}}
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
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre Nom..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Numéro de téléphone</label>
							<input
								type="text"
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre numéro..."
							/>
						</div>
					</div>
					{/* Second Fields */}
					<div className="flex flex-col  gap-4 w-[calc(33.3333%-40px)]">
						<div className="flex flex-col gap-1">
							<label className="px-5">Lycée</label>
							<input
								type="text"
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre Nom..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Niveau</label>
							<input
								type="text"
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre numéro..."
							/>
						</div>
					</div>
					{/* Third Fields */}
					<div className="flex flex-col  gap-4 w-[calc(33.3333%-40px)]">
						<div className="flex flex-col gap-1">
							<label className="px-5">Adresse email</label>
							<input
								type="text"
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre Nom..."
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="px-5">Mot de passe</label>
							<input
								type="password"
								className="border border-neutral-400 outline-0 py-2.5 pl-5"
								placeholder="Ecrivez votre numéro..."
							/>
						</div>
					</div>
				</div>
				{/* Submit */}
				<div className="flex gap-5">
					<button
						type="button"
						onClick={() => {
							step == 2 || step == 3 ? setStep(step - 1) : "";
						}}
						className={`${
							step == 1
								? "bg-neutral-300 hover:bg-neutral-400 text-white border-neutral-300"
								: "bg-white hover:bg-blue-100 text-skblue border-skblue	"
						} py-2.5 mt-3 flex justify-center border gap-2  w-full ${
							step == 1 ? "cursor-not-allowed" : "cursor-pointer"
						}`}
					>
						<CircleArrowLeft /> Précédent
					</button>
					<button
						type="button"
						onClick={() => {
							step == 1 || step == 2 ? setStep(step + 1) : "";
						}}
						className={`bg-skblue text-white py-2.5 mt-3 flex justify-center gap-2 hover:bg-[#003381] w-full cursor-pointer`}
					>
						{step == 3 ? "Register " : "Suivant "}
						<CircleArrowRight />
					</button>
				</div>
			</form>
		</>
	);
}
