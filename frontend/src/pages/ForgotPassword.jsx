import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function ForgotPassword() {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.email || !form.phone || !form.password || !form.confirm_password) {
        setError("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      if (form.password.length < 6) {
        setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      if (form.password !== form.confirm_password) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }

      await axiosClient.post("/forgot-password", form);

      setMessage("Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Quên mật khẩu</h1>
        <p>Nhập email và số điện thoại đã đăng ký để đặt lại mật khẩu.</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email đã đăng ký"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              placeholder="Nhập số điện thoại đã đăng ký"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu mới"
                value={form.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirm_password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Đổi mật khẩu
          </button>
        </form>

        <p className="auth-bottom">
          Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;