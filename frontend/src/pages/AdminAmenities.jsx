import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({
    name: "",
    icon: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAmenities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/amenities");

      const data =
        response.data?.data?.amenities ||
        response.data?.amenities ||
        [];

      setAmenities(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách tiện nghi."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await axiosClient.get("/rooms");

      const data =
        response.data?.data?.rooms ||
        response.data?.rooms ||
        [];

      setRooms(data);
    } catch (err) {
      console.log("Load rooms error:", err);
    }
  };

  const loadRoomAmenityIds = async (roomId) => {
    if (!roomId) {
      setSelectedAmenityIds([]);
      return;
    }

    try {
      setError("");

      const response = await axiosClient.get(`/admin/rooms/${roomId}/amenities`);

      const data =
        response.data?.data?.amenity_ids ||
        response.data?.amenity_ids ||
        [];

      setSelectedAmenityIds(data.map(Number));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải tiện nghi của phòng."
      );
    }
  };

  useEffect(() => {
    loadAmenities();
    loadRooms();
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
      icon: "",
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
        setError("Vui lòng nhập tên tiện nghi.");
        return;
      }

      if (editingId) {
        await axiosClient.put(`/admin/amenities/${editingId}`, form);
        setMessage("Cập nhật tiện nghi thành công.");
      } else {
        await axiosClient.post("/admin/amenities", form);
        setMessage("Thêm tiện nghi thành công.");
      }

      resetForm();
      loadAmenities();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (amenity) => {
    setEditingId(amenity.id);

    setForm({
      name: amenity.name || "",
      icon: amenity.icon || "",
      description: amenity.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa tiện nghi này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/amenities/${id}`);

      setMessage("Xóa tiện nghi thành công.");
      loadAmenities();

      if (selectedRoomId) {
        loadRoomAmenityIds(selectedRoomId);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa tiện nghi này."
      );
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoomId(roomId);
    loadRoomAmenityIds(roomId);
  };

  const handleAmenityCheck = (amenityId) => {
    const id = Number(amenityId);

    if (selectedAmenityIds.includes(id)) {
      setSelectedAmenityIds(
        selectedAmenityIds.filter((item) => item !== id)
      );
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, id]);
    }
  };

  const handleSaveRoomAmenities = async () => {
    try {
      setMessage("");
      setError("");

      if (!selectedRoomId) {
        setError("Vui lòng chọn phòng cần gán tiện nghi.");
        return;
      }

      await axiosClient.put(`/admin/rooms/${selectedRoomId}/amenities`, {
        amenity_ids: selectedAmenityIds,
      });

      setMessage("Cập nhật tiện nghi cho phòng thành công.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật tiện nghi cho phòng."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý tiện nghi</h1>
        <p>Admin có thể thêm, sửa, xóa tiện nghi và gán tiện nghi cho từng phòng.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>{editingId ? "Cập nhật tiện nghi" : "Thêm tiện nghi mới"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Tên tiện nghi</label>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Wifi miễn phí"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              name="icon"
              placeholder="Ví dụ: wifi, tv, bathtub"
              value={form.icon}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              placeholder="Nhập mô tả tiện nghi"
              value={form.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Cập nhật tiện nghi" : "Thêm tiện nghi"}
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

      <div className="admin-form-card">
        <h2>Gán tiện nghi cho phòng</h2>

        <div className="admin-form">
          <div className="form-group">
            <label>Chọn phòng</label>
            <select value={selectedRoomId} onChange={handleRoomChange}>
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - {room.title}
                </option>
              ))}
            </select>
          </div>

          {selectedRoomId && (
            <>
              <div className="amenity-checkbox-grid">
                {amenities.map((amenity) => (
                  <label key={amenity.id} className="amenity-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedAmenityIds.includes(Number(amenity.id))}
                      onChange={() => handleAmenityCheck(amenity.id)}
                    />
                    <span>{amenity.name}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveRoomAmenities}
              >
                Lưu tiện nghi cho phòng
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-table-card">
        <h2>Danh sách tiện nghi</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : amenities.length === 0 ? (
          <p>Chưa có tiện nghi nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên tiện nghi</th>
                  <th>Icon</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {amenities.map((amenity) => (
                  <tr key={amenity.id}>
                    <td>{amenity.id}</td>
                    <td>{amenity.name}</td>
                    <td>{amenity.icon || "Chưa có"}</td>
                    <td>{amenity.description || "Chưa có mô tả"}</td>
                    <td>{amenity.created_at}</td>
                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(amenity)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(amenity.id)}
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

export default AdminAmenities;