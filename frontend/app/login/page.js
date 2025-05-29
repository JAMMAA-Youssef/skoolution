import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebook,
	faGoogle,
	faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import Login_form from "@/app/components/auth/Login_form";
import Link from "next/link";

export default function LoginPage() {
	return (
		<section className="grid grid-cols-12 min-h-screen">
			{/* Left Section */}
			<div className="relative bg-[url('/sk/login2.png')] bg-cover col-span-12 md:col-span-5 flex flex-col md:flex-row justify-center items-center text-neutral-100 min-h-[250px]">
				<div className="absolute w-full h-full bg-black/40"></div>
				<div className="w-fit flex flex-col gap-5 z-10">
					<p>Bienvenue à</p>
					{/* Logo */}
					<div className="font-poppins text-2xl sm:text-3xl flex items-center gap-1 tracking-wide font-semibold uppercase">
						<span className="flex justify-center items-center px-3.5 h-[40px] bg-white text-skblue">
							sk
						</span>
						<span className="text-white sm:inline-block">oolution</span>
					</div>
					<p>La platefome d'éducation n°1 au Maroc.</p>
				</div>
			</div>
			{/* Right Section */}
			<div className="col-span-12 md:col-span-7 flex flex-col justify-center gap-8 px-5 py-10  sm:px-10 lg:px-25 xl:px-40">
				{/* Title */}
				<div>
					<h1 className="text-5xl font-semibold mb-2">Se Connecter</h1>
					<p className="text-neutral-600">Veuillez entrer vos informations!</p>
				</div>
				{/* Login Form */}
				<Login_form />
				{/* Under The Form */}
				<div className="flex flex-col gap-8">
					{/* Ou */}
					<div className="relative flex ">
						<div className="absolute left-0 top-1/2 w-5/12 h-[1px] bg-skblack/60"></div>
						<p className="text-skblack/60 text-center w-full">Ou</p>
						<div className="absolute right-0 top-1/2 w-5/12 h-[1px] bg-skblack/60"></div>
					</div>
					{/* Brand Icons */}
					<div className="flex justify-center gap-3 md:gap-10">
						<div className="border border-neutral-400 py-3 px-10 w-fit cursor-pointer rounded-md group">
							<FontAwesomeIcon
								icon={faGoogle}
								className=" w-5 text-neutral-600 group-hover:text-red-600"
							/>
						</div>
						<div className="border border-neutral-400 py-3 px-10 w-fit cursor-pointer rounded-md group">
							<FontAwesomeIcon
								icon={faFacebook}
								className=" w-5.5 text-neutral-600 group-hover:text-blue-700"
							/>
						</div>
						<div className="border border-neutral-400 py-3 px-10 w-fit cursor-pointer rounded-md group">
							<FontAwesomeIcon
								icon={faTiktok}
								className=" w-5 text-neutral-600 group-hover:text-black"
							/>
						</div>
					</div>
					<p className="text-center text-sm text-neutral-600">
						Vous n'avez pas de compte ?{" "}
						<Link href="/register" className="text-skblue">
							Inscrivez-vous ici!
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
}
