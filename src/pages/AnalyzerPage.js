import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_API_URL || "http://localhost:5000";

// Enable cookies for axios
axios.defaults.withCredentials = true;

export default function AnalyzerPage() {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError("Hanya file PDF, DOC, atau DOCX yang diizinkan");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }
    setResumeFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError("Silakan upload CV terlebih dahulu (PDF, DOC, atau DOCX)");
      return;
    }
    if (!jobDesc.trim()) {
      setError("Silakan masukkan job description");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveStatus("");

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("job_desc", jobDesc);

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      if (response.data.success) {
        setResult(response.data);

        // Save to history if logged in (session will handle auth)
        if (user) {
          try {
            await axios.post(
              `${API_URL}/api/history`,
              {
                job_desc: jobDesc,
                file_name: fileName,
                domain: response.data.domain,
                match_score: response.data.match_score,
                match_percentage: response.data.match_percentage,
                auto_summary: response.data.auto_summary,
                skills_analysis: response.data.skills_analysis,
                cv_summary: response.data.cv_summary,
                role_compatibility: response.data.role_compatibility,
                action_plan: response.data.action_plan,
              }
            );
            setSaveStatus("Analisis tersimpan di history");
          } catch (saveErr) {
            console.error("Failed to save history:", saveErr);
            setSaveStatus("Gagal menyimpan ke history");
          }
        }

        setTimeout(() => {
          document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setError("Terjadi kesalahan saat menganalisis CV");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail?.error?.message ||
        "Error saat memproses file. Pastikan backend berjalan dan file valid.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setFileName("");
    setJobDesc("");
    setResult(null);
    setError(null);
    setSaveStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score) => {
    const percentage = score * 100;
    if (percentage >= 75) return "#22c55e";
    if (percentage >= 50) return "#f59e0b";
    if (percentage >= 30) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    const percentage = score * 100;
    if (percentage >= 75) return "Sangat Cocok";
    if (percentage >= 50) return "Cukup Cocok";
    if (percentage >= 30) return "Perlu Pengembangan";
    return "Kurang Cocok";
  };

  return (
    <div className="analyzer-container">
      <header className="analyzer-header">
        <h1>CV Analyzer</h1>
        <p>Analyze Your CV's Match with Job Requirements</p>
      </header>

      <section className="input-section">
        <div className="input-card">
          <h2 className="section-title">Input Data</h2>
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label">
                Upload CV (PDF / DOC / DOCX)
              </label>
              <div
                className={`upload-box ${dragActive ? "drag-active" : ""} ${fileName ? "has-file" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  hidden
                />
                {fileName ? (
                  <div className="file-info">
                    <span className="file-icon">✅</span>
                    <span className="file-name">{fileName}</span>
                    <button
                      className="remove-file"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📁</div>
                    <p>Drag & drop file or click to upload</p>
                    <span className="upload-hint">Maksimal 10MB</span>
                  </>
                )}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                Deskripsi Pekerjaan (Job Description)
              </label>
              <textarea
                className="job-textarea"
                rows={8}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Insert job description here..."
              />
              <span className="char-count">{jobDesc.length} karakter</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {saveStatus && (
            <div className="save-status">{saveStatus}</div>
          )}

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !resumeFile || !jobDesc.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Menganalisis...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analisis CV
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <section className="loading-section">
          <div className="loading-card">
            <div className="loading-animation">
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
            </div>
            <p className="loading-text">Menganalisis CV Anda...</p>
            <p className="loading-subtext">Ini mungkin memakan waktu 10-30 detik</p>
          </div>
        </section>
      )}

      {result && !loading && (
        <section id="result-section" className="result-section">
          <h2 className="section-title">Result Analysis</h2>
          <div className="domain-badge">
            <span className="domain-label">Detected Field:</span>
            <span className="domain-value">{result.domain}</span>
          </div>

          <div className="result-grid">
            <div className="result-column">
              <div className="result-card score-card">
                <h3 className="card-title">Tingkat Kecocokan</h3>
                <div className="score-container">
                  <div
                    className="score-circle"
                    style={{
                      background: `conic-gradient(${getScoreColor(result.match_score)} ${
                        result.match_percentage * 3.6
                      }deg, #e5e7eb 0deg)`,
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-value">{result.match_percentage}%</span>
                      <span className="score-label" style={{ color: getScoreColor(result.match_score) }}>
                        {getScoreLabel(result.match_score)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="score-bar-container">
                  <div
                    className="score-bar"
                    style={{
                      width: `${result.match_percentage}%`,
                      backgroundColor: getScoreColor(result.match_score),
                    }}
                  ></div>
                </div>
              </div>

              <div className="result-card">
                <h3 className="card-title">
                  <span className="title-icon">✅</span>
                  Skill yang Cocok
                </h3>
                <div className="skills-section">
                  {result.skills_analysis.hard_skill_matches.length > 0 && (
                    <div className="skill-category">
                      <h4>Hard Skills</h4>
                      <div className="tag-container">
                        {result.skills_analysis.hard_skill_matches.map((skill, i) => (
                          <span key={i} className="tag tag-success">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.skills_analysis.soft_skill_matches.length > 0 && (
                    <div className="skill-category">
                      <h4>Soft Skills</h4>
                      <div className="tag-container">
                        {result.skills_analysis.soft_skill_matches.map((skill, i) => (
                          <span key={i} className="tag tag-success-soft">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.skills_analysis.hard_skill_matches.length === 0 &&
                    result.skills_analysis.soft_skill_matches.length === 0 && (
                      <p className="empty-state">Tidak ada skill yang cocok ditemukan</p>
                    )}
                </div>
              </div>

              <div className="result-card">
                <h3 className="card-title">
                  Rekomendasi Posisi Lain
                </h3>
                <div className="positions-list">
                  {result.role_compatibility?.map((role, i) => (
                    <div key={i} className="position-item">
                      <div className="position-number">{i + 1}</div>
                      <div className="position-content">
                        <h4 className="position-name">{role.role}</h4>
                        <p className="position-reason">{role.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="result-column">
              <div className="result-card">
                <h3 className="card-title">
                  Ringkasan Analisis
                </h3>
                <p className="summary-text">{result.auto_summary}</p>
              </div>

              {result.cv_summary && (
                <div className="result-card">
                  <h3 className="card-title">
                    Ringkasan CV
                  </h3>
                  <div className="cv-summary">
                    {result.cv_summary.education?.length > 0 && (
                      <div className="summary-section">
                        <h4>Pendidikan</h4>
                        <ul>
                          {result.cv_summary.education.map((edu, i) => (
                            <li key={i}>
                              {typeof edu === "object"
                                ? `${edu.program || ""} - ${edu.institution || ""} ${edu.graduation_date || ""} ${edu.gpa ? "| IPK: " + edu.gpa : ""}`
                                : edu}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.cv_summary.skills?.length > 0 && (
                      <div className="summary-section">
                        <h4>Skills Utama</h4>
                        <ul>
                          {result.cv_summary.skills.map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.cv_summary.experience?.length > 0 && (
                      <div className="summary-section">
                        <h4>Pengalaman</h4>
                        <ul>
                          {result.cv_summary.experience.map((exp, i) => (
                            <li key={i}>{exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.cv_summary.certifications?.length > 0 && (
                      <div className="summary-section">
                        <h4>Sertifikasi</h4>
                        <ul>
                          {result.cv_summary.certifications.map((cert, i) => (
                            <li key={i}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="result-card">
                <h3 className="card-title">
                  Skill yang Perlu Dikembangkan
                </h3>
                <div className="skills-section">
                  {result.skills_analysis.missing_hard_skills.length > 0 && (
                    <div className="skill-category">
                      <h4>Hard Skills</h4>
                      <div className="tag-container">
                        {result.skills_analysis.missing_hard_skills.map((skill, i) => (
                          <span key={i} className="tag tag-danger">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.skills_analysis.missing_soft_skills.length > 0 && (
                    <div className="skill-category">
                      <h4>Soft Skills</h4>
                      <div className="tag-container">
                        {result.skills_analysis.missing_soft_skills.map((skill, i) => (
                          <span key={i} className="tag tag-warning">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.skills_analysis.missing_hard_skills.length === 0 &&
                    result.skills_analysis.missing_soft_skills.length === 0 && (
                      <p className="empty-state success">Semua skill sudah terpenuhi!</p>
                    )}
                </div>
              </div>

              <div className="result-card">
                <h3 className="card-title">
                  Rencana Pengembangan
                </h3>
                <ol className="action-plan">
                  {result.action_plan?.map((action, i) => (
                    <li key={i} className="action-item">
                      <span className="action-number">{i + 1}</span>
                      <span className="action-text">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="analyze-again">
            <button className="btn btn-primary" onClick={handleReset}>
              Analisis CV Lain
            </button>
          </div>
        </section>
      )}

      <footer className="analyzer-footer">
        <p>CV Analyzer System | Thesis Project</p>
        <p>Gianina Cheryl Gosal - 2602062210</p>
      </footer>
    </div>
  );
}
