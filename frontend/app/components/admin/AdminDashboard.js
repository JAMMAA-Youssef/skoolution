import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User, BookOpen, Book, BarChart2, Plus, Trash2 } from "lucide-react";
import authService from "@/app/services/auth.service";
import useAuthGuard from "@/app/hooks/useAuthGuard";

export default function AdminDashboard() {
  useAuthGuard();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
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
    subjects: []
  });
  const [userCount, setUserCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);

  // Fetch users and subjects
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

  // Fetch statistics for dashboard
  const fetchStats = async () => {
    try {
      const users = await authService.getAllUsers();
      setUserCount(Array.isArray(users) ? users.length : 0);
    } catch {
      setUserCount(0);
    }
    try {
      const subjects = await authService.getAllSubjects();
      setSubjectCount(Array.isArray(subjects) ? subjects.length : 0);
    } catch {
      setSubjectCount(0);
    }
    try {
      const lessons = await authService.getAllLessons();
      setLessonCount(Array.isArray(lessons) ? lessons.length : 0);
    } catch {
      setLessonCount(0);
    }
  };

  useEffect(() => {
    if (tab === "users") {
      fetchUsers();
      fetchSubjects();
    }
    if (tab === "dashboard") {
      fetchStats();
    }
  }, [tab]);

  // Handlers for user actions (mocked for now)
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
      // Reset form fields when role changes
      setAddUserForm(prev => ({
        ...prev,
        role: value,
        level: '',
        school: '',
        subjects: []
      }));
    }
  };
  const handleSubjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setAddUserForm(prev => ({
      ...prev,
      subjects: selectedOptions
    }));
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    console.log('Submitting add user form with data:', addUserForm);
    try {
      await authService.addUser(addUserForm);
      setShowAddUser(false);
      setAddUserForm({
        username: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        school: '',
        level: '',
        subjects: []
      });
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      if (err.response) {
        console.error('Backend error response:', err.response.data);
      }
      setError("Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  return (
    <div className="w-full px-0 md:px-5 py-5 flex flex-col gap-8 bg-[#fafafa] min-h-screen">
      {tab === "dashboard" && (
        <>
          <h1 className="text-3xl font-bold text-skblue mb-2 font-poppins">Admin Dashboard</h1>
          {/* Statistics Section */}
          <section>
            <h2 className="text-xl font-semibold text-skblue mb-4 font-poppins">Statistiques</h2>
            <div className="grid grid-cols-1 min-[550px]:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow flex items-center gap-4">
                <div className="bg-skblue p-2 rounded-full flex items-center justify-center">
                  <User className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-skblack">{userCount}</p>
                  <p className="text-gray-500 text-sm">Utilisateurs</p>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow flex items-center gap-4">
                <div className="bg-[#135ea5] p-2 rounded-full flex items-center justify-center">
                  <BookOpen className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-skblack">{subjectCount}</p>
                  <p className="text-gray-500 text-sm">Sujets</p>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow flex items-center gap-4">
                <div className="bg-[#02874f] p-2 rounded-full flex items-center justify-center">
                  <Book className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-skblack">{lessonCount}</p>
                  <p className="text-gray-500 text-sm">Leçons</p>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow flex items-center gap-4">
                <div className="bg-[#6366F1] p-2 rounded-full flex items-center justify-center">
                  <BarChart2 className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-skblack">0</p>
                  <p className="text-gray-500 text-sm">Tests</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      {tab === "users" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-skblue font-poppins">Gestion des utilisateurs</h2>
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
                  </>
                )}

                {/* Teacher-specific fields */}
                {addUserRole === 'teacher' && (
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
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-neutral-200">
                      <td className="py-2 px-4">{user.username}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4 capitalize">{user.role}</td>
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
        </section>
      )}
      {tab === "subjects" && (
        <section>
          <h2 className="text-xl font-semibold text-skblue font-poppins mb-4">Gestion des sujets</h2>
          <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow text-gray-500">
            (CRUD des sujets ici)
          </div>
        </section>
      )}
      {tab === "lessons" && (
        <section>
          <h2 className="text-xl font-semibold text-skblue font-poppins mb-4">Gestion des leçons</h2>
          <div className="bg-white border border-neutral-200 rounded-xs p-4 shadow text-gray-500">
            (CRUD des leçons ici)
          </div>
        </section>
      )}
    </div>
  );
} 