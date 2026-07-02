import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const getPaymentStatus = (booking) => {
    const paymentStatus = String(booking.payment_status || "").toLowerCase();
    const invoiceStatus = String(booking.invoice_status || "").toLowerCase();

    if (paymentStatus === "paid" || invoiceStatus === "paid") {
      return "paid";
    }

    return "unpaid";
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboardResponse = await axiosClient.get("/admin/dashboard");
      const bookingsResponse = await axiosClient.get("/admin/bookings");

      const dashboardStats =
        dashboardResponse.data?.data?.stats ||
        dashboardResponse.data?.data ||
        dashboardResponse.data?.stats ||
        {};

      const bookingList =
        bookingsResponse.data?.data?.bookings ||
        bookingsResponse.data?.bookings ||
        [];

      setStats(dashboardStats);
      setBookings(bookingList);
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thể tải dữ liệu dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalBookings = bookings.length || Number(stats.total_bookings || 0);

  const pendingBookings =
    bookings.length > 0
      ? bookings.filter((booking) => booking.status === "pending").length
      : Number(stats.pending_bookings || 0);

  const confirmedBookings =
    bookings.length > 0
      ? bookings.filter((booking) => booking.status === "confirmed").length
      : Number(stats.confirmed_bookings || 0);

  const cancelledBookings =
    bookings.length > 0
      ? bookings.filter((booking) => booking.status === "cancelled").length
      : Number(stats.cancelled_bookings || 0);

  const paidBookings =
    bookings.length > 0
      ? bookings.filter((booking) => getPaymentStatus(booking) === "paid")
          .length
      : Number(stats.paid_payments || 0);

  const unpaidBookings =
    bookings.length > 0
      ? bookings.filter((booking) => getPaymentStatus(booking) !== "paid")
          .length
      : Number(stats.unpaid_invoices || stats.unpaid || 0);

  const expectedRevenue =
    bookings.length > 0
      ? bookings
          .filter((booking) => booking.status !== "cancelled")
          .reduce((sum, booking) => {
            return sum + Number(booking.total_price || 0);
          }, 0)
      : Number(stats.expected_revenue || 0);

  const paidRevenue =
    bookings.length > 0
      ? bookings
          .filter((booking) => getPaymentStatus(booking) === "paid")
          .reduce((sum, booking) => {
            return sum + Number(booking.total_price || 0);
          }, 0)
      : Number(stats.paid_revenue || 0);

  const totalDiscount =
    bookings.length > 0
      ? bookings.reduce((sum, booking) => {
          return sum + Number(booking.discount_amount || 0);
        }, 0)
      : Number(stats.total_discount || 0);

  const paymentRate =
    totalBookings > 0 ? Math.round((paidBookings / totalBookings) * 100) : 0;

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải dashboard...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <button className="btn btn-dark" onClick={fetchDashboardData}>
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Admin</h2>

          <p className="text-muted mb-0">
            Tổng quan tình hình đặt phòng, thanh toán, doanh thu và hệ thống.
          </p>
        </div>

        <button className="btn btn-dark" onClick={fetchDashboardData}>
          Tải lại
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Khách hàng</p>
              <h3 className="fw-bold mb-0">{stats.total_customers || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Tổng số phòng</p>
              <h3 className="fw-bold mb-0">{stats.total_rooms || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Tổng đơn đặt phòng</p>
              <h3 className="fw-bold mb-0">{totalBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Tỷ lệ thanh toán</p>
              <h3 className="fw-bold text-success mb-0">{paymentRate}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="fw-bold text-warning">{pendingBookings}</h3>
              <p className="mb-0">Đơn chờ xác nhận</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="fw-bold text-success">{confirmedBookings}</h3>
              <p className="mb-0">Đơn đã xác nhận</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body">
              <h3 className="fw-bold text-danger">{cancelledBookings}</h3>
              <p className="mb-0">Đơn đã hủy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Đã thanh toán</p>
              <h3 className="fw-bold text-success mb-0">{paidBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Chưa thanh toán</p>
              <h3 className="fw-bold text-secondary mb-0">{unpaidBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Dịch vụ</p>
              <h3 className="fw-bold mb-0">{stats.total_services || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Mã khuyến mãi</p>
              <h3 className="fw-bold mb-0">{stats.total_promotions || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Doanh thu dự kiến</p>
              <h3 className="fw-bold text-danger">
                {formatMoney(expectedRevenue)}
              </h3>
              <p className="text-muted mb-0">
                Tính theo các đơn chưa bị hủy.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Doanh thu đã thu</p>
              <h3 className="fw-bold text-success">
                {formatMoney(paidRevenue)}
              </h3>
              <p className="text-muted mb-0">
                Tính theo các đơn đã thanh toán.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Tổng tiền giảm giá</p>
              <h3 className="fw-bold text-primary">
                {formatMoney(totalDiscount)}
              </h3>
              <p className="text-muted mb-0">
                Tổng ưu đãi đã áp dụng cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <a
            href="/admin/bookings"
            className="text-decoration-none text-dark"
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="fw-bold">Quản lý đơn đặt phòng</h5>
                <p className="text-muted mb-0">
                  Xem, xác nhận, hủy và in báo cáo booking.
                </p>
              </div>
            </div>
          </a>
        </div>

        <div className="col-md-4">
          <a
            href="/admin/payments"
            className="text-decoration-none text-dark"
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="fw-bold">Quản lý thanh toán</h5>
                <p className="text-muted mb-0">
                  Theo dõi và xác nhận trạng thái thanh toán.
                </p>
              </div>
            </div>
          </a>
        </div>

        <div className="col-md-4">
          <a href="/admin/rooms" className="text-decoration-none text-dark">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <h5 className="fw-bold">Quản lý phòng</h5>
                <p className="text-muted mb-0">
                  Thêm, sửa, xóa và quản lý thông tin phòng.
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;