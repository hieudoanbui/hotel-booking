import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function Register() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const text = t.auth;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordLengthMessage =
    language === "en"
      ? "Password must be at least 6 characters."
      : "Mật khẩu phải có ít nhất 6 ký tự.";

  const registerSuccessMessage =
    language === "en"
      ? "Account created successfully. Please sign in."
      : "Đăng ký thành công. Vui lòng đăng nhập.";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);

      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError(text.registerRequired);
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        setError(passwordLengthMessage);
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError(text.passwordNotMatch);
        setLoading(false);
        return;
      }

      await axiosClient.post("/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      setMessage(registerSuccessMessage);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.log("Register error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          text.registerFailed
      );

      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{text.registerTitle}</h1>
        <p>{text.registerDesc}</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>{text.fullName}</label>

            <input
              type="text"
              name="name"
              placeholder={text.enterFullName}
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{text.email}</label>

            <input
              type="email"
              name="email"
              placeholder={text.enterEmail}
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{text.phone}</label>

            <input
              type="text"
              name="phone"
              placeholder={text.enterPhone}
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{text.password}</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={text.enterPassword}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? text.hide : text.show}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{text.confirmPassword}</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={text.enterConfirmPassword}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? text.hide : text.show}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? text.registering : text.registerButton}
          </button>
        </form>

        <p className="auth-bottom">
          {text.haveAccount} <Link to="/login">{text.loginNow}</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;