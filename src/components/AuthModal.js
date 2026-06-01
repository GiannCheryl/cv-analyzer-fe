import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          setError("Password tidak cocok!");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Password minimal 6 karakter!");
          setLoading(false);
          return;
        }
        
        const result = await register(formData.name, formData.email, formData.password);
        setSuccessMessage(result.message || "Registrasi berhasil! Silakan login.");
        
        setTimeout(() => {
          setFormData({ name: "", email: "", password: "", confirmPassword: "" });
          setSuccessMessage("");
          setMode("login");
        }, 2000);
        
      } else {
        await login(formData.email, formData.password);
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-tabs">
          <button
            className={`header-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            <span className="tab-text">Masuk</span>
          </button>
          <button
            className={`header-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            <span className="tab-text">Daftar</span>
          </button>
        </div>

        <div className="modal-body">
          <h2 className="modal-title">
            {mode === "login" ? "Selamat Datang Kembali!" : "Buat Akun Baru"}
          </h2>
          <p className="modal-subtitle">
            {mode === "login" 
              ? "Masuk untuk menganalisis CV Anda" 
              : "Daftar untuk mulai menganalisis CV"}
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="auth-success">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {mode === "login" ? "Memasukkan..." : "Mendaftarkan..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Masuk" : "Daftar Sekarang"}
                </>
              )}
            </button>
          </form>

          <div className="modal-footer">
            <p>
              {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
              <button 
                className="link-button" 
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Daftar disini" : "Masuk disini"}
              </button>
            </p>
          </div>
        </div>

        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}