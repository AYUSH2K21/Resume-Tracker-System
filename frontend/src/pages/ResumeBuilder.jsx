import { useEffect, useState } from "react";
import api from "../services/api";

export default function ResumeBuilder() {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState("");

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  
  const [skills, setSkills] = useState("");
  
  const [education, setEducation] = useState([{ degree: "", school: "", year: "" }]);
  const [experience, setExperience] = useState([{ role: "", company: "", duration: "", description: "" }]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDrafts = async () => {
    try {
      const response = await api.get("resumes/builder/");
      setDrafts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDrafts();
    };
    loadData();
  }, []);

  const handleSelectDraft = (e) => {
    const draftId = e.target.value;
    setSelectedDraftId(draftId);
    if (!draftId) {
      clearForm();
      return;
    }
    const draft = drafts.find((d) => d.id.toString() === draftId);
    if (draft) {
      setTitle(draft.title || "");
      setName(draft.personal_info?.name || "");
      setEmail(draft.personal_info?.email || "");
      setPhone(draft.personal_info?.phone || "");
      setWebsite(draft.personal_info?.website || "");
      setSkills(draft.skills ? draft.skills.join(", ") : "");
      setEducation(draft.education?.length ? draft.education : [{ degree: "", school: "", year: "" }]);
      setExperience(draft.experience?.length ? draft.experience : [{ role: "", company: "", duration: "", description: "" }]);
    }
  };

  const clearForm = () => {
    setSelectedDraftId("");
    setTitle("");
    setName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setSkills("");
    setEducation([{ degree: "", school: "", year: "" }]);
    setExperience([{ role: "", company: "", duration: "", description: "" }]);
  };

  const handleAddEdu = () => {
    setEducation([...education, { degree: "", school: "", year: "" }]);
  };

  const handleRemoveEdu = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEduChange = (index, field, value) => {
    const updated = education.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
  };

  const handleAddExp = () => {
    setExperience([...experience, { role: "", company: "", duration: "", description: "" }]);
  };

  const handleRemoveExp = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleExpChange = (index, field, value) => {
    const updated = experience.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperience(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);

    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title: title || `${name}'s Resume`,
      personal_info: { name, email, phone, website },
      education: education.filter((edu) => edu.school || edu.degree),
      experience: experience.filter((exp) => exp.company || exp.role),
      skills: parsedSkills,
    };

    try {
      if (selectedDraftId) {
        await api.put(`resumes/builder/${selectedDraftId}/`, payload);
        setSuccessMsg("Resume updated successfully!");
      } else {
        const response = await api.post("resumes/builder/", payload);
        const savedId = response.data.id;
        setSelectedDraftId(savedId.toString());
        setSuccessMsg("Resume created successfully!");
      }
      await fetchDrafts();
    } catch (err) {
      console.error(err);
      setError("Failed to save resume builder entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedDraftId) {
      alert("Please save your resume first before downloading.");
      return;
    }
    try {
      const response = await api.get(`resumes/builder/${selectedDraftId}/download/`, {
        responseType: "blob",
      });
      
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const errJson = JSON.parse(text);
        alert(errJson.error || "Failed to generate PDF.");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const downloadName = (title || "Resume").replace(/\s+/g, "_");
      link.setAttribute("download", `${downloadName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF file.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            Resume Builder Studio
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Builder</h1>
          <p className="text-xs text-slate-500 font-medium">Create, edit, and export structured professional PDF resumes.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedDraftId}
            onChange={handleSelectDraft}
            className="saas-input py-1.5 px-3 text-xs cursor-pointer font-semibold"
          >
            <option value="">-- Select Saved Draft --</option>
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          {selectedDraftId && (
            <button
              onClick={clearForm}
              className="saas-button-secondary py-1.5 px-3 text-xs"
            >
              Start New
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}
      {successMsg && <div className="p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl text-xs font-semibold">{successMsg}</div>}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Title */}
        <div className="saas-card p-6 space-y-3 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Document Title
          </h3>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Resume Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer - 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="saas-input w-full"
              required
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="saas-card p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Ayush Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="saas-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="ayush@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saas-input w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Portfolio / Website URL</label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="saas-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="saas-card p-6 space-y-3 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            3. Core Skills (Comma-separated)
          </h3>
          <input
            type="text"
            placeholder="Python, Django, React, PostgreSQL, REST APIs, Docker, Git"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="saas-input w-full"
          />
        </div>

        {/* Work Experience */}
        <div className="saas-card p-6 space-y-4 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              4. Work Experience ({experience.length})
            </h3>
            <button
              type="button"
              onClick={handleAddExp}
              className="saas-button-secondary text-xs py-1 px-2.5"
            >
              + Add Position
            </button>
          </div>

          {experience.map((exp, index) => (
            <div key={index} className="saas-card-subtle p-4 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Position #{index + 1}</span>
                {experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExp(index)}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExpChange(index, "company", e.target.value)}
                    className="saas-input w-full"
                    placeholder="Acme Inc"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleExpChange(index, "role", e.target.value)}
                    className="saas-input w-full"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleExpChange(index, "duration", e.target.value)}
                    className="saas-input w-full"
                    placeholder="Jan 2023 - Present"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Key Accomplishments</label>
                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) => handleExpChange(index, "description", e.target.value)}
                  className="saas-input w-full leading-relaxed"
                  placeholder="Built microservices using Python and reduced database query latency by 40%..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="saas-card p-6 space-y-4 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              5. Education ({education.length})
            </h3>
            <button
              type="button"
              onClick={handleAddEdu}
              className="saas-button-secondary text-xs py-1 px-2.5"
            >
              + Add Institution
            </button>
          </div>

          {education.map((edu, index) => (
            <div key={index} className="saas-card-subtle p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Education #{index + 1}</span>
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEdu(index)}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleEduChange(index, "school", e.target.value)}
                    className="saas-input w-full"
                    placeholder="University of Science"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Degree / Major</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEduChange(index, "degree", e.target.value)}
                    className="saas-input w-full"
                    placeholder="B.S. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEduChange(index, "year", e.target.value)}
                    className="saas-input w-full"
                    placeholder="2025"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="flex justify-end gap-3 pt-2">
          {selectedDraftId && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="saas-button-secondary py-2 px-4 font-bold"
            >
              📄 Download PDF
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="saas-button-emerald py-2 px-5 font-bold"
          >
            {saving ? "Saving Draft..." : "Save Resume Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
