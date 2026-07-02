import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [servicesByBooking, setServicesByBooking] = useState({});
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatStatus = (status) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "confirmed") return "Đã xác nhận";
    if (status === "cancelled") return "Đã hủy";
    return status || "Không rõ";
  };

  const getStatusClass = (status) => {
    if (status === "pending") return "badge bg-warning text-dark";
    if (status === "confirmed") return "badge bg-success";
    if (status === "cancelled") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const getPaymentStatus = (booking) => {
    return booking.payment_status || booking.invoice_status || "unpaid";
  };

  const formatPaymentStatus = (status) => {
    if (status === "paid") return "Đã thanh toán";
    return "Chưa thanh toán";
  };

  const getPaymentStatusClass = (status) => {
    if (status === "paid") return "badge bg-success";
    return "badge bg-danger";
  };

  const fetchServicesForBookings = async (bookingList) => {
    const result = {};

    await Promise.all(
      bookingList.map(async (booking) => {
        try {
          const response = await axiosClient.get(
            `/bookings/${booking.id}/services`
          );

          result[booking.id] = response.data?.data?.services || [];
        } catch (error) {
          result[booking.id] = [];
        }
      })
    );

    setServicesByBooking(result);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/my-bookings");

      const bookingList =
        response.data?.data?.bookings || response.data?.bookings || [];

      setBookings(bookingList);
      await fetchServicesForBookings(bookingList);
    } catch (error) {
      console.error("Lỗi tải lịch sử đặt phòng:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể tải lịch sử đặt phòng.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Bạn có chắc muốn hủy đơn đặt phòng này không?"
    );

    if (!confirmCancel) return;

    try {
      setMessage("");
      setError("");

      const response = await axiosClient.put(`/my-bookings/${bookingId}/cancel`);

      setMessage(response.data.message || "Hủy đặt phòng thành công.");
      await fetchBookings();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Hủy đặt phòng thất bại. Vui lòng thử lại.";

      setError(errorMessage);
    }
  };

  const handlePay = async (bookingId) => {
    const confirmPay = window.confirm(
      "Bạn có muốn xác nhận đã thanh toán đơn này?"
    );

    if (!confirmPay) return;

    try {
      setMessage("");
      setError("");
      setPayLoading(true);

      const response = await axiosClient.put(`/my-bookings/${bookingId}/paid`);

      setMessage(
        response.data?.message ||
          "Yêu cầu thanh toán đã được gửi. Vui lòng chờ xác nhận từ quản trị viên."
      );
      await fetchBookings();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Thanh toán thất bại. Vui lòng thử lại sau.";

      setError(errorMessage);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải lịch sử đặt phòng...</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Lịch đặt phòng của tôi</h2>
        <p className="text-muted">
          Theo dõi trạng thái đặt phòng và thông tin thanh toán của bạn.
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="alert alert-warning text-center">
          Bạn chưa có đơn đặt phòng nào.
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => {
            const services = servicesByBooking[booking.id] || [];
            const paymentStatus = getPaymentStatus(booking);
            const isPaid = paymentStatus === "paid";
            const isCancelled = booking.status === "cancelled";

            return (
              <div className="col-md-6" key={booking.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {booking.room_title || booking.title}
                        </h5>
                        <p className="text-muted mb-0">Mã đơn: #{booking.id}</p>
                      </div>

                      <span className={getStatusClass(booking.status)}>
                        {formatStatus(booking.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className={getPaymentStatusClass(paymentStatus)}>
                        {formatPaymentStatus(paymentStatus)}
                      </span>
                    </div>

                    <p className="mb-2">
                      <strong>Số phòng:</strong> {booking.room_number}
                    </p>

                    <p className="mb-2">
                      <strong>Loại phòng:</strong> {booking.room_type}
                    </p>

                    <p className="mb-2">
                      <strong>Ngày nhận phòng:</strong> {booking.check_in}
                    </p>

                    <p className="mb-2">
                      <strong>Ngày trả phòng:</strong> {booking.check_out}
                    </p>

                    <p className="mb-2">
                      <strong>Dịch vụ:</strong>
                    </p>

                    {services.length === 0 ? (
                      <p className="text-muted">Không sử dụng dịch vụ thêm</p>
                    ) : (
                      <ul>
                        {services.map((service) => (
                          <li key={service.id}>
                            {service.name} - {formatMoney(service.price)}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="promotion-box mb-3">
                      <p className="mb-1">
                        <strong>Mã giảm giá:</strong>{" "}
                        {booking.promotion_code ? (
                          <span className="badge bg-success">
                            {booking.promotion_code}
                          </span>
                        ) : (
                          <span className="text-muted">Không sử dụng</span>
                        )}
                      </p>

                      <p className="mb-0 text-success">
                        <strong>Số tiền giảm:</strong>{" "}
                        {formatMoney(booking.discount_amount)}
                      </p>
                    </div>

                    <p className="mb-2">
                      <strong>Ghi chú:</strong> {booking.note || "Không có"}
                    </p>

                    <h5 className="text-danger fw-bold mt-3">
                      Tổng tiền sau giảm: {formatMoney(booking.total_price)}
                    </h5>

                    {!isCancelled && (
                       <div className={isPaid ? "alert alert-success mt-3" : "alert alert-info mt-3"}>
                    <h6 className="fw-bold mb-2">
                      {isPaid ? "Thông tin thanh toán" : "Hướng dẫn thanh toán"}
                    </h6>

                    <p className="mb-2">
                      {isPaid
                        ? "Đơn đặt phòng này đã được xác nhận thanh toán. Thông tin thanh toán của đơn như sau:"
                        : "Quý khách vui lòng thanh toán theo một trong hai cách sau:"}
                    </p>

                        <p className="mb-1">
                          <strong>Cách 1:</strong> Thanh toán trực tiếp khi
                          nhận phòng tại khách sạn.
                        </p>

                        <p className="mb-1">
                          <strong>Cách 2:</strong> Chuyển khoản ngân hàng.
                        </p>

                        <div className="bg-white rounded p-3 mt-2 border">
                          <p className="mb-1">
                            <strong>Ngân hàng:</strong> MB Bank
                          </p>
                          <p className="mb-1">
                            <strong>Chủ tài khoản:</strong> DOAN BUI DINH HIEU
                          </p>
                          <p className="mb-1">
                            <strong>Số tài khoản:</strong> 0123456789
                          </p>
                          <p className="mb-1">
                            <strong>Số tiền:</strong>{" "}
                            {formatMoney(booking.total_price)}
                          </p>
                          <p className="mb-0">
                            <strong>Nội dung chuyển khoản:</strong>{" "}
                            BOOKING-{booking.id}
                          </p>
                        </div>

                        <p className="text-muted small mt-2 mb-0">
                          Sau khi thanh toán, vui lòng chờ quản trị viên kiểm
                          tra và xác nhận trạng thái thanh toán.
                        </p>

                        <button
                          className="btn btn-primary mt-3"
                          onClick={() => handlePay(booking.id)}
                          disabled={payLoading}
                        >
                          {payLoading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                        </button>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="alert alert-secondary mt-3 mb-0">
                        Đơn đặt phòng đã bị hủy, không cần thanh toán.
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <button
                        className="btn btn-outline-danger mt-3"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Hủy đặt phòng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;