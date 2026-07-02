import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchInvoices = async () => {
    try {
      const response = await axiosClient.get("/admin/invoices");
      setInvoices(response.data.data.invoices);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể tải danh sách hóa đơn."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (id) => {
    const confirmAction = window.confirm(
      "Bạn có chắc chắn muốn cập nhật hóa đơn này thành đã thanh toán?"
    );

    if (!confirmAction) {
      return;
    }

    try {
      await axiosClient.put(`/admin/invoices/${id}/paid`);
      alert("Cập nhật hóa đơn đã thanh toán thành công.");
      fetchInvoices();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Cập nhật trạng thái hóa đơn thất bại."
      );
    }
  };

  const renderPaymentStatus = (status) => {
    if (status === "paid") {
      return <span className="badge bg-success">Đã thanh toán</span>;
    }

    return <span className="badge bg-danger">Chưa thanh toán</span>;
  };

  const formatMoney = (value) => {
    return Number(value).toLocaleString("vi-VN") + " VNĐ";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải danh sách hóa đơn...</h4>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{message}</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold">Quản lý hóa đơn</h2>
        <p className="text-muted">
          Admin có thể theo dõi hóa đơn được tạo sau khi xác nhận đơn đặt phòng.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="alert alert-info">
          Chưa có hóa đơn nào trong hệ thống. Hóa đơn sẽ được tạo sau khi admin
          xác nhận đơn đặt phòng.
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Thời gian ở</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoice.invoice_code}</strong>
                    </td>

                    <td>
                      <strong>{invoice.customer_name}</strong>
                      <br />
                      <span className="text-muted small">
                        {invoice.customer_email}
                      </span>
                    </td>

                    <td>
                      <strong>{invoice.room_title}</strong>
                      <br />
                      <span className="text-muted small">
                        Số phòng: {invoice.room_number}
                      </span>
                    </td>

                    <td>
                      {invoice.check_in}
                      <br />
                      <span className="text-muted small">
                        đến {invoice.check_out}
                      </span>
                    </td>

                    <td className="fw-bold text-danger">
                      {formatMoney(invoice.amount)}
                    </td>

                    <td>{renderPaymentStatus(invoice.payment_status)}</td>

                    <td>{invoice.created_at}</td>

                    <td>
                      {invoice.payment_status === "unpaid" ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          Đã thanh toán
                        </button>
                      ) : (
                        <span className="text-muted">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvoices;