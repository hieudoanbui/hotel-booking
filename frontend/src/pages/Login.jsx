import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function Login() {
  const { t, language } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const text = t.auth;

  const apiTimeoutMessage =
    language === "en"
      ? "The login API is taking too long to respond. Please check XAMPP Apache/MySQL or the backend."
      : "API đăng nhập phản hồi quá lâu. Hãy kiểm tra XAMPP Apache/MySQL hoặc backend.";

  const accountInfoMissingMessage =
    language === "en"
      ? "Sign in failed. Account information was not received."
      : "Đăng nhập thất bại. Không nhận được thông tin tài khoản.";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);

      if (!form.email.trim() || !form.password.trim()) {
        setError(text.loginRequired);
        setLoading(false);
        return;
      }

      const response = await axiosClient.post("/login", {
        email: form.email.trim(),
        password: form.password,
      });

      console.log("Login response:", response.data);

      const user =
        response.data?.data?.user ||
        response.data?.user ||
        response.data?.data ||
        null;

      const token = response.data?.data?.token || response.data?.token || "";

      if (!user || !user.role) {
        setError(accountInfoMissingMessage);
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authUser", JSON.stringify(user));

      if (token) {
        localStorage.setItem("token", token);
      }

      setMessage(text.loginSuccess);

      const role = String(user.role).toLowerCase();

      setTimeout(() => {
        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/";
        }
      }, 300);
    } catch (err) {
      console.log("Login error:", err);

      if (err.code === "ECONNABORTED") {
        setError(apiTimeoutMessage);
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            text.loginFailed
        );
      }

      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{text.loginTitle}</h1>
        <p>{text.loginDesc}</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
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
            <label>{text.password}</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={text.enterPassword}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <div className="auth-extra">
            <Link to="/forgot-password">{text.forgotPassword}</Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? text.loggingIn : text.loginButton}
          </button>
        </form>

        <p className="auth-bottom">
          {text.noAccount} <Link to="/register">{text.registerNow}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;