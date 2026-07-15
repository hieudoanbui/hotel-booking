import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function Profile() {
  const { t, language } = useLanguage();

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

  const text = {
    title: language === "en" ? "My profile" : "Hồ sơ cá nhân",
    subtitle:
      language === "en"
        ? "Manage your account information, avatar, and login password."
        : "Quản lý thông tin tài khoản, ảnh đại diện và mật khẩu đăng nhập.",
    accountInfo:
      language === "en" ? "Account information" : "Thông tin tài khoản",
    currentAvatar:
      language === "en" ? "Current avatar" : "Ảnh đại diện hiện tại",
    uploadingAvatar:
      language === "en" ? "Uploading image..." : "Đang tải ảnh...",
    chooseImage:
      language === "en" ? "Choose image from device" : "Chọn ảnh từ máy",
    fullName: language === "en" ? "Full name" : "Họ tên",
    email: "Email",
    phone: language === "en" ? "Phone number" : "Số điện thoại",
    avatarUrl:
      language === "en" ? "Avatar image URL" : "Đường dẫn ảnh đại diện",
    avatarNote:
      language === "en"
        ? "You can enter an image URL manually or upload an image above."
        : "Có thể nhập thủ công hoặc chọn ảnh từ máy ở phía trên.",
    role: language === "en" ? "Role" : "Vai trò",
    updateProfile:
      language === "en" ? "Update profile" : "Cập nhật hồ sơ",
    changePassword:
      language === "en" ? "Change password" : "Đổi mật khẩu",
    oldPassword:
      language === "en" ? "Current password" : "Mật khẩu cũ",
    newPassword:
      language === "en" ? "New password" : "Mật khẩu mới",
    confirmNewPassword:
      language === "en" ? "Confirm new password" : "Xác nhận mật khẩu mới",
    enterFullName:
      language === "en" ? "Enter full name" : "Nhập họ tên",
    enterEmail:
      language === "en" ? "Enter email" : "Nhập email",
    enterPhone:
      language === "en" ? "Enter phone number" : "Nhập số điện thoại",
    enterOldPassword:
      language === "en" ? "Enter current password" : "Nhập mật khẩu cũ",
    enterNewPassword:
      language === "en" ? "Enter new password" : "Nhập mật khẩu mới",
    enterConfirmPassword:
      language === "en"
        ? "Re-enter new password"
        : "Nhập lại mật khẩu mới",
    show: language === "en" ? "Show" : "Hiện",
    hide: language === "en" ? "Hide" : "Ẩn",
    loadFailed:
      language === "en"
        ? "Unable to load profile information."
        : "Không thể tải thông tin hồ sơ.",
    uploadSuccess:
      language === "en"
        ? "Avatar uploaded successfully."
        : "Upload ảnh đại diện thành công.",
    uploadFailed:
      language === "en"
        ? "Avatar upload failed."
        : "Upload ảnh đại diện thất bại.",
    requiredProfile:
      language === "en"
        ? "Please enter your full name and email."
        : "Vui lòng nhập họ tên và email.",
    updateSuccess:
      language === "en"
        ? "Profile updated successfully."
        : "Cập nhật hồ sơ thành công.",
    updateFailed:
      language === "en"
        ? "Profile update failed."
        : "Cập nhật hồ sơ thất bại.",
    passwordRequired:
      language === "en"
        ? "Please enter all password information."
        : "Vui lòng nhập đầy đủ thông tin mật khẩu.",
    passwordMinLength:
      language === "en"
        ? "New password must be at least 6 characters."
        : "Mật khẩu mới phải có ít nhất 6 ký tự.",
    passwordNotMatch:
      language === "en"
        ? "Password confirmation does not match."
        : "Mật khẩu xác nhận không khớp.",
    passwordSuccess:
      language === "en"
        ? "Password changed successfully."
        : "Đổi mật khẩu thành công.",
    passwordFailed:
      language === "en"
        ? "Password change failed."
        : "Đổi mật khẩu thất bại.",
  };

  const getApiErrorMessage = (err, fallback) => {
    if (language === "en") {
      return fallback;
    }

    return err.response?.data?.message || err.response?.data?.error || fallback;
  };

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
      setError(getApiErrorMessage(err, text.loadFailed));
    }
  };

  useEffect(() => {
    loadProfile();
  }, [language]);

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

      const updatedUser =
        response.data?.data?.user || response.data?.user || null;

      if (updatedUser) {
        setProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          avatar_url: updatedUser.avatar_url || "",
          role: updatedUser.role || "",
        });

        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      }

      setMessage(text.uploadSuccess);

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      setError(getApiErrorMessage(err, text.uploadFailed));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!profile.name.trim() || !profile.email.trim()) {
        setError(text.requiredProfile);
        return;
      }

      const response = await axiosClient.put("/profile", {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        avatar_url: profile.avatar_url,
      });

      const updatedUser =
        response.data?.data?.user || response.data?.user || null;

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      }

      setMessage(text.updateSuccess);

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(getApiErrorMessage(err, text.updateFailed));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setPasswordMessage("");
      setPasswordError("");

      if (
        !passwordForm.old_password ||
        !passwordForm.new_password ||
        !passwordForm.confirm_password
      ) {
        setPasswordError(text.passwordRequired);
        return;
      }

      if (passwordForm.new_password.length < 6) {
        setPasswordError(text.passwordMinLength);
        return;
      }

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setPasswordError(text.passwordNotMatch);
        return;
      }

      await axiosClient.put("/change-password", passwordForm);

      setPasswordMessage(text.passwordSuccess);

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, text.passwordFailed));
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h2>{text.accountInfo}</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="profile-avatar-preview-box">
              <p>{text.currentAvatar}</p>

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="profile-avatar-preview"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <div className="avatar-upload-area">
                <label className="avatar-upload-btn">
                  {uploadingAvatar ? text.uploadingAvatar : text.chooseImage}

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
              <label>{text.fullName}</label>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder={text.enterFullName}
              />
            </div>

            <div className="form-group">
              <label>{text.email}</label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder={text.enterEmail}
              />
            </div>

            <div className="form-group">
              <label>{text.phone}</label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder={text.enterPhone}
              />
            </div>

            <div className="form-group">
              <label>{text.avatarUrl}</label>

              <input
                type="text"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleProfileChange}
                placeholder="/images/avatars/customer-avatar.jpg"
              />

              <small className="profile-note">{text.avatarNote}</small>
            </div>

            <div className="form-group">
              <label>{text.role}</label>

              <input
                type="text"
                value={
                  profile.role === "admin"
                    ? t.nav.administrator
                    : t.nav.customer
                }
                disabled
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {text.updateProfile}
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h2>{text.changePassword}</h2>

          {passwordMessage && (
            <div className="alert alert-success">{passwordMessage}</div>
          )}

          {passwordError && (
            <div className="alert alert-error">{passwordError}</div>
          )}

          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="form-group">
              <label>{text.oldPassword}</label>

              <div className="password-wrapper">
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  placeholder={text.enterOldPassword}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? text.hide : text.show}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{text.newPassword}</label>

              <div className="password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  placeholder={text.enterNewPassword}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? text.hide : text.show}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{text.confirmNewPassword}</label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder={text.enterConfirmPassword}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? text.hide : text.show}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {text.changePassword}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;