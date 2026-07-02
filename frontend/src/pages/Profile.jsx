import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    role: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loadProfile = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/profile");
      const user = response.data?.data?.user || response.data?.user || null;

      if (user) {
        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          avatar_url: user.avatar_url || "",
          role: user.role || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin hồ sơ.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axiosClient.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data?.data?.user || response.data?.user || null;

      if (updatedUser) {
        setProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          avatar_url: updatedUser.avatar_url || "",
          role: updatedUser.role || "",
        });

        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setMessage("Upload ảnh đại diện thành công.");

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || "Upload ảnh đại diện thất bại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!profile.name || !profile.email) {
        setError("Vui lòng nhập họ tên và email.");
        return;
      }

      const response = await axiosClient.put("/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      });

      const updatedUser = response.data?.data?.user || response.data?.user || null;

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setMessage("Cập nhật hồ sơ thành công.");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setPasswordMessage("");
      setPasswordError("");

      if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
        setPasswordError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
        return;
      }

      if (passwordForm.new_password.length < 6) {
        setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setPasswordError("Mật khẩu xác nhận không khớp.");
        return;
      }

      await axiosClient.put("/change-password", passwordForm);

      setPasswordMessage("Đổi mật khẩu thành công.");

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin tài khoản, ảnh đại diện và mật khẩu đăng nhập.</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h2>Thông tin tài khoản</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="profile-avatar-preview-box">
              <p>Ảnh đại diện hiện tại</p>

              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="profile-avatar-preview" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <div className="avatar-upload-area">
                <label className="avatar-upload-btn">
                  {uploadingAvatar ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label>Đường dẫn ảnh đại diện</label>
              <input
                type="text"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleProfileChange}
                placeholder="/images/avatars/admin-avatar.jpg"
              />
              <small className="profile-note">
                Có thể nhập thủ công hoặc chọn ảnh từ máy ở phía trên.
              </small>
            </div>

            <div className="form-group">
              <label>Vai trò</label>
              <input type="text" value={profile.role} disabled />
            </div>

            <button type="submit" className="btn btn-primary">
              Cập nhật hồ sơ
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h2>Đổi mật khẩu</h2>

          {passwordMessage && <div className="alert alert-success">{passwordMessage}</div>}
          {passwordError && <div className="alert alert-error">{passwordError}</div>}

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label>Mật khẩu cũ</label>

              <div className="password-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu cũ"
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>

              <div className="password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới"
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
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

            <button type="submit" className="btn btn-primary">
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;