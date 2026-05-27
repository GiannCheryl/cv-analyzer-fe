import React from "react";

export default function HomePage({ onLoginClick, onRegisterClick }) {

  const features = [
    {
      icon: "📄",
      title: "Upload CV",
      desc: "Upload file PDF, DOC, atau DOCX dengan mudah",
    },
    {
      icon: "💼",
      title: "Input Job Description",
      desc: "Masukkan deskripsi pekerjaan yang Anda inginkan",
    },
    {
      icon: "📊",
      title: "Analysis",
      desc: "Analisis otomatis untuk melihat kecocokan CV dan deskripsi pekerjaan",
    },
    {
      icon: "🔍",
      title: "History",
      desc: "Riwayat lengkap kecocokan skill dan rekomendasi",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <div className="hero-badge" style={{ margin: "0 auto 1.5rem" }}>
            Thesis Project — Gianina Cheryl Gosal
          </div>
          <h1 className="hero-title" style={{ textAlign: "center" }}>
            Analisis Kecocokan CV dengan
            <span className="gradient-text"> Job Description</span>
          </h1>
          <p className="hero-subtitle" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 2rem" }}>
            Upload CV Anda dan masukkan job description untuk mendapatkan analisis 
            kecocokan skill, rekomendasi posisi, dan rencana pengembangan karir.
          </p>
          <div className="hero-buttons" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={onRegisterClick}>
              Mulai Analisis Gratis
            </button>
            <button className="btn btn-outline btn-lg" onClick={onLoginClick}>
              Sudah Punya Akun?
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title-center">Bagaimana Cara Kerjanya?</h2>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Siap Menganalisis CV Anda?</h2>
        <p>Daftar sekarang dan dapatkan analisis pertama Anda secara gratis!</p>
        <button className="btn btn-primary btn-lg" onClick={onRegisterClick}>
          Daftar Sekarang
        </button>
      </section>
    </div>
  );
}
