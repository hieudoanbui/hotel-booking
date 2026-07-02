import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/room-types");

      const data =
        response.data?.data?.room_types ||
        response.data?.room_types ||
        [];

      setRoomTypes(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách loại phòng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
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
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.name) {
        setError("Vui lòng nhập tên loại phòng.");
        return;
      }

      if (editingId) {
        await axiosClient.put(`/admin/room-types/${editingId}`, form);
        setMessage("Cập nhật loại phòng thành công.");
      } else {
        await axiosClient.post("/admin/room-types", form);
        setMessage("Thêm loại phòng thành công.");
      }

      resetForm();
      loadRoomTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (roomType) => {
    setEditingId(roomType.id);

    setForm({
      name: roomType.name || "",
      description: roomType.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa loại phòng này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/room-types/${id}`);

      setMessage("Xóa loại phòng thành công.");
      loadRoomTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa loại phòng này."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý loại phòng</h1>
        <p>Admin có thể thêm, sửa và xóa các loại phòng trong khách sạn.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>{editingId ? "Cập nhật loại phòng" : "Thêm loại phòng mới"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Tên loại phòng</label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Standard, Deluxe, Suite..."
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              placeholder="Nhập mô tả loại phòng"
              value={form.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Cập nhật loại phòng" : "Thêm loại phòng"}
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
        <h2>Danh sách loại phòng</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : roomTypes.length === 0 ? (
          <p>Chưa có loại phòng nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên loại phòng</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>{roomType.id}</td>
                    <td>{roomType.name}</td>
                    <td>{roomType.description || "Chưa có mô tả"}</td>
                    <td>{roomType.created_at}</td>
                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(roomType)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(roomType.id)}
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

export default AdminRoomTypes;