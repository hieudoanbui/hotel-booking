import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);

  const [form, setForm] = useState({
    code: "",
    name: "",
    discount_type: "percent",
    discount_value: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/promotions");

      const data =
        response.data?.data?.promotions ||
        response.data?.promotions ||
        [];

      setPromotions(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách mã khuyến mãi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
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
      code: "",
      name: "",
      discount_type: "percent",
      discount_value: "",
      start_date: "",
      end_date: "",
      status: "active",
    });

    setEditingId(null);
  };

  const validateForm = () => {
    if (!form.code || !form.name) {
      setError("Vui lòng nhập mã khuyến mãi và tên chương trình.");
      return false;
    }

    if (Number(form.discount_value) <= 0) {
      setError("Giá trị giảm giá phải lớn hơn 0.");
      return false;
    }

    if (
      form.discount_type === "percent" &&
      Number(form.discount_value) > 100
    ) {
      setError("Giảm giá theo phần trăm không được vượt quá 100%.");
      return false;
    }

    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!validateForm()) {
        return;
      }

      const payload = {
        code: form.code.toUpperCase(),
        name: form.name,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      };

      if (editingId) {
        await axiosClient.put(`/admin/promotions/${editingId}`, payload);
        setMessage("Cập nhật mã khuyến mãi thành công.");
      } else {
        await axiosClient.post("/admin/promotions", payload);
        setMessage("Thêm mã khuyến mãi thành công.");
      }

      resetForm();
      loadPromotions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (promotion) => {
    setEditingId(promotion.id);

    setForm({
      code: promotion.code || "",
      name: promotion.name || "",
      discount_type: promotion.discount_type || "percent",
      discount_value: promotion.discount_value || "",
      start_date: promotion.start_date || "",
      end_date: promotion.end_date || "",
      status: promotion.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleHide = async (id) => {
    const confirmHide = window.confirm(
      "Bạn có chắc chắn muốn ẩn mã khuyến mãi này không?"
    );

    if (!confirmHide) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/promotions/${id}`);

      setMessage("Ẩn mã khuyến mãi thành công.");
      loadPromotions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể ẩn mã khuyến mãi này."
      );
    }
  };

  const formatDiscount = (promotion) => {
    if (promotion.discount_type === "percent") {
      return `${Number(promotion.discount_value)}%`;
    }

    return Number(promotion.discount_value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý mã khuyến mãi</h1>
        <p>Admin có thể thêm, sửa và quản lý các mã giảm giá cho khách đặt phòng.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>{editingId ? "Cập nhật mã khuyến mãi" : "Thêm mã khuyến mãi mới"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Mã khuyến mãi</label>
            <input
              type="text"
              name="code"
              placeholder="Ví dụ: WELCOME10"
              value={form.code}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tên chương trình</label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Giảm giá khách hàng mới"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Loại giảm giá</label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
            >
              <option value="percent">Giảm theo phần trăm</option>
              <option value="fixed">Giảm số tiền cố định</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá trị giảm</label>
            <input
              type="number"
              name="discount_value"
              placeholder={form.discount_type === "percent" ? "Ví dụ: 10" : "Ví dụ: 200000"}
              value={form.discount_value}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Ngày kết thúc</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
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
              {editingId ? "Cập nhật mã" : "Thêm mã"}
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
        <h2>Danh sách mã khuyến mãi</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : promotions.length === 0 ? (
          <p>Chưa có mã khuyến mãi nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã</th>
                  <th>Tên chương trình</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id}>
                    <td>{promotion.id}</td>
                    <td>
                      <strong>{promotion.code}</strong>
                    </td>
                    <td>{promotion.name}</td>
                    <td>
                      {promotion.discount_type === "percent"
                        ? "Phần trăm"
                        : "Cố định"}
                    </td>
                    <td>{formatDiscount(promotion)}</td>
                    <td>
                      {promotion.start_date || "Không giới hạn"} →{" "}
                      {promotion.end_date || "Không giới hạn"}
                    </td>
                    <td>
                      <span
                        className={
                          promotion.status === "active"
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >
                        {promotion.status === "active"
                          ? "Hoạt động"
                          : "Tạm ẩn"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(promotion)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleHide(promotion.id)}
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

export default AdminPromotions;