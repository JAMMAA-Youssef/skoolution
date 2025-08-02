import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Building2, DollarSign, Users, BarChart2, Star, Activity, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import authService from "@/app/services/auth.service";
import useAuthGuard from "@/app/hooks/useAuthGuard";

// Mock data for progress-style dashboard
const stats = [
  { title: 'Lessons Completed', value: 32, icon: <BookOpen className="text-skblue" />, iconBg: 'bg-blue-100' },
  { title: 'Awards', value: '5+', icon: <Award className="text-yellow-500" />, iconBg: 'bg-yellow-100' },
  { title: 'Subjects', value: '4', icon: <Building2 className="text-green-600" />, iconBg: 'bg-green-100' },
  { title: 'Points', value: '1200', icon: <DollarSign className="text-orange-500" />, iconBg: 'bg-orange-100' },
];

const overviewData = [
  { name: 'Jan', Progress: 40, Target: 50 },
  { name: 'Feb', Progress: 55, Target: 60 },
  { name: 'Mar', Progress: 70, Target: 75 },
  { name: 'Apr', Progress: 60, Target: 65 },
  { name: 'May', Progress: 50, Target: 55 },
  { name: 'Jun', Progress: 65, Target: 70 },
  { name: 'Jul', Progress: 45, Target: 50 },
];

const studentsData = [
  { name: 'Jan', Girls: 200, Boys: 180 },
  { name: 'Feb', Girls: 300, Boys: 250 },
  { name: 'Mar', Girls: 400, Boys: 350 },
  { name: 'Apr', Girls: 350, Boys: 300 },
  { name: 'May', Girls: 300, Boys: 250 },
  { name: 'Jun', Girls: 450, Boys: 400 },
  { name: 'Jul', Girls: 380, Boys: 320 },
];

const starStudents = [
  { id: 'STU001', name: 'Amina El Fassi', marks: 1185, percentage: '98%', year: 2024 },
  { id: 'STU002', name: 'Youssef Benali', marks: 1150, percentage: '96%', year: 2024 },
  { id: 'STU003', name: 'Sara Amrani', marks: 1120, percentage: '94%', year: 2024 },
];

const studentActivity = [
  { time: '1 Day ago', text: '1st place in "Math Contest"', details: 'Amina El Fassi won 1st place in "Math Contest"' },
  { time: '2 Days ago', text: 'Completed "Physics Chapter 3"', details: 'Youssef Benali completed "Physics Chapter 3"' },
  { time: '3 Days ago', text: 'Top scorer in "Chemistry Quiz"', details: 'Sara Amrani scored highest in "Chemistry Quiz"' },
];

