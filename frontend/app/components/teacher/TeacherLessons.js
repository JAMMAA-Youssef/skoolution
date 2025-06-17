import React, { useEffect, useState } from "react";
import axios from "axios";
import authService from "@/app/services/auth.service";
import { UploadCloud, FileText, Video, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherLessons() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [selectedCompetence, setSelectedCompetence] = useState("");
  const [filteredSousCompetences, setFilteredSousCompetences] = useState([]);
  const [selectedSousCompetence, setSelectedSousCompetence] = useState("");
  const [format, setFormat] = useState("pdf");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('ajouter');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Fetch subjects (domaines)
    axios.get("/api/subjects")
      .then(res => {
        setSubjects(res.data);
        console.log('Fetched subjects:', res.data);
      })
      .catch(err => {
        console.error('Error fetching subjects:', err);
      });
    // Fetch competencies
    axios.get("/api/competencies")
      .then(res => {
        setCompetencies(res.data);
        console.log('Fetched competencies:', res.data);
      })
      .catch(err => {
        console.error('Error fetching competencies:', err);
      });
    // Fetch lessons
    axios.get("/api/lessons")
      .then(res => {
        setLessons(res.data);
        console.log('Fetched lessons:', res.data);
      })
      .catch(err => {
        console.error('Error fetching lessons:', err);
      });
  }, []);

  useEffect(() => {
    // Filter competencies by selected subject (domaine) using ObjectId comparison
    if (selectedSubject) {
      const filtered = competencies.filter(c => String(c.domaine) === String(selectedSubject));
      setFilteredCompetencies(filtered);
      setSelectedCompetence("");
      setFilteredSousCompetences([]);
      setSelectedSousCompetence("");
      console.log('Filtered competencies:', filtered);
    } else {
      setFilteredCompetencies([]);
      setSelectedCompetence("");
      setFilteredSousCompetences([]);
      setSelectedSousCompetence("");
    }
  }, [selectedSubject, competencies]);

  useEffect(() => {
    // Filter sous-competences by selected competence
    if (selectedCompetence) {
      const filteredSous = filteredCompetencies.filter(c => c.competence === selectedCompetence);
      setFilteredSousCompetences(filteredSous);
      setSelectedSousCompetence("");
      console.log('Filtered sous-competences:', filteredSous);
    } else {
      setFilteredSousCompetences([]);
      setSelectedSousCompetence("");
    }
  }, [selectedCompetence, filteredCompetencies]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handlePdfChange = e => {
    setPdfFiles(Array.from(e.target.files));
  };

  const handleVideoChange = e => {
    setVideoFiles(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("content", form.content);
      data.append("duration", form.duration);
      data.append("subject", selectedSubject);
      const selectedCompetenceObj = filteredCompetencies.find(c => c.competence === selectedCompetence);
      const selectedSousCompetenceObj = filteredSousCompetences.find(c => c.sousCompetence === selectedSousCompetence && c.competence === selectedCompetence);
      if (selectedCompetenceObj) data.append("competence", selectedCompetenceObj._id);
      if (selectedSousCompetenceObj) data.append("sousCompetence", selectedSousCompetenceObj._id);
      if (currentUser?._id) data.append("teacher", currentUser._id);
      if (currentUser?.username) data.append("teacherName", currentUser.username);
      pdfFiles.forEach(file => data.append("pdfs", file));
      videoFiles.forEach(file => data.append("videos", file));
      await axios.post("/api/lessons", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Leçon ajoutée avec succès !");
      setForm({ title: "", content: "", duration: "" });
      setSelectedSubject("");
      setSelectedCompetence("");
      setSelectedSousCompetence("");
      setPdfFiles([]);
      setVideoFiles([]);
    } catch (err) {
      setError("Erreur lors de l'ajout de la leçon.");
      console.error('Erreur lors de l\'ajout de la leçon:', err);
      if (err.response) {
        console.error('Backend response:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/lessons/${lessonToDelete._id}`);
      setSuccess("Leçon supprimée avec succès !");
      // Refresh lessons list
      const res = await axios.get("/api/lessons");
      setLessons(res.data);
    } catch (err) {
      setError("Erreur lors de la suppression de la leçon.");
      console.error('Error deleting lesson:', err);
    }
    setDeleteModalOpen(false);
    setLessonToDelete(null);
  };

  const handleEditClick = (lesson) => {
    router.push(`/dashboard/lessons/edit/${lesson._id}`);
  };

  return (
    <>
      <section className="px-0 md:px-5 py-5 flex flex-col gap-6">
        {/* Title + Segmented Control */}
        <div className="flex flex-col gap-1.5 mb-2">
          <h1 className="font-bold text-3xl">Gestion des leçons</h1>
          <p className="text-neutral-500 text-[13px] sm:text-sm">
            Ajoutez et gérez vos leçons facilement.
          </p>
        </div>
        {/* Segmented control styled like /subjects */}
        <div className="hidden min-[500px]:flex gap-2 mb-5 justify-center">
          <div
            className={`min-w-[160px] px-6 cursor-pointer transition-all duration-300 rounded-xs text-center py-2 whitespace-nowrap ${
              activeTab === 'ajouter'
                ? 'bg-skblue text-white'
                : 'bg-white border border-neutral-200 text-skblue hover:text-white hover:bg-skblue'
            }`}
            onClick={() => setActiveTab('ajouter')}
          >
            Ajouter une leçon
          </div>
          <div
            className={`min-w-[160px] px-6 cursor-pointer transition-all duration-300 rounded-xs text-center py-2 whitespace-nowrap ${
              activeTab === 'liste'
                ? 'bg-skblue text-white'
                : 'bg-white border border-neutral-200 text-skblue hover:text-white hover:bg-skblue'
            }`}
            onClick={() => setActiveTab('liste')}
          >
            Liste des leçons
          </div>
        </div>
        {/* Main content */}
        {activeTab === 'ajouter' ? (
          <section className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-skblue">Ajouter une leçon</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 font-semibold">Domaine</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un domaine</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Compétence</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedCompetence}
                  onChange={e => setSelectedCompetence(e.target.value)}
                  required
                  disabled={!selectedSubject}
                >
                  <option value="">Sélectionner une compétence</option>
                  {[...new Set(filteredCompetencies.map(c => c.competence))].map(competence => (
                    <option key={competence} value={competence}>{competence}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Sous-compétence</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedSousCompetence}
                  onChange={e => setSelectedSousCompetence(e.target.value)}
                  required
                  disabled={!selectedCompetence}
                >
                  <option value="">Sélectionner une sous-compétence</option>
                  {filteredSousCompetences.map(c => (
                    <option key={c._id} value={c.sousCompetence}>{c.sousCompetence}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Titre de la leçon</label>
                <input
                  type="text"
                  name="title"
                  className="w-full border rounded p-2"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Contenu</label>
                <textarea
                  name="content"
                  className="w-full border rounded p-2"
                  value={form.content}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Durée (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  className="w-full border rounded p-2"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              {/* PDF files input with modern style */}
              <div>
                <label className="block mb-1 font-semibold">Fichiers PDF</label>
                <div className="relative flex items-center">
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handlePdfChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-skblue text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                    onClick={() => document.getElementById('pdf-upload').click()}
                  >
                    <UploadCloud size={18} /> Choisir des fichiers PDF
                  </button>
                </div>
                <p className="text-xs text-gray-500">Vous pouvez ajouter plusieurs fichiers PDF pour cette leçon.</p>
                {pdfFiles.length > 0 && (
                  <ul className="mt-2 text-sm text-skblue">
                    {pdfFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <FileText size={16} /> {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Video files input with modern style */}
              <div>
                <label className="block mb-1 font-semibold">Fichiers vidéo</label>
                <div className="relative flex items-center">
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-skblue text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                    onClick={() => document.getElementById('video-upload').click()}
                  >
                    <UploadCloud size={18} /> Choisir des vidéos
                  </button>
                </div>
                <p className="text-xs text-gray-500">Vous pouvez ajouter plusieurs vidéos pour cette leçon.</p>
                {videoFiles.length > 0 && (
                  <ul className="mt-2 text-sm text-skblue">
                    {videoFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Video size={16} /> {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="bg-skblue text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Ajout en cours..." : "Ajouter la leçon"}
              </button>
              {success && <p className="text-green-600 font-semibold">{success}</p>}
              {error && <p className="text-red-600 font-semibold">{error}</p>}
            </form>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto mt-10">
            <h3 className="text-xl font-bold mb-4 text-skblue">Liste des leçons</h3>
            <div className="bg-white rounded-lg shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="w-[25%] px-4 py-3 text-left text-sm font-medium text-gray-600">Titre</th>
                    <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-600">Domaine</th>
                    <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-600">Compétence</th>
                    <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-600">Sous-compétence</th>
                    <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-600">Enseignant</th>
                    <th className="w-[10%] px-4 py-3 text-left text-sm font-medium text-gray-600">Fichiers</th>
                    <th className="w-[5%] px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Aucune leçon trouvée.
                      </td>
                    </tr>
                  ) : (
                    lessons.map(lesson => (
                      <tr key={lesson._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 truncate" title={lesson.title}>
                          {lesson.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={lesson.subject?.name}>
                          {lesson.subject?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={lesson.competence?.competence}>
                          {lesson.competence?.competence || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={lesson.sousCompetence?.sousCompetence}>
                          {lesson.sousCompetence?.sousCompetence || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={lesson.teacher?.username || lesson.teacherName}>
                          {lesson.teacher?.username || lesson.teacherName || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {lesson.fileUrls && lesson.fileUrls.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {lesson.fileUrls.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={`http://localhost:3000/${file.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-skblue/10 text-skblue hover:bg-skblue/20 transition-colors"
                                >
                                  {file.type.toUpperCase()}
                                </a>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditClick(lesson)}
                              className="p-1 text-skblue hover:bg-skblue/10 rounded transition-colors"
                              title="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(lesson)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-skblue">Confirmer la suppression</h3>
              <p className="mb-6">
                Êtes-vous sûr de vouloir supprimer la leçon "{lessonToDelete?.title}" ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
} 