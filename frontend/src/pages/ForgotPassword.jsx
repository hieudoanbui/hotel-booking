import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const text = {
    title: language === "en" ? "Forgot password" : "Quên mật khẩu",
    desc:
      language === "en"
        ? "Enter your registered email and phone number to reset your password."
        : "Nhập email và số điện thoại đã đăng ký để đặt lại mật khẩu.",
    email: "Email",
    phone: language === "en" ? "Phone number" : "Số điện thoại",
    newPassword: language === "en" ? "New password" : "Mật khẩu mới",
    confirmPassword:
      language === "en" ? "Confirm new password" : "Xác nhận mật khẩu mới",
    enterEmail:
      language === "en"
        ? "Enter your registered email"
        : "Nhập email đã đăng ký",
    enterPhone:
      language === "en"
        ? "Enter your registered phone number"
        : "Nhập số điện thoại đã đăng ký",
    enterPassword:
      language === "en" ? "Enter new password" : "Nhập mật khẩu mới",
    enterConfirmPassword:
      language === "en"
        ? "Re-enter new password"
        : "Nhập lại mật khẩu mới",
    show: language === "en" ? "Show" : "Hiện",
    hide: language === "en" ? "Hide" : "Ẩn",
    submit: language === "en" ? "Change password" : "Đổi mật khẩu",
    processing: language === "en" ? "Processing..." : "Đang xử lý...",
    rememberPassword:
      language === "en" ? "Remember your password?" : "Nhớ mật khẩu rồi?",
    login: language === "en" ? "Sign in" : "Đăng nhập",
    required:
      language === "en"
        ? "Please enter all required information."
        : "Vui lòng nhập đầy đủ thông tin.",
    passwordMinLength:
      language === "en"
        ? "New password must be at least 6 characters."
        : "Mật khẩu mới phải có ít nhất 6 ký tự.",
    passwordNotMatch:
      language === "en"
        ? "Password confirmation does not match."
        : "Mật khẩu xác nhận không khớp.",
    success:
      language === "en"
        ? "Password changed successfully. Redirecting to sign in page..."
        : "Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...",
    failed:
      language === "en"
        ? "Unable to change password. Please check your information again."
        : "Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.",
  };

  const getApiErrorMessage = (err, fallback) => {
    if (language === "en") {
      return fallback;
    }

    return err.response?.data?.message || err.response?.data?.error || fallback;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);

      if (
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.password ||
        !form.confirm_password
      ) {
        setError(text.required);
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        setError(text.passwordMinLength);
        setLoading(false);
        return;
      }

      if (form.password !== form.confirm_password) {
        setError(text.passwordNotMatch);
        setLoading(false);
        return;
      }

      await axiosClient.post("/forgot-password", {
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });

      setMessage(text.success);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, text.failed));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{text.title}</h1>

        <p>{text.desc}</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label>{text.email}</label>

            <input
              type="email"
              name="email"
              placeholder={text.enterEmail}
              value={form.email}
              onChange={handleChange}
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{text.newPassword}</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={text.enterPassword}
                value={form.password}
                onChange={handleChange}
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
                name="confirm_password"
                placeholder={text.enterConfirmPassword}
                value={form.confirm_password}
                onChange={handleChange}
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
            {loading ? text.processing : text.submit}
          </button>
        </form>

        <p className="auth-bottom">
          {text.rememberPassword} <Link to="/login">{text.login}</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;