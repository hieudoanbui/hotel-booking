import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../i18n/LanguageContext";
import "./Navbar.css";

function Navbar() {
  const { t, setLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const [openUserMenu, setOpenUserMenu] = useState(false);

  let user = null;

  try {
    user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("authUser") || "null");
  } catch (error) {
    user = null;
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  const adminMenu = {
    dashboard: language === "en" ? "Dashboard" : "Dashboard",
    rooms: language === "en" ? "Manage rooms" : "Quản lý phòng",
    bookings: language === "en" ? "Bookings" : "Đơn đặt phòng",
    payments: language === "en" ? "Payments" : "Thanh toán",
    invoices: language === "en" ? "Invoices" : "Hóa đơn",
    customers: language === "en" ? "Customers" : "Khách hàng",
    services: language === "en" ? "Services" : "Dịch vụ",
    promotions: language === "en" ? "Promotions" : "Khuyến mãi",
    amenities: language === "en" ? "Amenities" : "Tiện nghi",
    roomTypes: language === "en" ? "Room types" : "Loại phòng",
    roomImages: language === "en" ? "Room images" : "Ảnh phòng",
    reviews: language === "en" ? "Reviews" : "Đánh giá",
    support: language === "en" ? "Customer support" : "Hỗ trợ khách hàng",
  };

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

  const openForeignerGuide = () => {
    setLanguage("en");
    closeUserMenu();
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.log("Logout API error:", error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedPromotionCode");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("token");

    setOpenUserMenu(false);
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <Link
          to={isAdmin ? "/admin/dashboard" : "/"}
          className="app-navbar-logo"
          onClick={closeUserMenu}
        >
          Hotel Booking
        </Link>

        <div className="app-navbar-center">
          <Link to="/" className="app-nav-link" onClick={closeUserMenu}>
            {t.nav.home}
          </Link>

          <Link to="/rooms" className="app-nav-link" onClick={closeUserMenu}>
            {t.nav.rooms}
          </Link>

          {!isAdmin && (
            <>
              <Link
                to="/foreigner-guide"
                className="app-nav-link"
                onClick={openForeignerGuide}
              >
                {t.nav.foreignerGuide}
              </Link>

              <Link
                to="/help"
                className="app-nav-link"
                onClick={closeUserMenu}
              >
                {t.nav.help}
              </Link>
            </>
          )}

          {isLoggedIn && !isAdmin && (
            <Link
              to="/my-bookings"
              className="app-nav-link"
              onClick={closeUserMenu}
            >
              {t.nav.myBookings}
            </Link>
          )}

          {isLoggedIn && isAdmin && (
            <div className="admin-dropdown">
              <button type="button" className="admin-dropdown-btn">
                {t.nav.admin}
              </button>

              <div className="admin-dropdown-menu">
                <Link to="/admin/dashboard" onClick={closeUserMenu}>
                  {adminMenu.dashboard}
                </Link>

                <Link to="/admin/rooms" onClick={closeUserMenu}>
                  {adminMenu.rooms}
                </Link>

                <Link to="/admin/bookings" onClick={closeUserMenu}>
                  {adminMenu.bookings}
                </Link>

                <Link to="/admin/payments" onClick={closeUserMenu}>
                  {adminMenu.payments}
                </Link>

                <Link to="/admin/invoices" onClick={closeUserMenu}>
                  {adminMenu.invoices}
                </Link>

                <Link to="/admin/customers" onClick={closeUserMenu}>
                  {adminMenu.customers}
                </Link>

                <Link to="/admin/services" onClick={closeUserMenu}>
                  {adminMenu.services}
                </Link>

                <Link to="/admin/promotions" onClick={closeUserMenu}>
                  {adminMenu.promotions}
                </Link>

                <Link to="/admin/amenities" onClick={closeUserMenu}>
                  {adminMenu.amenities}
                </Link>

                <Link to="/admin/room-types" onClick={closeUserMenu}>
                  {adminMenu.roomTypes}
                </Link>

                <Link to="/admin/room-images" onClick={closeUserMenu}>
                  {adminMenu.roomImages}
                </Link>

                <Link to="/admin/reviews" onClick={closeUserMenu}>
                  {adminMenu.reviews}
                </Link>

                <Link to="/admin/support" onClick={closeUserMenu}>
                  {adminMenu.support}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="app-navbar-right">
          <LanguageSelector />

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

                <span className="user-avatar-name">{user?.name || "User"}</span>
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
                      <p>
                        {user?.email ||
                          (language === "en" ? "No email" : "Chưa có email")}
                      </p>
                      <span>
                        {isAdmin ? t.nav.administrator : t.nav.customer}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="user-menu-item"
                    onClick={closeUserMenu}
                  >
                    {t.nav.profile}
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="user-menu-item"
                        onClick={closeUserMenu}
                      >
                        {t.nav.adminPage}
                      </Link>

                      <Link
                        to="/admin/support"
                        className="user-menu-item"
                        onClick={closeUserMenu}
                      >
                        {t.nav.support}
                      </Link>
                    </>
                  )}

                  {!isAdmin && (
                    <>
                      <Link
                        to="/my-bookings"
                        className="user-menu-item"
                        onClick={closeUserMenu}
                      >
                        {t.nav.myBookings}
                      </Link>

                      <Link
                        to="/foreigner-guide"
                        className="user-menu-item"
                        onClick={openForeignerGuide}
                      >
                        {t.nav.foreignerGuide}
                      </Link>

                      <Link
                        to="/help"
                        className="user-menu-item"
                        onClick={closeUserMenu}
                      >
                        {t.nav.help}
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    className="user-menu-item logout-menu-item"
                    onClick={handleLogout}
                  >
                    {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="app-login-btn">
                {t.nav.login}
              </Link>

              <Link to="/register" className="app-register-btn">
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;