const StatCard = ({ title, value, icon, iconBg }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBg}`}>{icon}</div>
  </div>
);

export default function AdminDashboard({ tab }) {
  useAuthGuard();

  // --- User management state (restored) ---
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [addUserRole, setAddUserRole] = useState('student');
  const [addUserForm, setAddUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    school: '',
    level: '',
    sex: '',
    subjects: [],
    levels: [],
  });
  const [teacherLevels, setTeacherLevels] = useState([]);
  const [newTeacherLevel, setNewTeacherLevel] = useState("");

  // Fetch users and subjects for user management
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await authService.getAllSubjects();
      setSubjects(data);
    } catch (err) {
      setError("Erreur lors du chargement des sujets.");
    }
  };

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
      fetchSubjects();
    }
  }, [tab]);

  // Handlers for user actions
  const handleDeleteUser = async (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    try {
      await authService.deleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setError("Erreur lors de la suppression de l'utilisateur.");
      setConfirmDeleteId(null);
    }
  };
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };
  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'role') {
      setAddUserRole(value);
      setAddUserForm(prev => ({
        ...prev,
        role: value,
        level: '',
        school: '',
        sex: '',
        subjects: [],
        levels: [],
      }));
      setTeacherLevels([]);
      setNewTeacherLevel("");
    }
  };
  const handleSubjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setAddUserForm(prev => ({
      ...prev,
      subjects: selectedOptions
    }));
  };
  const handleAddTeacherLevel = () => {
    if (newTeacherLevel.trim() && !teacherLevels.includes(newTeacherLevel.trim())) {
      setTeacherLevels([...teacherLevels, newTeacherLevel.trim()]);
      setAddUserForm(prev => ({ ...prev, levels: [...(prev.levels || []), newTeacherLevel.trim()] }));
      setNewTeacherLevel("");
    }
  };
  const handleRemoveTeacherLevel = (levelToRemove) => {
    setTeacherLevels(teacherLevels.filter(lvl => lvl !== levelToRemove));
    setAddUserForm(prev => ({ ...prev, levels: (prev.levels || []).filter(lvl => lvl !== levelToRemove) }));
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    let formToSend = { ...addUserForm };
    if (addUserRole === 'teacher') {
      formToSend.levels = teacherLevels;
    }
    // Remove sex if empty string
    if (!formToSend.sex) {
      delete formToSend.sex;
    }
    try {
      await authService.addUser(formToSend);
      setShowAddUser(false);
      setAddUserForm({
        username: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        school: '',
        level: '',
        sex: '',
        subjects: [],
        levels: [],
      });
      setTeacherLevels([]);
      setNewTeacherLevel("");
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  // --- Conditional rendering ---
  if (tab === 'users') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
          <button
            className="flex items-center gap-2 bg-skblue text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setShowAddUser((v) => !v)}
          >
            <Plus size={18} /> Ajouter un utilisateur
          </button>
        </div>
        {/* Add User Form */}
        {showAddUser && (
          <form
            className="bg-white border border-neutral-200 rounded-xs p-4 shadow mb-6 flex flex-col gap-4"
            onSubmit={handleAddUser}
          >
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                name="username"
                value={addUserForm.username}
                onChange={handleAddUserChange}
                placeholder="Nom d'utilisateur"
                className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                required
              />
              <input
                type="email"
                name="email"
                value={addUserForm.email}
                onChange={handleAddUserChange}
                placeholder="Email"
                className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                required
              />
              <input
                type="password"
                name="password"
                value={addUserForm.password}
                onChange={handleAddUserChange}
                placeholder="Mot de passe"
                className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                required
              />
              <select
                name="role"
                value={addUserForm.role}
                onChange={handleAddUserChange}
                className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                required
              >
                <option value="student">Étudiant</option>
                <option value="teacher">Enseignant</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                name="phone"
                value={addUserForm.phone}
                onChange={handleAddUserChange}
                placeholder="Téléphone"
                className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
              />
              {/* Student-specific fields */}
              {addUserRole === 'student' && (
                <>
                  <input
                    type="text"
                    name="school"
                    value={addUserForm.school}
                    onChange={handleAddUserChange}
                    placeholder="École"
                    className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                    required
                  />
                  <input
                    type="text"
                    name="level"
                    value={addUserForm.level}
                    onChange={handleAddUserChange}
                    placeholder="Niveau (ex: 2ème année Bac SMA)"
                    className="border border-neutral-300 rounded px-3 py-2 w-full md:w-1/2"
                    required
                  />
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <label className="text-sm">Sexe:</label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="sex" value="male" checked={addUserForm.sex === 'male'} onChange={handleAddUserChange} /> Homme
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="sex" value="female" checked={addUserForm.sex === 'female'} onChange={handleAddUserChange} /> Femme
                    </label>
                  </div>
                </>
              )}
              {/* Teacher-specific fields */}
              {addUserRole === 'teacher' && (
                <>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveaux enseignés
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {teacherLevels.map((lvl, idx) => (
                        <span key={idx} className="bg-skblue text-white px-3 py-1 rounded-full flex items-center gap-2">
                          {lvl}
                          <button type="button" onClick={() => handleRemoveTeacherLevel(lvl)} className="ml-1 text-white hover:text-red-300">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="border border-neutral-300 rounded px-3 py-2 flex-1"
                        value={newTeacherLevel}
                        onChange={e => setNewTeacherLevel(e.target.value)}
                        placeholder="Ajouter un niveau (ex: 2ème année Bac)"
                      />
                      <button type="button" onClick={handleAddTeacherLevel} className="bg-skblue text-white px-4 py-2 rounded hover:bg-blue-700">Ajouter</button>
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sujets enseignés
                    </label>
                    <select
                      multiple
                      name="subjects"
                      value={addUserForm.subjects}
                      onChange={handleSubjectChange}
                      className="border border-neutral-300 rounded px-3 py-2 w-full"
                      size={4}
                      required
                    >
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs sujets
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-skblue text-white rounded hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}
        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-skblue">Chargement des utilisateurs...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <table className="min-w-full bg-white border border-neutral-200 rounded-xs shadow">
              <thead>
                <tr className="bg-skblue text-white">
                  <th className="py-2 px-4 text-left">Nom d'utilisateur</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Rôle</th>
                  <th className="py-2 px-4 text-left">Sexe</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-neutral-200">
                    <td className="py-2 px-4">{user.username}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4 capitalize">{user.role}</td>
                    <td className="py-2 px-4 capitalize">{user.sex || '-'}</td>
                    <td className="py-2 px-4">
                      <button
                        className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Confirmation Dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm border border-neutral-200">
              <h3 className="text-lg font-semibold mb-4 text-skblue">Confirmer la suppression</h3>
              <p className="mb-6 text-neutral-700">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded border border-neutral-300 text-skblue bg-white hover:bg-blue-50"
                  onClick={cancelDelete}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Static progress dashboard for /dashboard ---
  return (
    <div className="p-4 md:p-8 bg-[#fafafa] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome Admin!</h1>
        <p className="text-gray-500">Here is a static progress overview (demo).</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Overview</h2>
            <div className="flex gap-2 text-xs">
              <span className="text-skblue">Progress</span>
              <span className="text-gray-400">Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Progress" stroke="#054bb4" strokeWidth={2} />
              <Line type="monotone" dataKey="Target" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Number of Students</h2>
            <div className="flex gap-2 text-xs">
              <span className="text-skblue">Girls</span>
              <span className="text-gray-400">Boys</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={studentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Girls" fill="#82ca9d" />
              <Bar dataKey="Boys" fill="#054bb4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Star Students & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-lg mb-2">Star Students</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-skblue text-white">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Marks</th>
                <th className="py-2 px-4 text-left">Percentage</th>
                <th className="py-2 px-4 text-left">Year</th>
              </tr>
            </thead>
            <tbody>
              {starStudents.map((student) => (
                <tr key={student.id} className="border-b border-neutral-200">
                  <td className="py-2 px-4">{student.id}</td>
                  <td className="py-2 px-4">{student.name}</td>
                  <td className="py-2 px-4">{student.marks}</td>
                  <td className="py-2 px-4">{student.percentage}</td>
                  <td className="py-2 px-4">{student.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-lg mb-2">Student Activity</h2>
          <ul className="divide-y divide-gray-200">
            {studentActivity.map((activity, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="text-skblue" size={20} />
                  <div>
                    <div className="font-medium">{activity.text}</div>
                    <div className="text-gray-500 text-xs">{activity.details}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 