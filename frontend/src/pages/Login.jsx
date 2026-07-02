import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.email || !form.password) {
        setError("Vui lòng nhập đầy đủ email và mật khẩu.");
        return;
      }

      const response = await axiosClient.post("/login", form);

      const user =
        response.data?.data?.user ||
        response.data?.user ||
        null;

      if (!user) {
        setError("Đăng nhập thất bại. Không nhận được thông tin tài khoản.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Đăng nhập thành công.");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để đặt phòng và quản lý thông tin của bạn.</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
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

          <div className="auth-extra">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            Đăng nhập
          </button>
        </form>

        <p className="auth-bottom">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;