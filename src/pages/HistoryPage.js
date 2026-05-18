import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchHistory();
  }, [isAuthenticated, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/history");
      setHistory(response.data.history || []);
    } catch (err) {
      setError("Gagal memuat history analisis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!window.confirm("Yakin ingin menghapus analisis ini?")) return;
    try {
      await api.delete(`/api/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      alert("Gagal menghapus history");
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "#22c55e";
    if (percentage >= 50) return "#f59e0b";
    if (percentage >= 30) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 75) return "Sangat Cocok";
    if (percentage >= 50) return "Cukup Cocok";
    if (percentage >= 30) return "Perlu Pengembangan";
    return "Kurang Cocok";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Memuat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>History Analisis CV</h1>
        <p>Semua analisis CV yang pernah Anda lakukan</p>
      </div>

      {error && <div className="history-error">{error}</div>}

      {history.length === 0 ? (
        <div className="history-empty">
          <div className="empty-icon">📭</div>
          <h3>Belum Ada History</h3>
          <p>Anda belum melakukan analisis CV. Mulai analisis pertama Anda!</p>
          <button className="btn btn-primary" onClick={() => navigate("/analyze")}>
            <span>🔍</span> Analisis CV Sekarang
          </button>
        </div>
      ) : (
        <div className="history-layout">
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item.id}
                className={`history-item ${selectedItem?.id === item.id ? "active" : ""}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="history-item-header">
                  <span className="history-domain">{item.domain}</span>
                  <span
                    className="history-score-badge"
                    style={{ backgroundColor: getScoreColor(item.match_percentage) + "20", color: getScoreColor(item.match_percentage) }}
                  >
                    {item.match_percentage}%
                  </span>
                </div>
                <p className="history-filename">📄 {item.file_name}</p>
                <p className="history-date">🕐 {formatDate(item.created_at)}</p>
                <button
                  className="history-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="history-detail">
            {selectedItem ? (
              <>
                <div className="detail-header">
                  <h2>{selectedItem.domain}</h2>
                  <span
                    className="detail-score"
                    style={{ color: getScoreColor(selectedItem.match_percentage) }}
                  >
                    {selectedItem.match_percentage}% - {getScoreLabel(selectedItem.match_percentage)}
                  </span>
                </div>

                <div className="detail-meta">
                  <p><strong>📄 File:</strong> {selectedItem.file_name}</p>
                  <p><strong>🕐 Tanggal:</strong> {formatDate(selectedItem.created_at)}</p>
                </div>

                <div className="detail-section">
                  <h3>📝 Ringkasan</h3>
                  <p>{selectedItem.auto_summary}</p>
                </div>

                {selectedItem.skills_analysis?.hard_skill_matches?.length > 0 && (
                  <div className="detail-section">
                    <h3>✅ Hard Skills Cocok</h3>
                    <div className="detail-tags">
                      {selectedItem.skills_analysis.hard_skill_matches.map((skill, i) => (
                        <span key={i} className="tag tag-success">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.skills_analysis?.soft_skill_matches?.length > 0 && (
                  <div className="detail-section">
                    <h3>✅ Soft Skills Cocok</h3>
                    <div className="detail-tags">
                      {selectedItem.skills_analysis.soft_skill_matches.map((skill, i) => (
                        <span key={i} className="tag tag-success-soft">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.skills_analysis?.missing_hard_skills?.length > 0 && (
                  <div className="detail-section">
                    <h3>⚠️ Hard Skills Kurang</h3>
                    <div className="detail-tags">
                      {selectedItem.skills_analysis.missing_hard_skills.map((skill, i) => (
                        <span key={i} className="tag tag-danger">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.action_plan?.length > 0 && (
                  <div className="detail-section">
                    <h3>🚀 Rencana Pengembangan</h3>
                    <ol className="detail-action-plan">
                      {selectedItem.action_plan.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedItem.role_compatibility?.length > 0 && (
                  <div className="detail-section">
                    <h3>🎯 Rekomendasi Posisi</h3>
                    <div className="detail-positions">
                      {selectedItem.role_compatibility.map((role, i) => (
                        <div key={i} className="detail-position-item">
                          <span className="position-rank">{i + 1}</span>
                          <div>
                            <strong>{role.role}</strong>
                            <p>{role.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="detail-empty">
                <p>Pilih item dari daftar untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}