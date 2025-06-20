"use client";
import { useState, useEffect } from "react";
import authService from "@/app/services/auth.service";
import useAuthGuard from "@/app/hooks/useAuthGuard";

export default function Settings() {
	useAuthGuard();
	const [userData, setUserData] = useState(null);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [city, setCity] = useState("");
	const [lycee, setLycee] = useState("");
	const [niveau, setNiveau] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");
	const [langue, setLangue] = useState("");
	const [levels, setLevels] = useState([]);
	const [newLevel, setNewLevel] = useState("");
	const [profilePicture, setProfilePicture] = useState("");
	const [profilePicturePreview, setProfilePicturePreview] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const BACKEND_URL = 'http://localhost:3000';

	useEffect(() => {
		const currentUser = authService.getCurrentUser();
		console.log('Current user data in Settings:', currentUser);
		if (currentUser) {
			setUserData(currentUser);
			setFullName(currentUser.username || '');
			setEmail(currentUser.email || '');
			setPhone(currentUser.phone || '');
			setLycee(currentUser.school || '');
			setNiveau(currentUser.levels && currentUser.levels[0] ? currentUser.levels[0] : '');
			setCity(currentUser.city || '');
			setLangue('');
			setOldPassword("");
			setNewPassword("");
			setProfilePicture(currentUser.profilePicture || "");
			let normalizedProfilePicture = '/sk/default-profile.png';
			if (currentUser.profilePicture && currentUser.profilePicture !== '/sk/default-profile.png' && currentUser.profilePicture !== '') {
				if (currentUser.profilePicture.startsWith('http')) {
					normalizedProfilePicture = currentUser.profilePicture;
				} else if (currentUser.profilePicture.startsWith('/uploads/')) {
					normalizedProfilePicture = BACKEND_URL + currentUser.profilePicture;
				} else {
					normalizedProfilePicture = BACKEND_URL + '/uploads/' + currentUser.profilePicture.replace(/^\/+/, '');
				}
			}
			setProfilePicturePreview(normalizedProfilePicture);
			if (currentUser.role === 'teacher') {
				setLevels(currentUser.levels || []);
			}
		}
	}, []);

	useEffect(() => {
		console.log('oldPassword value:', oldPassword);
	}, [oldPassword]);

	const handleSave = async (e) => {
		e.preventDefault();
		setPasswordMessage("");
		setSuccessMessage("");
		setLoading(true);
		// 1. Handle password change if needed
		if (newPassword) {
			if (!oldPassword) {
				setPasswordMessage("Veuillez entrer l'ancien mot de passe.");
				setLoading(false);
				return;
			}
			try {
				console.log('Attempting password change...');
				await authService.changePassword({ oldPassword, newPassword });
				setPasswordMessage("Mot de passe mis à jour avec succès.");
				setOldPassword("");
				setNewPassword("");
				console.log('Password changed successfully');
			} catch (err) {
				setPasswordMessage("Ancien mot de passe incorrect ou erreur serveur.");
				console.error('Password change error:', err);
				setLoading(false);
				return; // Stop if password change failed
			}
		}
		// 2. Prepare FormData for profile update
		const formData = new FormData();
		formData.append('username', fullName);
		formData.append('email', email);
		formData.append('phone', phone);
		formData.append('school', lycee);
		formData.append('city', city);
		if (userData.role === 'student') {
			formData.append('level', niveau);
		}
		if (userData.role === 'teacher') {
			levels.forEach((lvl, idx) => formData.append(`levels[${idx}]`, lvl));
		}
		if (profilePicture && profilePicture instanceof File) {
			formData.append('profilePicture', profilePicture);
		}
		// Debug: log FormData content
		for (let pair of formData.entries()) {
			console.log('FormData:', pair[0], pair[1]);
		}
		try {
			console.log('Attempting profile update...');
			await authService.updateProfile(formData);
			setSuccessMessage("Profil mis à jour avec succès.");
			setTimeout(() => setSuccessMessage(""), 3000);
			// Fetch latest user data from backend and update localStorage/UI
			const updatedUser = await authService.getCurrentUserFromBackend();
			if (updatedUser) {
				localStorage.setItem('userData', JSON.stringify(updatedUser));
				setUserData(updatedUser);
				setFullName(updatedUser.username || '');
				setEmail(updatedUser.email || '');
				setPhone(updatedUser.phone || '');
				setLycee(updatedUser.school || '');
				setNiveau(updatedUser.levels && updatedUser.levels[0] ? updatedUser.levels[0] : '');
				setCity(updatedUser.city || '');
				setProfilePicture(updatedUser.profilePicture || "");
				let normalizedProfilePicture2 = '/sk/default-profile.png';
				if (updatedUser.profilePicture && updatedUser.profilePicture !== '/sk/default-profile.png' && updatedUser.profilePicture !== '') {
					if (updatedUser.profilePicture.startsWith('http')) {
						normalizedProfilePicture2 = updatedUser.profilePicture;
					} else if (updatedUser.profilePicture.startsWith('/uploads/')) {
						normalizedProfilePicture2 = BACKEND_URL + updatedUser.profilePicture;
					} else {
						normalizedProfilePicture2 = BACKEND_URL + '/uploads/' + updatedUser.profilePicture.replace(/^\/+/, '');
					}
				}
				setProfilePicturePreview(normalizedProfilePicture2);
				if (updatedUser.role === 'teacher') {
					setLevels(updatedUser.levels || []);
				}
				// Dispatch a custom event to notify other components (like Header) to refresh user data
				window.dispatchEvent(new Event('userDataUpdated'));
			} else {
				setPasswordMessage("Erreur lors de la mise à jour du profil.");
			}
		} catch (err) {
			console.error('Profile update error:', err);
			setPasswordMessage("Erreur lors de la mise à jour du profil.");
		}
		setLoading(false);
	};

	const handleAddLevel = () => {
		console.log('DEBUG: handleAddLevel called with newLevel:', newLevel);
		if (newLevel.trim() && !levels.includes(newLevel.trim())) {
			setLevels([...levels, newLevel.trim()]);
			setNewLevel("");
		}
	};

	const handleRemoveLevel = (levelToRemove) => {
		console.log('DEBUG: handleRemoveLevel called with levelToRemove:', levelToRemove);
		setLevels(levels.filter(lvl => lvl !== levelToRemove));
	};

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePicture(file);
			setProfilePicturePreview(URL.createObjectURL(file));
		}
	};

	console.log('Settings userData:', userData);
	console.log('Settings computed profilePicturePreview:', profilePicturePreview);
	console.log('DEBUG: userData.levels:', userData && userData.levels);
	console.log('DEBUG: levels state:', levels);
	console.log('DEBUG: newLevel:', newLevel);
	console.log('DEBUG: userData.city:', userData && userData.city);

	if (!userData) {
		return <div>Loading or user not logged in...</div>;
	}

	return (
		<section className="px-0 md:px-5 py-5 flex flex-col gap-6">
			{/* Title + Cards */}
			<div className="flex flex-col gap-6">
				{/* Titles */}
				<div className="flex flex-col gap-1.5">
					<h1 className="font-bold text-3xl">Profile settings</h1>
					<p className="text-neutral-500 text-[13px] sm:text-sm">
						Gère ton compte et personnalise ton expérience.
					</p>
				</div>
				{/* Fields */}
				<section className="flex flex-col gap-8 bg-white px-3 sm:px-6 py-8">
					{/* Title */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-3">
						<div className="flex flex-col justify-center items-center text-center sm:text-start sm:flex-row gap-3">
							<label htmlFor="profilePictureInput" className="cursor-pointer">
								<img 
									src={profilePicturePreview || "/sk/default-profile.png"} 
									className="w-22" 
									alt="Profile Picture" 
									onError={e => {
										if (!e.target.src.endsWith("/sk/default-profile.png")) {
											e.target.onerror = null; // Prevent infinite loop
											e.target.src = "/sk/default-profile.png";
										}
									}}
								/>
								<input
									id="profilePictureInput"
									type="file"
									accept="image/*"
									style={{ display: 'none' }}
									onChange={handleProfilePictureChange}
								/>
								<div className="text-xs text-skblue mt-1">Changer la photo</div>
							</label>
							<div className="flex flex-col justify-center gap-2">
								<p className="font-[500]">{fullName}</p>
								<p className="text-sm text-neutral-400">{email}</p>
							</div>
						</div>
					</div>
					{/* Form */}
					<form className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4" onSubmit={handleSave} autoComplete="off">
						{/* Field 1 */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">Nom complet</label>
							<input
								type="text"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={fullName}
								onChange={(e) => {
									setFullName(e.target.value);
								}}
							/>
						</div>
						{/* Field 2 */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">Adresse Email</label>
							<input
								type="text"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
								}}
							/>
						</div>
						{/* Field 3 */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">
								Numéro de téléphone
							</label>
							<input
								type="text"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={phone}
								onChange={(e) => {
									setPhone(e.target.value);
								}}
							/>
						</div>
						{/* Field 4 */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">Ville</label>
							<input
								type="text"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={city}
								onChange={(e) => {
									setCity(e.target.value);
								}}
							/>
						</div>
						{/* For student: Lycée and Niveau */}
						{userData.role === 'student' && (
							<>
								<div className="flex flex-col gap-1">
									<label className="px-5 text-neutral-600">Lycée</label>
									<input
										type="text"
										className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
										value={lycee}
										onChange={(e) => setLycee(e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="px-5 text-neutral-600">Niveau</label>
									<input
										type="text"
										className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
										value={niveau}
										onChange={(e) => setNiveau(e.target.value)}
									/>
								</div>
							</>
						)}
						{/* For teacher: Multi-levels */}
						{userData.role === 'teacher' && (
							<div className="flex flex-col gap-1 col-span-2">
								<label className="px-5 text-neutral-600">Niveaux enseignés</label>
								<div className="flex flex-wrap gap-2 mb-2">
									{levels.map((lvl, idx) => (
										<span key={idx} className="bg-skblue text-white px-3 py-1 rounded-full flex items-center gap-2">
											{lvl}
											<button type="button" onClick={() => handleRemoveLevel(lvl)} className="ml-1 text-white hover:text-red-300">&times;</button>
										</span>
									))}
								</div>
								<div className="flex gap-2">
									<input
										type="text"
										className="border border-neutral-200 bg-neutral-100 text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs flex-1"
										value={newLevel}
										onChange={(e) => setNewLevel(e.target.value)}
										placeholder="Ajouter un niveau (ex: 2ème année Bac)"
									/>
									<button type="button" onClick={handleAddLevel} className="bg-skblue text-white px-4 py-2 rounded hover:bg-blue-700">Ajouter</button>
								</div>
							</div>
						)}
						{/* Hidden dummy password field to trick autofill */}
						<input type="password" style={{ display: 'none' }} />
						{/* Field 7: Ancien mot de passe */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">Ancien mot de passe</label>
							<input
								type="password"
								name="notapasswordfield"
								autoComplete="off"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={oldPassword}
								onChange={(e) => {
									setOldPassword(e.target.value);
									console.log('oldPassword changed:', e.target.value);
								}}
								onFocus={() => console.log('Old password field focused')}
							/>
						</div>
						{/* Field 8: Nouveau mot de passe */}
						<div className="flex flex-col gap-1">
							<label className="px-5 text-neutral-600">Nouveau mot de passe</label>
							<input
								type="password"
								name="newPassword"
								autoComplete="off"
								className="border border-neutral-200 bg-neutral-100  text-neutral-400 focus:text-neutral-600 outline-0 py-2.5 pl-5 rounded-xs"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>
						<button
							type="submit"
							className="hidden sm:inline-block text-center bg-skblue text-white hover:bg-white hover:text-skblue border border-skblue px-3.5 py-2 rounded-sm transition-all duration-300 cursor-pointer"
						>
							Enregistrer
						</button>
						{passwordMessage && (
							<div className="col-span-2 text-center text-red-500 mt-2">{passwordMessage}</div>
						)}
					</form>
					<button className="w-full sm:w-fit bg-red-100 hover:bg-red-600 hover:text-white text-red-600 px-5 py-2 rounded-xs font-[500] -mt-4 sm:mt-4 transition-all duration-300 cursor-pointer">
						Supprimer le compte
					</button>
					{successMessage && (
						<div className="col-span-2 flex items-center justify-center bg-green-100 text-green-700 rounded-md px-4 py-2 mb-2 font-semibold gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
							{successMessage}
						</div>
					)}
				</section>
			</div>
		</section>
	);
}
