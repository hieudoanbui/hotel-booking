import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/services");

      const data =
        response.data?.data?.services ||
        response.data?.services ||
        [];

      setServices(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách dịch vụ."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
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
      description: "",
      price: "",
      status: "active",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.name) {
        setError("Vui lòng nhập tên dịch vụ.");
        return;
      }

      if (Number(form.price) < 0) {
        setError("Giá dịch vụ không hợp lệ.");
        return;
      }

      if (editingId) {
        await axiosClient.put(`/admin/services/${editingId}`, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          status: form.status,
        });

        setMessage("Cập nhật dịch vụ thành công.");
      } else {
        await axiosClient.post("/admin/services", {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          status: form.status,
        });

        setMessage("Thêm dịch vụ thành công.");
      }

      resetForm();
      loadServices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);

    setForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price || "",
      status: service.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleHide = async (id) => {
    const confirmHide = window.confirm(
      "Bạn có chắc chắn muốn ẩn dịch vụ này không?"
    );

    if (!confirmHide) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/services/${id}`);

      setMessage("Ẩn dịch vụ thành công.");
      loadServices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể ẩn dịch vụ này."
      );
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý dịch vụ</h1>
        <p>Admin có thể thêm, sửa và quản lý các dịch vụ đi kèm khi đặt phòng.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>{editingId ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Tên dịch vụ</label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Ăn sáng, Giặt là..."
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              placeholder="Nhập mô tả dịch vụ"
              value={form.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Giá dịch vụ</label>
            <input
              type="number"
              name="price"
              placeholder="Nhập giá dịch vụ"
              value={form.price}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
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
        <h2>Danh sách dịch vụ</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : services.length === 0 ? (
          <p>Chưa có dịch vụ nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên dịch vụ</th>
                  <th>Mô tả</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.name}</td>
                    <td>{service.description || "Chưa có mô tả"}</td>
                    <td>{formatPrice(service.price)}</td>
                    <td>
                      <span
                        className={
                          service.status === "active"
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >
                        {service.status === "active"
                          ? "Hoạt động"
                          : "Tạm ẩn"}
                      </span>
                    </td>
                    <td>{service.created_at}</td>
                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(service)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleHide(service.id)}
                      >
                        Ẩn
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

export default AdminServices;