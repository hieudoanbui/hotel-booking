import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function Navbar() {
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    user = null;
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  const getAvatarText = () => {
    if (!user || !user.name) {
      return "U";
    }

    const nameParts = user.name.trim().split(" ");
    const lastName = nameParts[nameParts.length - 1];

    return lastName.charAt(0).toUpperCase();
  };

  const closeUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.log("Logout API error:", error);
    }

    localStorage.removeItem("user");
    setOpenUserMenu(false);
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <Link to="/" className="app-navbar-logo" onClick={closeUserMenu}>
          Hotel Booking
        </Link>

        <div className="app-navbar-center">
          <Link to="/" className="app-nav-link" onClick={closeUserMenu}>
            Trang chủ
          </Link>

          <Link to="/rooms" className="app-nav-link" onClick={closeUserMenu}>
            Phòng
          </Link>

          {isLoggedIn && !isAdmin && (
            <Link
              to="/my-bookings"
              className="app-nav-link"
              onClick={closeUserMenu}
            >
              Đơn của tôi
            </Link>
          )}

          {isLoggedIn && isAdmin && (
            <div className="admin-dropdown">
              <button type="button" className="admin-dropdown-btn">
                Quản trị
              </button>

              <div className="admin-dropdown-menu">
                <Link to="/admin/dashboard" onClick={closeUserMenu}>
                  Dashboard
                </Link>

                <Link to="/admin/rooms" onClick={closeUserMenu}>
                  Quản lý phòng
                </Link>

                <Link to="/admin/bookings" onClick={closeUserMenu}>
                  Đơn đặt phòng
                </Link>

                <Link to="/admin/payments" onClick={closeUserMenu}>
                  Thanh toán
                </Link>

                <Link to="/admin/invoices" onClick={closeUserMenu}>
                  Hóa đơn
                </Link>

                <Link to="/admin/customers" onClick={closeUserMenu}>
                  Khách hàng
                </Link>

                <Link to="/admin/services" onClick={closeUserMenu}>
                  Dịch vụ
                </Link>

                <Link to="/admin/promotions" onClick={closeUserMenu}>
                  Khuyến mãi
                </Link>

                <Link to="/admin/amenities" onClick={closeUserMenu}>
                  Tiện nghi
                </Link>

                <Link to="/admin/room-types" onClick={closeUserMenu}>
                  Loại phòng
                </Link>

                <Link to="/admin/room-images" onClick={closeUserMenu}>
                  Ảnh phòng
                </Link>

                <Link to="/admin/reviews" onClick={closeUserMenu}>
                  Đánh giá
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="app-navbar-right">
          {isLoggedIn ? (
            <div className="user-avatar-dropdown">
              <button
                type="button"
                className="user-avatar-button"
                onClick={() => setOpenUserMenu(!openUserMenu)}
              >
                <span className="user-avatar-circle">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="user-avatar-img"
                    />
                  ) : (
                    getAvatarText()
                  )}
                </span>

                <span className="user-avatar-name">
                  {user?.name || "User"}
                </span>
              </button>

              {openUserMenu && (
                <div className="user-avatar-menu">
                  <div className="user-avatar-info">
                    <div className="user-avatar-big">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="user-avatar-img"
                        />
                      ) : (
                        getAvatarText()
                      )}
                    </div>

                    <div>
                      <strong>{user?.name || "User"}</strong>
                      <p>{user?.email || "Chưa có email"}</p>
                      <span>
                        {isAdmin ? "Quản trị viên" : "Khách hàng"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="user-menu-item"
                    onClick={closeUserMenu}
                  >
                    Hồ sơ cá nhân
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="user-menu-item"
                      onClick={closeUserMenu}
                    >
                      Trang quản trị
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link
                      to="/my-bookings"
                      className="user-menu-item"
                      onClick={closeUserMenu}
                    >
                      Đơn của tôi
                    </Link>
                  )}

                  <button
                    type="button"
                    className="user-menu-item logout-menu-item"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="app-login-btn">
                Đăng nhập
              </Link>

              <Link to="/register" className="app-register-btn">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;