import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import AdminBookingDetailModal from "../components/AdminBookingDetailModal";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [servicesByBooking, setServicesByBooking] = useState({});
  const [detailBookingId, setDetailBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const getPaymentStatus = (booking) => {
    const paymentStatus = String(booking.payment_status || "").toLowerCase();
    const invoiceStatus = String(booking.invoice_status || "").toLowerCase();

    if (paymentStatus === "paid" || invoiceStatus === "paid") {
      return "paid";
    }

    return "unpaid";
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter((booking) => {
    return booking.status === "pending";
  }).length;

  const confirmedBookings = bookings.filter((booking) => {
    return booking.status === "confirmed";
  }).length;

  const cancelledBookings = bookings.filter((booking) => {
    return booking.status === "cancelled";
  }).length;

  const paidBookings = bookings.filter((booking) => {
    return getPaymentStatus(booking) === "paid";
  }).length;

  const unpaidBookings = bookings.filter((booking) => {
    return getPaymentStatus(booking) !== "paid";
  }).length;

  const paidRevenue = bookings
    .filter((booking) => {
      return getPaymentStatus(booking) === "paid";
    })
    .reduce((sum, booking) => {
      return sum + Number(booking.total_price || 0);
    }, 0);

  const expectedRevenue = bookings.reduce((sum, booking) => {
    return sum + Number(booking.total_price || 0);
  }, 0);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatStatus = (status) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "confirmed") return "Đã xác nhận";
    if (status === "cancelled") return "Đã hủy";
    return status || "Không rõ";
  };

  const formatPaymentStatus = (status) => {
    if (status === "paid") return "Đã thanh toán";
    return "Chưa thanh toán";
  };

  const getStatusClass = (status) => {
    if (status === "pending") return "badge bg-warning text-dark";
    if (status === "confirmed") return "badge bg-success";
    if (status === "cancelled") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const getPaymentClass = (status) => {
    if (status === "paid") return "badge bg-success";
    return "badge bg-secondary";
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

      const response = await axiosClient.get("/admin/bookings");

      const bookingList =
        response.data?.data?.bookings || response.data?.bookings || [];

      setBookings(bookingList);
      await fetchServicesForBookings(bookingList);
    } catch (error) {
      console.error("Lỗi tải danh sách đơn đặt phòng:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thể tải danh sách đơn đặt phòng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleReload = async () => {
    setMessage("");
    setError("");
    await fetchBookings();
  };

  const handleResetFilter = () => {
  setSearchText("");
  setStatusFilter("all");
  setPaymentFilter("all");
  setDateFrom("");
  setDateTo("");
  };

  const handleConfirm = async (bookingId) => {
    const confirmAction = window.confirm(
      "Bạn có chắc muốn xác nhận đơn đặt phòng này không?"
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axiosClient.put(
        `/admin/bookings/${bookingId}/confirm`
      );

      await fetchBookings();

      setMessage(
        response.data?.message || "Xác nhận đơn đặt phòng thành công."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Xác nhận đơn đặt phòng thất bại."
      );
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmAction = window.confirm(
      "Bạn có chắc muốn hủy đơn đặt phòng này không?"
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axiosClient.put(
        `/admin/bookings/${bookingId}/cancel`
      );

      await fetchBookings();

      setMessage(response.data?.message || "Hủy đơn đặt phòng thành công.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Hủy đơn đặt phòng thất bại."
      );
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const keyword = searchText.toLowerCase().trim();
    const paymentStatus = getPaymentStatus(booking);
    const checkInDate = booking.check_in || "";

    const matchSearch =
      keyword === "" ||
      String(booking.id).includes(keyword) ||
      String(booking.customer_name || "").toLowerCase().includes(keyword) ||
      String(booking.customer_email || "").toLowerCase().includes(keyword) ||
      String(booking.customer_phone || "").toLowerCase().includes(keyword) ||
      String(booking.room_title || "").toLowerCase().includes(keyword) ||
      String(booking.room_number || "").toLowerCase().includes(keyword);

    const matchStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const matchPayment =
       paymentFilter === "all" || paymentStatus === paymentFilter;

    const matchDateFrom =
      dateFrom === "" || checkInDate >= dateFrom;

    const matchDateTo =
     dateTo === "" || checkInDate <= dateTo;

return matchSearch && matchStatus && matchPayment && matchDateFrom && matchDateTo;
  });
  const handlePrintReport = () => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Trình duyệt đang chặn cửa sổ in báo cáo.");
    return;
  }

  const rows = filteredBookings
    .map((booking) => {
      const paymentStatus = getPaymentStatus(booking);
      const paymentText =
        paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán";

      return `
        <tr>
          <td>#${booking.id}</td>
          <td>
            <strong>${booking.customer_name || "Chưa có tên"}</strong><br/>
            ${booking.customer_email || "Chưa có email"}<br/>
            ${booking.customer_phone || "Chưa có SĐT"}
          </td>
          <td>
            <strong>${booking.room_title || "Chưa có phòng"}</strong><br/>
            Số phòng: ${booking.room_number || "Không rõ"}<br/>
            Loại: ${booking.room_type || "Không rõ"}
          </td>
          <td>
            Nhận: ${booking.check_in || ""}<br/>
            Trả: ${booking.check_out || ""}
          </td>
          <td>${Number(booking.total_price || 0).toLocaleString("vi-VN")} VNĐ</td>
          <td>${formatStatus(booking.status)}</td>
          <td>${paymentText}</td>
        </tr>
      `;
    })
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Báo cáo đơn đặt phòng</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          h1 {
            text-align: center;
            margin-bottom: 8px;
          }

          .subtitle {
            text-align: center;
            margin-bottom: 24px;
            color: #555;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #111827;
            color: white;
          }

          .summary {
            margin-bottom: 20px;
            font-size: 16px;
          }

          .summary strong {
            color: #dc2626;
          }

          button {
            margin-top: 24px;
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
        <h1>BÁO CÁO ĐƠN ĐẶT PHÒNG</h1>

        <div class="subtitle">
          Ngày in: ${new Date().toLocaleString("vi-VN")}
        </div>

        <div class="summary">
          Tổng số đơn: <strong>${filteredBookings.length}</strong><br/>
          Doanh thu dự kiến: <strong>${formatMoney(expectedRevenue)}</strong><br/>
          Doanh thu đã thu: <strong>${formatMoney(paidRevenue)}</strong>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
            </tr>
          </thead>

          <tbody>
            ${rows || "<tr><td colspan='7'>Không có dữ liệu phù hợp.</td></tr>"}
          </tbody>
        </table>

        <button onclick="window.print()">In báo cáo</button>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải danh sách đơn đặt phòng...</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý đơn đặt phòng</h2>

          <p className="text-muted mb-0">
            Theo dõi, xem chi tiết, xác nhận và hủy các đơn đặt phòng.
          </p>
        </div>

        <div className="d-flex gap-2">
         <button className="btn btn-outline-dark" onClick={handlePrintReport}>
          In báo cáo
         </button>

        <button className="btn btn-dark" onClick={handleReload}>
          Tải lại
        </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Tổng đơn</div>
              <h3 className="fw-bold mb-0">{totalBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Chờ xác nhận</div>
              <h3 className="fw-bold text-warning mb-0">{pendingBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Đã xác nhận</div>
              <h3 className="fw-bold text-success mb-0">
                {confirmedBookings}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Đã hủy</div>
              <h3 className="fw-bold text-danger mb-0">
                {cancelledBookings}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Đã thanh toán</div>
              <h3 className="fw-bold text-success mb-0">{paidBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Chưa thanh toán</div>
              <h3 className="fw-bold text-secondary mb-0">{unpaidBookings}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Doanh thu đã thu</div>
              <h5 className="fw-bold text-success mb-0">
                {formatMoney(paidRevenue)}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Doanh thu dự kiến</div>
              <h5 className="fw-bold text-danger mb-0">
                {formatMoney(expectedRevenue)}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Tìm kiếm và lọc đơn</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Tìm kiếm</label>

              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã đơn, tên khách, email, SĐT, phòng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Trạng thái đơn</label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Thanh toán</label>

              <select
                className="form-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleResetFilter}
              >
                Xóa lọc
              </button>
            </div>
          </div>
          <div className="row g-3 mt-2">
  <div className="col-md-4">
    <label className="form-label fw-semibold">Từ ngày nhận phòng</label>

    <input
      type="date"
      className="form-control"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
    />
  </div>

  <div className="col-md-4">
    <label className="form-label fw-semibold">Đến ngày nhận phòng</label>

    <input
      type="date"
      className="form-control"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
    />
  </div>
</div>

          <div className="text-muted small mt-3">
            Đang hiển thị {filteredBookings.length} / {bookings.length} đơn.
          </div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {filteredBookings.length === 0 ? (
        <div className="alert alert-warning text-center">
          Không có đơn đặt phòng phù hợp.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Thời gian</th>
                <th>Dịch vụ</th>
                <th>Khuyến mãi</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Ghi chú</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => {
                const services = servicesByBooking[booking.id] || [];
                const paymentStatus = getPaymentStatus(booking);

                return (
                  <tr key={booking.id}>
                    <td className="fw-bold">#{booking.id}</td>

                    <td>
                      <div className="fw-semibold">
                        {booking.customer_name || "Chưa có tên"}
                      </div>

                      <div className="text-muted small">
                        {booking.customer_email || "Chưa có email"}
                      </div>

                      <div className="text-muted small">
                        {booking.customer_phone || "Chưa có SĐT"}
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {booking.room_title || booking.title || "Chưa có phòng"}
                      </div>

                      <div className="text-muted small">
                        Số phòng: {booking.room_number || "Không rõ"}
                      </div>

                      <div className="text-muted small">
                        Loại: {booking.room_type || "Không rõ"}
                      </div>
                    </td>

                    <td>
                      <div>
                        Nhận: <strong>{booking.check_in}</strong>
                      </div>

                      <div>
                        Trả: <strong>{booking.check_out}</strong>
                      </div>

                      <div className="text-muted small">
                        Tạo lúc: {booking.created_at}
                      </div>
                    </td>

                    <td>
                      {services.length === 0 ? (
                        <span className="text-muted">
                          Không dùng dịch vụ
                        </span>
                      ) : (
                        <ul className="mb-0 ps-3">
                          {services.map((service) => (
                            <li key={service.id}>
                              {service.name} - {formatMoney(service.price)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

                    <td>
                      {booking.promotion_code ? (
                        <>
                          <span className="badge bg-success">
                            {booking.promotion_code}
                          </span>

                          <div className="text-success small mt-1">
                            Giảm: {formatMoney(booking.discount_amount)}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted">Không sử dụng</span>
                      )}
                    </td>

                    <td className="fw-bold text-danger">
                      {formatMoney(booking.total_price)}
                    </td>

                    <td>
                      <span className={getStatusClass(booking.status)}>
                        {formatStatus(booking.status)}
                      </span>
                    </td>

                    <td>
                      <span className={getPaymentClass(paymentStatus)}>
                        {formatPaymentStatus(paymentStatus)}
                      </span>
                    </td>

                    <td>{booking.note || "Không có"}</td>

                    <td>
                      <div className="d-flex flex-column gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          onClick={() => setDetailBookingId(booking.id)}
                        >
                          Xem chi tiết
                        </button>

                        {booking.status === "pending" ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleConfirm(booking.id)}
                            >
                              Xác nhận
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            Đã xử lý
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailBookingId && (
        <AdminBookingDetailModal
          bookingId={detailBookingId}
          onClose={() => setDetailBookingId(null)}
          onPaidSuccess={fetchBookings}
        />
      )}
    </div>
  );
}

export default AdminBookings;