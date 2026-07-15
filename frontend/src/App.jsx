import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";

import SupportCenter from "./pages/SupportCenter";
import InfoPage from "./pages/InfoPage";
import ForeignerGuide from "./pages/ForeignerGuide";

import AdminDashboard from "./pages/AdminDashboard";
import AdminRooms from "./pages/AdminRooms";
import AdminBookings from "./pages/AdminBookings";
import AdminInvoices from "./pages/AdminInvoices";
import AdminPayments from "./pages/AdminPayments";
import AdminCustomers from "./pages/AdminCustomers";
import AdminServices from "./pages/AdminServices";
import AdminPromotions from "./pages/AdminPromotions";
import AdminAmenities from "./pages/AdminAmenities";
import AdminReviews from "./pages/AdminReviews";
import AdminRoomTypes from "./pages/AdminRoomTypes";
import AdminRoomImages from "./pages/AdminRoomImages";
import AdminSupport from "./pages/AdminSupport";

import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/help" element={<SupportCenter />} />
        <Route path="/info/:type" element={<InfoPage />} />
        <Route path="/foreigner-guide" element={<ForeignerGuide />} />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<AdminRooms />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/promotions" element={<AdminPromotions />} />
        <Route path="/admin/amenities" element={<AdminAmenities />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/room-types" element={<AdminRoomTypes />} />
        <Route path="/admin/room-images" element={<AdminRoomImages />} />
        <Route path="/admin/support" element={<AdminSupport />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </LanguageProvider>
  );
}

export default App;