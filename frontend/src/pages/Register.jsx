import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function Register() {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.name || !form.email || !form.password) {
        setError("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
        return;
      }

      if (form.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }

      await axiosClient.post("/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      setMessage("Đăng ký thành công. Vui lòng đăng nhập.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản để đặt phòng trực tuyến.</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
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
            <label>Xác nhận mật khẩu</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Đăng ký
          </button>
        </form>

        <p className="auth-bottom">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;