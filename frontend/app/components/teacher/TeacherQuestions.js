import React, { useState, useEffect } from "react";
import { UploadCloud, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { createQuestion, createQuestionsBulk, fetchQuestions, fetchAllQuestions } from "@/app/services/questionService";

export default function TeacherQuestions() {
  const [activeTab, setActiveTab] = useState("manuel");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  // Manual form state
  const [form, setForm] = useState({
    domaine: "",
    competence: "",
    sousCompetence: "",
    question: "",
    b: "",
    response: "",
    choices: ["", "", "", ""]
  });
  // JSON import state
  const [jsonForm, setJsonForm] = useState({
    domaine: "",
    competence: "",
    sousCompetence: ""
  });
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonPreview, setJsonPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Add a new state for other teachers' questions
  const [otherQuestions, setOtherQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [domainsRes, competenciesRes] = await Promise.all([
          axios.get("/api/subjects"),
          axios.get("/api/competencies"),
        ]);
        setDomains(domainsRes.data);
        setCompetencies(competenciesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter competencies by selected domaine
  const filteredCompetencies = competencies.filter(c => String(c.domaine) === String(form.domaine));
  // Get unique competence names for the selected domaine
  const uniqueCompetenceNames = Array.from(new Set(filteredCompetencies.map(c => c.competence)));
  // Filter sous-compétence for the selected competence
  const filteredSousCompetencies = filteredCompetencies.filter(c => c.competence === form.competence);

  // For JSON form
  const jsonFilteredCompetencies = competencies.filter(c => String(c.domaine) === String(jsonForm.domaine));
  const jsonUniqueCompetenceNames = Array.from(new Set(jsonFilteredCompetencies.map(c => c.competence)));
  const jsonFilteredSousCompetencies = jsonFilteredCompetencies.filter(c => c.competence === jsonForm.competence);

  // Manual form sous-compétence options
  const selectedCompetency = competencies.find(c => c._id === form.competence);
  const sousCompetenceOptions = Array.isArray(selectedCompetency?.sousCompetence)
    ? selectedCompetency.sousCompetence
    : [];

  // JSON form sous-compétence options
  const jsonSelectedCompetency = competencies.find(c => c._id === jsonForm.competence);
  const jsonSousCompetenceOptions = Array.isArray(jsonSelectedCompetency?.sousCompetence)
    ? jsonSelectedCompetency.sousCompetence
    : [];

  // Handle manual form changes
  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith("choice")) {
      const idx = parseInt(name.replace("choice", ""), 10);
      setForm(f => ({ ...f, choices: f.choices.map((c, i) => (i === idx ? value : c)) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Handle manual question submit
  const handleManualSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const bVal = parseFloat(form.b);
      if (isNaN(bVal) || bVal < -3 || bVal > 3) {
        setError("Le champ 'b' doit être entre -3 et 3.");
        setLoading(false);
        return;
      }
      if (form.choices.some(c => !c)) {
        setError("Toutes les réponses doivent être remplies.");
        setLoading(false);
        return;
      }
      const respIdx = parseInt(form.response, 10);
      if (isNaN(respIdx) || respIdx < 0 || respIdx > 3) {
        setError("La réponse correcte doit être un index entre 0 et 3.");
        setLoading(false);
        return;
      }
      const selectedCompetencyObj = competencies.find(
        c => String(c.domaine) === String(form.domaine) && c.competence === form.competence && c.sousCompetence === form.sousCompetence
      );
      await createQuestion({
        question: form.question,
        b: bVal,
        choices: form.choices,
        response: respIdx,
        source: "manual",
        domaine: selectedCompetencyObj?.domaine,
        competence: selectedCompetencyObj?._id,
        sousCompetence: form.sousCompetence,
      });
      setSuccess("Question ajoutée !");
      setForm({
        domaine: "",
        competence: "",
        sousCompetence: "",
        question: "",
        b: "",
        response: "",
        choices: ["", "", "", ""]
      });
      // Refresh questions
      const questionsRes = await fetchQuestions();
      setQuestions(questionsRes.data);
    } catch (err) {
      setError("Erreur lors de l'ajout de la question.");
    } finally {
      setLoading(false);
    }
  };

  // Handle JSON form changes
  const handleJsonFormChange = e => {
    const { name, value } = e.target;
    setJsonForm(f => ({ ...f, [name]: value }));
  };

  // Handle JSON file upload
  const handleJsonChange = e => {
    const file = e.target.files[0];
    setJsonFile(file);
    setError("");
    setSuccess("");
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const data = JSON.parse(evt.target.result);
          if (!Array.isArray(data)) throw new Error();
          setJsonPreview(data);
        } catch {
          setError("Le fichier JSON n'est pas valide.");
          setJsonPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle JSON import (Ajouter)
  const handleJsonAdd = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await createQuestionsBulk(
        jsonPreview.map(q => {
          const selectedCompetencyObj = competencies.find(
            c => String(c.domaine) === String(jsonForm.domaine) && c.competence === jsonForm.competence && c.sousCompetence === jsonForm.sousCompetence
          );
          return {
            ...q,
            domaine: selectedCompetencyObj?.domaine,
            competence: selectedCompetencyObj?._id,
            sousCompetence: jsonForm.sousCompetence,
            source: "manual",
          };
        })
      );
      setSuccess("Questions importées !");
      setJsonFile(null);
      setJsonPreview([]);
      // Refresh questions
      const questionsRes = await fetchQuestions();
      setQuestions(questionsRes.data);
    } catch (err) {
      setError("Erreur lors de l'import des questions.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete (optional: implement API call)
  const handleDelete = idx => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  };

  // Add useEffect to fetch questions when 'liste' tab is activated
  useEffect(() => {
    if (activeTab === 'liste') {
      setLoading(true);
      fetchQuestions()
        .then(res => setQuestions(res.data))
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch other teachers' questions when the tab is activated
  useEffect(() => {
    if (activeTab === 'autres') {
      setLoading(true);
      fetchAllQuestions()
        .then(res => {
          const currentUser = JSON.parse(localStorage.getItem('userData'));
          setOtherQuestions(res.data.filter(q => q.teacher && currentUser && q.teacher !== currentUser._id));
        })
        .catch(() => setOtherQuestions([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'manuel' ? 'border-b-2 border-skblue text-skblue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('manuel')}
        >
          Ajouter une question
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'json' ? 'border-b-2 border-skblue text-skblue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('json')}
        >
          Importer (JSON)
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'liste' ? 'border-b-2 border-skblue text-skblue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('liste')}
        >
          Liste des questions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'autres' ? 'border-b-2 border-skblue text-skblue' : 'text-gray-500'}`}
          onClick={() => setActiveTab('autres')}
        >
          Liste des questions d'autre prof
        </button>
      </div>

      {activeTab === 'manuel' && (
        <section className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-skblue">Ajouter une question (Manuel)</h2>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-semibold">Domaine</label>
              <select
                className="w-full border rounded p-2"
                name="domaine"
                value={form.domaine}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un domaine</option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Compétence</label>
              <select
                className="w-full border rounded p-2"
                name="competence"
                value={form.competence}
                onChange={handleChange}
                required
                disabled={!form.domaine}
              >
                <option value="">Sélectionner une compétence</option>
                {uniqueCompetenceNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Sous-compétence</label>
              <select
                className="w-full border rounded p-2"
                name="sousCompetence"
                value={form.sousCompetence}
                onChange={handleChange}
                required
                disabled={!form.competence}
              >
                <option value="">Sélectionner une sous-compétence</option>
                {filteredSousCompetencies.map(c => (
                  <option key={c._id} value={c.sousCompetence}>{c.sousCompetence}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Question</label>
              <input
                type="text"
                name="question"
                className="w-full border rounded p-2"
                value={form.question}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">b (entre -3 et 3)</label>
              <input
                type="number"
                name="b"
                className="w-full border rounded p-2"
                value={form.b}
                onChange={handleChange}
                required
                min="-3"
                max="3"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Réponses (4 choix)</label>
              <div className="grid grid-cols-1 gap-2">
                {form.choices.map((choice, idx) => (
                  <input
                    key={idx}
                    type="text"
                    name={`choice${idx}`}
                    className="w-full border rounded p-2"
                    value={choice}
                    onChange={handleChange}
                    required
                    placeholder={`Choix ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Index de la bonne réponse (0-3)</label>
              <input
                type="number"
                name="response"
                className="w-full border rounded p-2"
                value={form.response}
                onChange={handleChange}
                required
                min="0"
                max="3"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-skblue text-white rounded hover:bg-skblue/90 transition-colors"
            >
              Ajouter
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
        </section>
      )}

      {activeTab === 'json' && (
        <section className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-skblue">Ajouter des questions (JSON)</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-semibold">Domaine</label>
              <select
                className="w-full border rounded p-2"
                name="domaine"
                value={jsonForm.domaine}
                onChange={handleJsonFormChange}
                required
              >
                <option value="">Sélectionner un domaine</option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Compétence</label>
              <select
                className="w-full border rounded p-2"
                name="competence"
                value={jsonForm.competence}
                onChange={handleJsonFormChange}
                required
                disabled={!jsonForm.domaine}
              >
                <option value="">Sélectionner une compétence</option>
                {jsonUniqueCompetenceNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Sous-compétence</label>
              <select
                className="w-full border rounded p-2"
                name="sousCompetence"
                value={jsonForm.sousCompetence}
                onChange={handleJsonFormChange}
                required
                disabled={!jsonForm.competence}
              >
                <option value="">Sélectionner une sous-compétence</option>
                {jsonFilteredSousCompetencies.map(c => (
                  <option key={c._id} value={c.sousCompetence}>{c.sousCompetence}</option>
                ))}
              </select>
            </div>
            {jsonPreview.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Aperçu du fichier :</h4>
                <ul className="list-disc pl-5">
                  {jsonPreview.map((q, i) => (
                    <li key={i}>{q.question}</li>
                  ))}
                </ul>
                <button
                  className="mt-2 px-4 py-2 bg-skblue text-white rounded hover:bg-skblue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleJsonAdd}
                  disabled={jsonPreview.length === 0}
                >
                  Ajouter
                </button>
              </div>
            )}
            <input
              type="file"
              accept=".json"
              onChange={handleJsonChange}
              disabled={!(jsonForm.domaine && jsonForm.competence && jsonForm.sousCompetence)}
            />
            {!(jsonForm.domaine && jsonForm.competence && jsonForm.sousCompetence) && (
              <div className="text-sm text-red-500 mt-2">
                Veuillez d'abord sélectionner le domaine, la compétence et la sous-compétence.
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </div>
        </section>
      )}

      {activeTab === 'liste' && (
        <section className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-skblue">Liste des questions</h2>
          <div className="overflow-x-auto rounded">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-skblue text-white">
                  <th className="px-4 py-3 text-left font-semibold">Domaine</th>
                  <th className="px-4 py-3 text-left font-semibold">Compétence</th>
                  <th className="px-4 py-3 text-left font-semibold">Sous-compétence</th>
                  <th className="px-4 py-3 text-left font-semibold">Question</th>
                  <th className="px-4 py-3 text-left font-semibold">Niveau de difficulté</th>
                  <th className="px-4 py-3 text-left font-semibold">Réponses</th>
                  <th className="px-4 py-3 text-left font-semibold">Bonne réponse</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      Aucune question trouvée. Commencez par ajouter des questions en utilisant le formulaire "Ajouter une question".
                    </td>
                  </tr>
                ) : (
                  questions.map((q, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 align-top">{q.domaine?.name || '-'}</td>
                      <td className="px-4 py-3 align-top">{q.competence?.competence || '-'}</td>
                      <td className="px-4 py-3 align-top">{q.sousCompetence || '-'}</td>
                      <td className="px-4 py-3 align-top max-w-xs break-words">{q.question}</td>
                      <td className="px-4 py-3 align-top text-center">{q.b}</td>
                      <td className="px-4 py-3 align-top">
                        <ul className="list-disc pl-4 space-y-1">
                          {q.choices && q.choices.map((choice, i) => (
                            <li key={i}>{choice.replace(/^\\?;\s*/, "")}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 align-top font-semibold text-green-700">
                        {q.choices && typeof q.response === 'number' && q.choices[q.response]?.replace(/^\\?;\s*/, "")}
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800">
                            <Edit size={18} />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800" onClick={() => handleDelete(idx)}>
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

      {activeTab === 'autres' && (
        <section className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-skblue">Liste des questions d'autre prof</h2>
          <div className="overflow-x-auto rounded">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-skblue text-white">
                  <th className="px-4 py-3 text-left font-semibold">Domaine</th>
                  <th className="px-4 py-3 text-left font-semibold">Compétence</th>
                  <th className="px-4 py-3 text-left font-semibold">Sous-compétence</th>
                  <th className="px-4 py-3 text-left font-semibold">Question</th>
                  <th className="px-4 py-3 text-left font-semibold">Niveau de difficulté</th>
                  <th className="px-4 py-3 text-left font-semibold">Réponses</th>
                  <th className="px-4 py-3 text-left font-semibold">Bonne réponse</th>
                </tr>
              </thead>
              <tbody>
                {otherQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      Aucune question trouvée pour d'autres professeurs.
                    </td>
                  </tr>
                ) : (
                  otherQuestions.map((q, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 align-top">{q.domaine?.name || '-'}</td>
                      <td className="px-4 py-3 align-top">{q.competence?.competence || '-'}</td>
                      <td className="px-4 py-3 align-top">{q.sousCompetence || '-'}</td>
                      <td className="px-4 py-3 align-top max-w-xs break-words">{q.question}</td>
                      <td className="px-4 py-3 align-top text-center">{q.b}</td>
                      <td className="px-4 py-3 align-top">
                        <ul className="list-disc pl-4 space-y-1">
                          {q.choices && q.choices.map((choice, i) => (
                            <li key={i}>{choice.replace(/^\\?;\s*/, "")}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 align-top font-semibold text-green-700">
                        {q.choices && typeof q.response === 'number' && q.choices[q.response]?.replace(/^\\?;\s*/, "")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
} 