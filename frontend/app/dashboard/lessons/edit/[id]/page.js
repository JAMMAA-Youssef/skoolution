"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, UploadCloud, FileText, Video, X } from "lucide-react";
import Header from "@/app/components/client/Header";
import Sidebar from "@/app/components/client/Sidebar";

export default function EditLessonPage({ params }) {
  const router = useRouter();
  const lessonId = React.use(params).id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [filteredCompetencies, setFilteredCompetencies] = useState([]);
  const [filteredSousCompetences, setFilteredSousCompetences] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    duration: "",
    subject: "",
    competence: "",
    sousCompetence: "",
  });
  const [existingFiles, setExistingFiles] = useState([]);
  const [newPdfFiles, setNewPdfFiles] = useState([]);
  const [newVideoFiles, setNewVideoFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsRes = await axios.get("/api/subjects");
        setSubjects(subjectsRes.data);

        // Fetch competencies
        const competenciesRes = await axios.get("/api/competencies");
        setCompetencies(competenciesRes.data);

        // Fetch lesson data
        const lessonRes = await axios.get(`/api/lessons/${lessonId}`);
        const lesson = lessonRes.data;
        
        setForm({
          title: lesson.title,
          content: lesson.content,
          duration: lesson.duration,
          subject: lesson.subject?._id || "",
          competence: lesson.competence?._id || "",
          sousCompetence: lesson.sousCompetence?._id || "",
        });
        
        setExistingFiles(lesson.fileUrls || []);
      } catch (err) {
        setError("Erreur lors du chargement des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  useEffect(() => {
    if (form.subject) {
      const filtered = competencies.filter(c => String(c.domaine) === String(form.subject));
      setFilteredCompetencies(filtered);
    }
  }, [form.subject, competencies]);

  useEffect(() => {
    if (form.competence) {
      const filtered = filteredCompetencies.filter(c => c.competence === form.competence);
      setFilteredSousCompetences(filtered);
    }
  }, [form.competence, filteredCompetencies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePdfChange = (e) => {
    setNewPdfFiles(Array.from(e.target.files));
  };

  const handleVideoChange = (e) => {
    setNewVideoFiles(Array.from(e.target.files));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("duration", form.duration);
      formData.append("subject", form.subject);
      formData.append("competence", form.competence);
      formData.append("sousCompetence", form.sousCompetence);
      
      // Add existing files that weren't removed
      formData.append("existingFiles", JSON.stringify(existingFiles));
      
      // Add new files
      newPdfFiles.forEach(file => formData.append("pdfs", file));
      newVideoFiles.forEach(file => formData.append("videos", file));

      await axios.put(`/api/lessons/${lessonId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Leçon modifiée avec succès !");
      setTimeout(() => {
        router.push("/dashboard?tab=lessons");
      }, 1500);
    } catch (err) {
      setError("Erreur lors de la modification de la leçon.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="flex h-dvh overflow-hidden">
        <Sidebar />
        <section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
          <Header />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skblue"></div>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="flex h-dvh overflow-hidden">
      <Sidebar />
      <section className="flex flex-col w-full py-5 pr-[12px] md:pr-5 pl-[72px] md:pl-5 bg-[#fafafa] overflow-y-scroll">
        <Header />
        <div className="max-w-4xl mx-auto w-full px-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/dashboard?tab=lessons")}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft className="text-skblue" />
            </button>
            <h1 className="text-2xl font-bold text-skblue">Modifier la leçon</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domaine
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                  required
                >
                  <option value="">Sélectionner un domaine</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compétence
                </label>
                <select
                  name="competence"
                  value={form.competence}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                  required
                  disabled={!form.subject}
                >
                  <option value="">Sélectionner une compétence</option>
                  {filteredCompetencies.map(comp => (
                    <option key={comp._id} value={comp._id}>
                      {comp.competence}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-compétence
                </label>
                <select
                  name="sousCompetence"
                  value={form.sousCompetence}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                  required
                  disabled={!form.competence}
                >
                  <option value="">Sélectionner une sous-compétence</option>
                  {filteredSousCompetences.map(comp => (
                    <option key={comp._id} value={comp._id}>
                      {comp.sousCompetence}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows="6"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skblue/20"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fichiers existants
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {existingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {file.type === "pdf" ? (
                        <FileText className="text-red-500" />
                      ) : (
                        <Video className="text-blue-500" />
                      )}
                      <span className="text-sm">{file.url.split("/").pop()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingFile(index)}
                      className="p-1 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="text-red-500" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveaux fichiers PDF
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handlePdfChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {newPdfFiles.length > 0
                        ? `${newPdfFiles.length} fichier(s) sélectionné(s)`
                        : "Cliquez pour ajouter des PDFs"}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvelles vidéos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Video className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {newVideoFiles.length > 0
                        ? `${newVideoFiles.length} fichier(s) sélectionné(s)`
                        : "Cliquez pour ajouter des vidéos"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard?tab=lessons")}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-skblue text-white rounded-md hover:bg-skblue/90 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </section>
  );
} 