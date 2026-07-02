import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";


function AdminBookingDetailModal({ bookingId, onClose, onPaidSuccess }) {
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatStatus = (status) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "confirmed") return "Đã xác nhận";
    if (status === "cancelled") return "Đã hủy";
    if (status === "paid") return "Đã thanh toán";
    if (status === "unpaid") return "Chưa thanh toán";
    return status || "Chưa có";
  };

  const calculateNights = () => {
    if (!booking?.check_in || !booking?.check_out) return 0;

    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);

    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get(`/admin/bookings/${bookingId}`);

      setBooking(response.data?.data?.booking || null);
      setServices(response.data?.data?.services || []);
      setPayment(response.data?.data?.payment || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Không thể tải chi tiết đơn đặt phòng."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    const confirmAction = window.confirm(
      "Bạn có chắc muốn đánh dấu đơn này là đã thanh toán không?"
    );

    if (!confirmAction) return;

    try {
      setError("");

      await axiosClient.put(`/admin/bookings/${bookingId}/paid`);

      await loadDetail();

      if (onPaidSuccess) {
        await onPaidSuccess();
      }

      alert("Cập nhật thanh toán thành công.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Cập nhật thanh toán thất bại."
      );
    }
  };

  const handlePrintInvoice = () => {
    if (!booking) return;

    const invoiceWindow = window.open("", "_blank");

    if (!invoiceWindow) {
      alert("Trình duyệt đang chặn cửa sổ in hóa đơn.");
      return;
    }

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn #${booking.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
            }

            .invoice {
              max-width: 800px;
              margin: auto;
              border: 1px solid #ddd;
              padding: 30px;
            }

            h1 {
              text-align: center;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }

            .total {
              color: red;
              font-size: 22px;
              font-weight: bold;
            }

            button {
              margin-top: 25px;
              padding: 10px 18px;
              background: #111827;
              color: white;
              border: none;
              cursor: pointer;
            }

            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="invoice">
            <h1>HÓA ĐƠN ĐẶT PHÒNG</h1>

            <div class="row">
              <span>Mã đơn</span>
              <strong>#${booking.id}</strong>
            </div>

            <div class="row">
              <span>Khách hàng</span>
              <strong>${booking.customer_name || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Email</span>
              <strong>${booking.customer_email || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Phòng</span>
              <strong>${booking.room_title || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Số phòng</span>
              <strong>${booking.room_number || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Ngày nhận phòng</span>
              <strong>${booking.check_in || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Ngày trả phòng</span>
              <strong>${booking.check_out || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Số đêm</span>
              <strong>${calculateNights()} đêm</strong>
            </div>

            <div class="row">
              <span>Mã hóa đơn</span>
              <strong>${booking.invoice_code || "Chưa tạo"}</strong>
            </div>

            <div class="row">
              <span>Trạng thái</span>
              <strong>${formatStatus(booking.invoice_status)}</strong>
            </div>

            <div class="row">
              <span>Phương thức thanh toán</span>
              <strong>${payment?.payment_method || "Chưa có"}</strong>
            </div>

            <div class="row">
              <span>Giảm giá</span>
              <strong>${formatMoney(booking.discount_amount)}</strong>
            </div>

            <div class="row total">
              <span>Tổng tiền</span>
              <strong>${formatMoney(booking.total_price)}</strong>
            </div>

            <button onclick="window.print()">In hóa đơn</button>
          </div>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
  };

  useEffect(() => {
    loadDetail();
  }, [bookingId]);

  return (
    <div className="admin-booking-modal-overlay">
      <div className="admin-booking-modal">
        <button
          type="button"
          className="admin-booking-modal-close"
          onClick={onClose}
        >
          ×
        </button>

        {loading && (
          <div className="text-center py-5">
            <h4>Đang tải chi tiết đơn...</h4>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!loading && !error && booking && (
          <>
            <div className="admin-booking-modal-header">
              <h2>Chi tiết đơn đặt phòng #{booking.id}</h2>
              <p>Thông tin khách hàng, phòng, dịch vụ và thanh toán.</p>
            </div>

            <div className="admin-booking-detail-grid">
              <div className="admin-booking-detail-card">
                <h3>Khách hàng</h3>

                <div className="admin-detail-row">
                  <span>Họ tên</span>
                  <strong>{booking.customer_name || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Email</span>
                  <strong>{booking.customer_email || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Số điện thoại</span>
                  <strong>{booking.customer_phone || "Chưa có"}</strong>
                </div>
              </div>

              <div className="admin-booking-detail-card">
                <h3>Thông tin phòng</h3>

                <div className="admin-detail-row">
                  <span>Tên phòng</span>
                  <strong>{booking.room_title || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Số phòng</span>
                  <strong>{booking.room_number || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Loại phòng</span>
                  <strong>{booking.room_type || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Giá phòng</span>
                  <strong>{formatMoney(booking.room_price)} / đêm</strong>
                </div>
              </div>

              <div className="admin-booking-detail-card">
                <h3>Thời gian đặt</h3>

                <div className="admin-detail-row">
                  <span>Ngày nhận</span>
                  <strong>{booking.check_in || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Ngày trả</span>
                  <strong>{booking.check_out || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Số đêm</span>
                  <strong>{calculateNights()} đêm</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Trạng thái</span>
                  <strong>{formatStatus(booking.status)}</strong>
                </div>
              </div>

              <div className="admin-booking-detail-card">
                <h3>Dịch vụ</h3>

                {services.length === 0 ? (
                  <p className="text-muted">Không dùng dịch vụ thêm.</p>
                ) : (
                  services.map((service) => (
                    <div className="admin-detail-row" key={service.id}>
                      <span>{service.name}</span>
                      <strong>{formatMoney(service.price)}</strong>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-booking-detail-card">
                <h3>Khuyến mãi</h3>

                <div className="admin-detail-row">
                  <span>Mã giảm giá</span>
                  <strong>{booking.promotion_code || "Không sử dụng"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Số tiền giảm</span>
                  <strong>{formatMoney(booking.discount_amount)}</strong>
                </div>
              </div>

              <div className="admin-booking-detail-card total-card">
                <h3>Thanh toán</h3>

                <div className="admin-detail-row">
                  <span>Mã hóa đơn</span>
                  <strong>{booking.invoice_code || "Chưa tạo"}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Trạng thái hóa đơn</span>
                  <strong>{formatStatus(booking.invoice_status)}</strong>
                </div>

                <div className="admin-detail-row">
                  <span>Phương thức</span>
                  <strong>{payment?.payment_method || "Chưa có"}</strong>
                </div>

                <div className="admin-detail-row total-row">
                  <span>Tổng tiền</span>
                  <strong>{formatMoney(booking.total_price)}</strong>
                </div>

                {booking.status === "confirmed" &&
                  booking.invoice_status !== "paid" && (
                    <button
                      type="button"
                      className="btn btn-success mt-3"
                      onClick={handleMarkPaid}
                    >
                      Xác nhận đã thanh toán
                    </button>
                  )}

                {booking.invoice_status === "paid" && (
                  <>
                    <div className="alert alert-success mt-3 mb-0">
                      Đơn này đã được thanh toán.
                    </div>

                    <button
                      type="button"
                      className="btn btn-dark mt-3"
                      onClick={handlePrintInvoice}
                    >
                      In hóa đơn
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="admin-booking-note">
              <strong>Ghi chú:</strong> {booking.note || "Không có"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminBookingDetailModal;