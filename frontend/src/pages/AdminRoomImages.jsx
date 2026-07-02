import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function ImagePreview({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="room-image-preview-empty">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="room-image-preview"
      onError={() => setHasError(true)}
    />
  );
}

function AdminRoomImages() {
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({
    room_id: "",
    image_url: "",
    is_main: "0",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const loadImages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/room-images");

      const data =
        response.data?.data?.images ||
        response.data?.images ||
        [];

      setImages(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách ảnh phòng."
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

  useEffect(() => {
    loadImages();
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
      room_id: "",
      image_url: "",
      is_main: "0",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!form.room_id) {
        setError("Vui lòng chọn phòng.");
        return;
      }

      if (!form.image_url) {
        setError("Vui lòng nhập đường dẫn ảnh.");
        return;
      }

      const payload = {
        room_id: Number(form.room_id),
        image_url: form.image_url,
        is_main: Number(form.is_main),
      };

      if (editingId) {
        await axiosClient.put(`/admin/room-images/${editingId}`, payload);

        setMessage("Cập nhật ảnh phòng thành công.");
      } else {
        await axiosClient.post("/admin/room-images", payload);

        setMessage("Thêm ảnh phòng thành công.");
      }

      resetForm();

      loadImages();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Thao tác thất bại."
      );
    }
  };

  const handleEdit = (image) => {
    setEditingId(image.id);

    setForm({
      room_id: image.room_id || "",
      image_url: image.image_url || "",
      is_main: String(image.is_main || 0),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa ảnh phòng này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/room-images/${id}`);

      setMessage("Xóa ảnh phòng thành công.");

      loadImages();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa ảnh phòng này."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý ảnh phòng</h1>

        <p>
          Admin có thể thêm, sửa, xóa ảnh và đặt ảnh chính cho từng phòng.
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-form-card">
        <h2>
          {editingId ? "Cập nhật ảnh phòng" : "Thêm ảnh phòng mới"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Chọn phòng</label>

            <select
              name="room_id"
              value={form.room_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn phòng --</option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} - {room.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Đường dẫn ảnh</label>

            <input
              type="text"
              name="image_url"
              placeholder="/images/rooms/standard.jpg"
              value={form.image_url}
              onChange={handleChange}
            />

            <small className="form-hint">
              Ví dụ: /images/rooms/standard.jpg
            </small>
          </div>

          <div className="form-group">
            <label>Ảnh chính</label>

            <select
              name="is_main"
              value={form.is_main}
              onChange={handleChange}
            >
              <option value="0">Không</option>

              <option value="1">Có</option>
            </select>

            <small className="form-hint">
              Mỗi phòng nên có 1 ảnh chính.
            </small>
          </div>

          <div className="admin-image-preview-box">
            <p>Xem trước ảnh:</p>

            <ImagePreview
              src={form.image_url}
              alt="Xem trước ảnh phòng"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Cập nhật ảnh" : "Thêm ảnh"}
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
        <h2>Danh sách ảnh phòng</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : images.length === 0 ? (
          <p>Chưa có ảnh phòng nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>

                  <th>Ảnh</th>

                  <th>Phòng</th>

                  <th>Đường dẫn</th>

                  <th>Ảnh chính</th>

                  <th>Ngày tạo</th>

                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {images.map((image) => (
                  <tr key={image.id}>
                    <td>{image.id}</td>

                    <td>
                      <ImagePreview
                        src={image.image_url}
                        alt={image.room_title}
                      />
                    </td>

                    <td>
                      <strong>{image.room_number}</strong>

                      <br />

                      <span>{image.room_title}</span>
                    </td>

                    <td className="image-url-cell">
                      {image.image_url}
                    </td>

                    <td>
                      <span
                        className={
                          Number(image.is_main) === 1
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >
                        {Number(image.is_main) === 1
                          ? "Ảnh chính"
                          : "Ảnh phụ"}
                      </span>
                    </td>

                    <td>{image.created_at}</td>

                    <td>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleEdit(image)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(image.id)}
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

export default AdminRoomImages;