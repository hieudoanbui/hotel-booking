import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function MyBookings() {
  const { t, language } = useLanguage();

  const [bookings, setBookings] = useState([]);
  const [servicesByBooking, setServicesByBooking] = useState({});
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const text = {
    title: language === "en" ? "My bookings" : "Lịch đặt phòng của tôi",
    subtitle:
      language === "en"
        ? "Track your booking status and payment information."
        : "Theo dõi trạng thái đặt phòng và thông tin thanh toán của bạn.",
    loading:
      language === "en"
        ? "Loading booking history..."
        : "Đang tải lịch sử đặt phòng...",
    loadFailed:
      language === "en"
        ? "Unable to load booking history."
        : "Không thể tải lịch sử đặt phòng.",
    noBookings:
      language === "en"
        ? "You do not have any bookings yet."
        : "Bạn chưa có đơn đặt phòng nào.",
    bookingId: language === "en" ? "Booking ID" : "Mã đơn",
    roomNumber: language === "en" ? "Room number" : "Số phòng",
    roomType: language === "en" ? "Room type" : "Loại phòng",
    checkIn: language === "en" ? "Check-in date" : "Ngày nhận phòng",
    checkOut: language === "en" ? "Check-out date" : "Ngày trả phòng",
    services: language === "en" ? "Services" : "Dịch vụ",
    noExtraService:
      language === "en"
        ? "No extra services used"
        : "Không sử dụng dịch vụ thêm",
    promotionCode: language === "en" ? "Promotion code" : "Mã giảm giá",
    noPromotion: language === "en" ? "Not used" : "Không sử dụng",
    discountAmount: language === "en" ? "Discount amount" : "Số tiền giảm",
    note: language === "en" ? "Note" : "Ghi chú",
    noNote: language === "en" ? "No note" : "Không có",
    totalAfterDiscount:
      language === "en" ? "Total after discount" : "Tổng tiền sau giảm",
    paymentInfo:
      language === "en" ? "Payment information" : "Thông tin thanh toán",
    paymentGuide:
      language === "en" ? "Payment instructions" : "Hướng dẫn thanh toán",
    paidDesc:
      language === "en"
        ? "This booking has been confirmed as paid. Payment information is shown below:"
        : "Đơn đặt phòng này đã được xác nhận thanh toán. Thông tin thanh toán của đơn như sau:",
    unpaidDesc:
      language === "en"
        ? "Please pay using one of the following methods:"
        : "Quý khách vui lòng thanh toán theo một trong hai cách sau:",
    method1: language === "en" ? "Method 1" : "Cách 1",
    method2: language === "en" ? "Method 2" : "Cách 2",
    payAtHotel:
      language === "en"
        ? "Pay directly at the hotel when checking in."
        : "Thanh toán trực tiếp khi nhận phòng tại khách sạn.",
    bankTransfer:
      language === "en" ? "Bank transfer." : "Chuyển khoản ngân hàng.",
    bank: language === "en" ? "Bank" : "Ngân hàng",
    accountHolder: language === "en" ? "Account holder" : "Chủ tài khoản",
    accountNumber: language === "en" ? "Account number" : "Số tài khoản",
    amount: language === "en" ? "Amount" : "Số tiền",
    transferContent:
      language === "en" ? "Transfer content" : "Nội dung chuyển khoản",
    waitAdmin:
      language === "en"
        ? "After payment, please wait for the administrator to check and confirm your payment status."
        : "Sau khi thanh toán, vui lòng chờ quản trị viên kiểm tra và xác nhận trạng thái thanh toán.",
    confirmPaid:
      language === "en" ? "Confirm that I have paid" : "Xác nhận đã thanh toán",
    processing: language === "en" ? "Processing..." : "Đang xử lý...",
    cancelledNotice:
      language === "en"
        ? "This booking has been cancelled. No payment is required."
        : "Đơn đặt phòng đã bị hủy, không cần thanh toán.",
    cancelBooking:
      language === "en" ? "Cancel booking" : "Hủy đặt phòng",
    confirmCancel:
      language === "en"
        ? "Are you sure you want to cancel this booking?"
        : "Bạn có chắc muốn hủy đơn đặt phòng này không?",
    confirmPay:
      language === "en"
        ? "Do you want to confirm that you have paid this booking?"
        : "Bạn có muốn xác nhận đã thanh toán đơn này?",
    cancelSuccess:
      language === "en"
        ? "Booking cancelled successfully."
        : "Hủy đặt phòng thành công.",
    cancelFailed:
      language === "en"
        ? "Booking cancellation failed. Please try again."
        : "Hủy đặt phòng thất bại. Vui lòng thử lại.",
    paymentSuccess:
      language === "en"
        ? "Payment request has been sent. Please wait for administrator confirmation."
        : "Yêu cầu thanh toán đã được gửi. Vui lòng chờ xác nhận từ quản trị viên.",
    paymentFailed:
      language === "en"
        ? "Payment request failed. Please try again later."
        : "Thanh toán thất bại. Vui lòng thử lại sau.",
    pending: language === "en" ? "Pending" : "Chờ xác nhận",
    confirmed: language === "en" ? "Confirmed" : "Đã xác nhận",
    cancelled: language === "en" ? "Cancelled" : "Đã hủy",
    completed: language === "en" ? "Completed" : "Hoàn thành",
    unknown: language === "en" ? "Unknown" : "Không rõ",
    paid: language === "en" ? "Paid" : "Đã thanh toán",
    unpaid: language === "en" ? "Unpaid" : "Chưa thanh toán",
    pendingPayment:
      language === "en" ? "Pending payment confirmation" : "Chờ xác nhận thanh toán",
  };

  const formatMoney = (value) => {
    const locale = language === "en" ? "en-US" : "vi-VN";
    return `${Number(value || 0).toLocaleString(locale)} VND`;
  };

  const formatStatus = (status) => {
    if (status === "pending") return text.pending;
    if (status === "confirmed") return text.confirmed;
    if (status === "cancelled") return text.cancelled;
    if (status === "completed") return text.completed;
    return status || text.unknown;
  };

  const getStatusClass = (status) => {
    if (status === "pending") return "badge bg-warning text-dark";
    if (status === "confirmed") return "badge bg-success";
    if (status === "cancelled") return "badge bg-danger";
    if (status === "completed") return "badge bg-primary";
    return "badge bg-secondary";
  };

  const getPaymentStatus = (booking) => {
    return booking.payment_status || booking.invoice_status || "unpaid";
  };

  const formatPaymentStatus = (status) => {
    if (status === "paid") return text.paid;
    if (status === "pending") return text.pendingPayment;
    return text.unpaid;
  };

  const getPaymentStatusClass = (status) => {
    if (status === "paid") return "badge bg-success";
    if (status === "pending") return "badge bg-warning text-dark";
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
      console.error("Booking history loading error:", error);

      const errorMessage =
        language === "en"
          ? text.loadFailed
          : error.response?.data?.message ||
            error.response?.data?.error ||
            text.loadFailed;

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [language]);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(text.confirmCancel);

    if (!confirmCancel) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await axiosClient.put(`/my-bookings/${bookingId}/cancel`);

      const successMessage =
        language === "en"
          ? text.cancelSuccess
          : response.data?.message || text.cancelSuccess;

      setMessage(successMessage);
      await fetchBookings();
    } catch (error) {
      const errorMessage =
        language === "en"
          ? text.cancelFailed
          : error.response?.data?.message || text.cancelFailed;

      setError(errorMessage);
    }
  };

  const handlePay = async (bookingId) => {
    const confirmPay = window.confirm(text.confirmPay);

    if (!confirmPay) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setPayLoading(true);

      const response = await axiosClient.put(`/my-bookings/${bookingId}/paid`);

      const successMessage =
        language === "en"
          ? text.paymentSuccess
          : response.data?.message || text.paymentSuccess;

      setMessage(successMessage);
      await fetchBookings();
    } catch (error) {
      const errorMessage =
        language === "en"
          ? text.paymentFailed
          : error.response?.data?.message || text.paymentFailed;

      setError(errorMessage);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h4>{text.loading}</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">{text.title}</h2>

        <p className="text-muted">{text.subtitle}</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="alert alert-warning text-center">
          {text.noBookings}
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

                        <p className="text-muted mb-0">
                          {text.bookingId}: #{booking.id}
                        </p>
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
                      <strong>{text.roomNumber}:</strong>{" "}
                      {booking.room_number}
                    </p>

                    <p className="mb-2">
                      <strong>{text.roomType}:</strong> {booking.room_type}
                    </p>

                    <p className="mb-2">
                      <strong>{text.checkIn}:</strong> {booking.check_in}
                    </p>

                    <p className="mb-2">
                      <strong>{text.checkOut}:</strong> {booking.check_out}
                    </p>

                    <p className="mb-2">
                      <strong>{text.services}:</strong>
                    </p>

                    {services.length === 0 ? (
                      <p className="text-muted">{text.noExtraService}</p>
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
                        <strong>{text.promotionCode}:</strong>{" "}
                        {booking.promotion_code ? (
                          <span className="badge bg-success">
                            {booking.promotion_code}
                          </span>
                        ) : (
                          <span className="text-muted">{text.noPromotion}</span>
                        )}
                      </p>

                      <p className="mb-0 text-success">
                        <strong>{text.discountAmount}:</strong>{" "}
                        {formatMoney(booking.discount_amount)}
                      </p>
                    </div>

                    <p className="mb-2">
                      <strong>{text.note}:</strong>{" "}
                      {booking.note || text.noNote}
                    </p>

                    <h5 className="text-danger fw-bold mt-3">
                      {text.totalAfterDiscount}:{" "}
                      {formatMoney(booking.total_price)}
                    </h5>

                    {!isCancelled && (
                      <div
                        className={
                          isPaid
                            ? "alert alert-success mt-3"
                            : "alert alert-info mt-3"
                        }
                      >
                        <h6 className="fw-bold mb-2">
                          {isPaid ? text.paymentInfo : text.paymentGuide}
                        </h6>

                        <p className="mb-2">
                          {isPaid ? text.paidDesc : text.unpaidDesc}
                        </p>

                        <p className="mb-1">
                          <strong>{text.method1}:</strong> {text.payAtHotel}
                        </p>

                        <p className="mb-1">
                          <strong>{text.method2}:</strong> {text.bankTransfer}
                        </p>

                        <div className="bg-white rounded p-3 mt-2 border">
                          <p className="mb-1">
                            <strong>{text.bank}:</strong> MB Bank
                          </p>

                          <p className="mb-1">
                            <strong>{text.accountHolder}:</strong>{" "}
                            DOAN BUI DINH HIEU
                          </p>

                          <p className="mb-1">
                            <strong>{text.accountNumber}:</strong> 0123456789
                          </p>

                          <p className="mb-1">
                            <strong>{text.amount}:</strong>{" "}
                            {formatMoney(booking.total_price)}
                          </p>

                          <p className="mb-0">
                            <strong>{text.transferContent}:</strong>{" "}
                            BOOKING-{booking.id}
                          </p>
                        </div>

                        <p className="text-muted small mt-2 mb-0">
                          {text.waitAdmin}
                        </p>

                        {!isPaid && (
                          <button
                            className="btn btn-primary mt-3"
                            onClick={() => handlePay(booking.id)}
                            disabled={payLoading}
                          >
                            {payLoading ? text.processing : text.confirmPaid}
                          </button>
                        )}
                      </div>
                    )}

                    {isCancelled && (
                      <div className="alert alert-secondary mt-3 mb-0">
                        {text.cancelledNotice}
                      </div>
                    )}

                    {booking.status === "pending" && (
                      <button
                        className="btn btn-outline-danger mt-3"
                        onClick={() => handleCancel(booking.id)}
                      >
                        {text.cancelBooking}
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