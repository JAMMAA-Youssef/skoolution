import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, BookOpen, Users, Award, Plus, Trash2 } from 'lucide-react';
import authService from "@/app/services/auth.service";
import useAuthGuard from "@/app/hooks/useAuthGuard";

// Mock data generation functions
const generateChartData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  for (const month of months) {
    data.push({
      name: month,
      Teacher: Math.floor(Math.random() * 50) + 10,
      Student: Math.floor(Math.random() * 80) + 20,
      Girls: Math.floor(Math.random() * 400) + 100,
      Boys: Math.floor(Math.random() * 400) + 100,
    });
  }
  return data;
};

const generateStarStudents = (users) => {
  if (!users || users.length === 0) return [];
  return users
    .slice(0, 3)
    .map((user, index) => ({
      id: user._id.slice(-6).toUpperCase(),
      name: user.username,
      marks: Math.floor(Math.random() * 200) + 1000,
      percentage: `${Math.floor(Math.random() * 10) + 90}%`,
      year: new Date().getFullYear() - index,
    }));
};

const generateStudentActivity = (users) => {
    if (!users || users.length === 0) return [];
    const activities = ["Chess", "Drawing", "Science", "Math Contest", "Spelling Bee"];
    return users.slice(0, 3).map((user, index) => ({
        time: `${index + 1} Day ago`,
        text: `1st place in "${activities[index % activities.length]}"`,
        details: `${user.username} won 1st place in "${activities[index % activities.length]}"`,
    }));
};

const StatCard = ({ title, value, icon, iconBgColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${iconBgColor}`}>
      {icon}
    </div>
  </div>
);

export default function AdminDashboard({ tab }) {
  useAuthGuard();

  const [userCount, setUserCount] = useState(null);
  const [subjectCount, setSubjectCount] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [starStudents, setStarStudents] = useState([]);
  const [studentActivity, setStudentActivity] = useState([]);

  // User management state
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
    subjects: []
  });
  const [teacherLevels, setTeacherLevels] = useState([]);
  const [newTeacherLevel, setNewTeacherLevel] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const users = await authService.getAllUsers();
        const userArray = Array.isArray(users) ? users : [];
        setUserCount(userArray.length);

        const subjects = await authService.getAllSubjects();
        setSubjectCount(Array.isArray(subjects) ? subjects.length : 0);

        const stats = await authService.getRegistrationStats();
        setChartData(stats);

        const starStudentsData = await authService.getStarStudents();
        setStarStudents(starStudentsData);

        setStudentActivity(generateStudentActivity(userArray));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setUserCount(0);
        setSubjectCount(0);
        setChartData(generateChartData());
        setStarStudents([]);
        setStudentActivity([]);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome Admin!</h1>
        <p className="text-sm text-gray-500">Home / Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Students" value={userCount !== null ? userCount : '...'} icon={<Users className="text-orange-500" />} iconBgColor="bg-orange-100" />
        <StatCard title="Awards" value="50+" icon={<Award className="text-yellow-500" />} iconBgColor="bg-yellow-100" />
        <StatCard title="Department" value={subjectCount !== null ? subjectCount : '...'} icon={<BookOpen className="text-blue-500" />} iconBgColor="bg-blue-100" />
        <StatCard title="Revenue" value="$505" icon={<DollarSign className="text-green-500" />} iconBgColor="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overview Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Teacher" stroke="#8884d8" />
              <Line type="monotone" dataKey="Student" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Number of Students Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Number of Students</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Boys" fill="#8884d8" />
              <Bar dataKey="Girls" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Students Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Star Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody>
                {starStudents.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.marks}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.percentage}</td>
                    <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Student Activity</h2>
          <ul>
            {studentActivity.map((activity, index) => (
              <li key={index} className="flex items-start mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center mr-4">
                  <Award className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">{activity.text}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <p className="text-xs text-gray-400 ml-auto whitespace-nowrap">{activity.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 