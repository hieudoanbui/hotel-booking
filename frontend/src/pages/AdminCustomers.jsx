import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/customers");

      const data =
        response.data?.data?.customers ||
        response.data?.customers ||
        [];

      setCustomers(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách khách hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.name || !form.email) {
        setError("Vui lòng nhập họ tên và email.");
        return;
      }

      if (!editingId && !form.password) {
        setError("Vui lòng nhập mật khẩu cho khách hàng mới.");
        return;
      }

      if (editingId) {
        await axiosClient.put(`/admin/customers/${editingId}`, form);
        setMessage("Cập nhật khách hàng thành công.");
      } else {
        await axiosClient.post("/admin/customers", form);
        setMessage("Thêm khách hàng thành công.");
      }

      resetForm();
      loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);

    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      password: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa khách hàng này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/customers/${id}`);

      setMessage("Xóa khách hàng thành công.");
      loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa khách hàng này."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý khách hàng</h1>
        <p>
          Admin có thể thêm, sửa, xóa và quản lý thông tin tài khoản khách hàng.
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>{editingId ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên khách hàng"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email khách hàng"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              {editingId
                ? "Mật khẩu mới"
                : "Mật khẩu"}
            </label>
            <input
              type="password"
              name="password"
              placeholder={
                editingId
                  ? "Bỏ trống nếu không đổi mật khẩu"
                  : "Nhập mật khẩu"
              }
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Cập nhật" : "Thêm khách hàng"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-card">
        <h2>Danh sách khách hàng</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : customers.length === 0 ? (
          <p>Chưa có tài khoản khách hàng.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "Chưa có"}</td>
                    <td>{customer.role}</td>
                    <td>{customer.created_at}</td>
                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(customer)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomers;