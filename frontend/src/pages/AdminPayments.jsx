import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatPaymentMethod = (method) => {
    if (method === "cash") return "Tiền mặt";
    if (method === "bank_transfer") return "Chuyển khoản";
    if (method === "credit_card") return "Thẻ tín dụng";
    return method;
  };

  const formatPaymentStatus = (status) => {
    if (status === "pending") return "Chờ thanh toán";
    if (status === "paid") return "Đã thanh toán";
    if (status === "failed") return "Thanh toán thất bại";
    return status;
  };

  const getPaymentStatusClass = (status) => {
    if (status === "pending") return "badge bg-warning text-dark";
    if (status === "paid") return "badge bg-success";
    if (status === "failed") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const formatBookingStatus = (status) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "confirmed") return "Đã xác nhận";
    if (status === "cancelled") return "Đã hủy";
    return status;
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/payments");
      const paymentList = response.data?.data?.payments || [];

      setPayments(paymentList);
    } catch (error) {
      console.error("Lỗi tải thanh toán:", error);

      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách thanh toán."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkAsPaid = async (paymentId) => {
    const confirmAction = window.confirm(
      "Bạn có chắc muốn xác nhận khoản thanh toán này không?"
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axiosClient.put(
        `/admin/payments/${paymentId}/paid`
      );

      setMessage(response.data.message || "Đã xác nhận thanh toán.");
      await fetchPayments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Cập nhật trạng thái thanh toán thất bại."
      );
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải danh sách thanh toán...</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý thanh toán</h2>
          <p className="text-muted mb-0">
            Theo dõi và xác nhận trạng thái thanh toán của các đơn đặt phòng.
          </p>
        </div>

        <button className="btn btn-dark" onClick={fetchPayments}>
          Tải lại
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {payments.length === 0 ? (
        <div className="alert alert-warning text-center">
          Chưa có dữ liệu thanh toán.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Mã TT</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Thời gian đặt</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>

                  <td>
                    <strong>#{payment.booking_id}</strong>
                    <div className="text-muted small">
                      {formatBookingStatus(payment.booking_status)}
                    </div>
                  </td>

                  <td>
                    <div className="fw-semibold">{payment.customer_name}</div>
                    <div className="text-muted small">
                      {payment.customer_email}
                    </div>
                  </td>

                  <td>
                    <div className="fw-semibold">{payment.room_title}</div>
                    <div className="text-muted small">
                      Số phòng: {payment.room_number}
                    </div>
                  </td>

                  <td>
                    <div>
                      Nhận: <strong>{payment.check_in}</strong>
                    </div>
                    <div>
                      Trả: <strong>{payment.check_out}</strong>
                    </div>
                    <div className="text-muted small">
                      Tạo lúc: {payment.created_at}
                    </div>
                  </td>

                  <td>{formatPaymentMethod(payment.payment_method)}</td>

                  <td className="fw-bold text-danger">
                    {formatMoney(payment.amount)}
                  </td>

                  <td>
                    <span
                      className={getPaymentStatusClass(
                        payment.payment_status
                      )}
                    >
                      {formatPaymentStatus(payment.payment_status)}
                    </span>

                    {payment.paid_at && (
                      <div className="text-muted small mt-1">
                        Thanh toán lúc: {payment.paid_at}
                      </div>
                    )}
                  </td>

                  <td>
                    {payment.payment_status === "pending" ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                      >
                        Xác nhận đã thanh toán
                      </button>
                    ) : (
                      <span className="text-muted">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;