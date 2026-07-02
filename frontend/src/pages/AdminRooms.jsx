import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formData, setFormData] = useState({
    room_type_id: "1",
    room_number: "",
    title: "",
    description: "",
    price: "",
    capacity: "",
    image: "default-room.jpg",
    status: "active",
  });

  const getRoomTypeId = (room) => {
    if (room.room_type_id) {
      return String(room.room_type_id);
    }

    if (room.room_type === "Deluxe") {
      return "2";
    }

    if (room.room_type === "Suite") {
      return "3";
    }

    return "1";
  };

  const getRoomTypeName = (room) => {
    if (room.room_type) {
      return room.room_type;
    }

    if (String(room.room_type_id) === "2") {
      return "Deluxe";
    }

    if (String(room.room_type_id) === "3") {
      return "Suite";
    }

    return "Standard";
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const renderStatus = (status) => {
    if (status === "active") {
      return <span className="badge bg-success">Đang hoạt động</span>;
    }

    if (status === "maintenance") {
      return <span className="badge bg-warning text-dark">Bảo trì</span>;
    }

    return <span className="badge bg-secondary">Không rõ</span>;
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setMessage("");

      let response;

      try {
        response = await axiosClient.get("/admin/rooms");
      } catch (adminError) {
        response = await axiosClient.get("/rooms");
      }

      const roomList =
        response.data?.data?.rooms ||
        response.data?.rooms ||
        response.data?.data ||
        [];

      setRooms(roomList);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thể tải danh sách phòng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      room_type_id: "1",
      room_number: "",
      title: "",
      description: "",
      price: "",
      capacity: "",
      image: "default-room.jpg",
      status: "active",
    });
  };

  const handleResetFilter = () => {
    setSearchText("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const buildRoomPayload = () => {
    return {
      room_type_id: Number(formData.room_type_id),
      room_number: formData.room_number.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      image: formData.image.trim() || "default-room.jpg",
      status: formData.status,
    };
  };

  const validateForm = () => {
    if (!formData.room_number.trim()) {
      return "Vui lòng nhập số phòng.";
    }

    if (!formData.title.trim()) {
      return "Vui lòng nhập tên phòng.";
    }

    if (Number(formData.price) <= 0) {
      return "Giá phòng phải lớn hơn 0.";
    }

    if (Number(formData.capacity) <= 0) {
      return "Sức chứa phải lớn hơn 0.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const payload = buildRoomPayload();

      if (editingId) {
        await axiosClient.put(`/admin/rooms/${editingId}`, payload);
        setSuccess("Cập nhật phòng thành công.");
      } else {
        await axiosClient.post("/admin/rooms", payload);
        setSuccess("Thêm phòng thành công.");
      }

      resetForm();
      await fetchRooms();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Lỗi lưu phòng:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu."
      );
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);

    setFormData({
      room_type_id: getRoomTypeId(room),
      room_number: room.room_number || "",
      title: room.title || "",
      description: room.description || "",
      price: room.price || "",
      capacity: room.capacity || "",
      image: room.image || "default-room.jpg",
      status: room.status || "active",
    });

    setMessage("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa phòng này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setSuccess("");

      await axiosClient.delete(`/admin/rooms/${id}`);

      setSuccess("Xóa phòng thành công.");
      await fetchRooms();
    } catch (error) {
      console.error("Lỗi xóa phòng:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Xóa phòng thất bại. Nếu phòng đã có đơn đặt, hãy chuyển sang trạng thái bảo trì thay vì xóa."
      );
    }
  };

  const handleToggleStatus = async (room) => {
    const newStatus = room.status === "active" ? "maintenance" : "active";

    const confirmAction = window.confirm(
      newStatus === "maintenance"
        ? "Bạn có chắc muốn chuyển phòng này sang trạng thái bảo trì không?"
        : "Bạn có chắc muốn mở hoạt động lại phòng này không?"
    );

    if (!confirmAction) {
      return;
    }

    try {
      setMessage("");
      setSuccess("");

      await axiosClient.put(`/admin/rooms/${room.id}`, {
        room_type_id: Number(getRoomTypeId(room)),
        room_number: room.room_number,
        title: room.title,
        description: room.description || "",
        price: Number(room.price || 0),
        capacity: Number(room.capacity || 0),
        image: room.image || "default-room.jpg",
        status: newStatus,
      });

      setSuccess("Cập nhật trạng thái phòng thành công.");
      await fetchRooms();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái phòng:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Cập nhật trạng thái phòng thất bại."
      );
    }
  };

  const totalRooms = rooms.length;

  const activeRooms = rooms.filter((room) => {
    return room.status === "active";
  }).length;

  const maintenanceRooms = rooms.filter((room) => {
    return room.status === "maintenance";
  }).length;

  const filteredRooms = rooms.filter((room) => {
    const keyword = searchText.toLowerCase().trim();
    const roomTypeName = getRoomTypeName(room);

    const matchSearch =
      keyword === "" ||
      String(room.id).includes(keyword) ||
      String(room.room_number || "").toLowerCase().includes(keyword) ||
      String(room.title || "").toLowerCase().includes(keyword) ||
      String(room.description || "").toLowerCase().includes(keyword);

    const matchStatus =
      statusFilter === "all" || room.status === statusFilter;

    const matchType =
      typeFilter === "all" || roomTypeName === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải danh sách phòng...</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý phòng</h2>

          <p className="text-muted mb-0">
            Admin có thể thêm, sửa, xóa và cập nhật trạng thái phòng khách sạn.
          </p>
        </div>

        <button className="btn btn-dark" onClick={fetchRooms}>
          Tải lại
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Tổng số phòng</div>
              <h3 className="fw-bold mb-0">{totalRooms}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Đang hoạt động</div>
              <h3 className="fw-bold text-success mb-0">{activeRooms}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Bảo trì</div>
              <h3 className="fw-bold text-warning mb-0">{maintenanceRooms}</h3>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-danger">{message}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card border-0 shadow-sm mb-5">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-3">
            {editingId ? "Cập nhật thông tin phòng" : "Thêm phòng mới"}
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label fw-semibold">Loại phòng</label>

                <select
                  name="room_type_id"
                  className="form-select"
                  value={formData.room_type_id}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Standard</option>
                  <option value="2">Deluxe</option>
                  <option value="3">Suite</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label fw-semibold">Số phòng</label>

                <input
                  type="text"
                  name="room_number"
                  className="form-control"
                  placeholder="VD: 401"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label fw-semibold">Giá / đêm</label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  placeholder="VD: 750000"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label fw-semibold">Sức chứa</label>

                <input
                  type="number"
                  name="capacity"
                  className="form-control"
                  placeholder="VD: 2"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Tên phòng</label>

              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="VD: Phòng Deluxe 401"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mô tả</label>

              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Nhập mô tả phòng"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Tên ảnh</label>

                <input
                  type="text"
                  name="image"
                  className="form-control"
                  placeholder="VD: deluxe401.jpg"
                  value={formData.image}
                  onChange={handleChange}
                />

                <div className="form-text">
                  Nhập tên file ảnh có trong thư mục assets hoặc public.
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Trạng thái</label>

                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-warning">
                {editingId ? "Cập nhật phòng" : "Thêm phòng"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Tìm kiếm và lọc phòng</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Tìm kiếm</label>

              <input
                type="text"
                className="form-control"
                placeholder="Nhập ID, tên phòng, số phòng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Loại phòng</label>

              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Trạng thái</label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="maintenance">Bảo trì</option>
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

          <div className="text-muted small mt-3">
            Đang hiển thị {filteredRooms.length} / {rooms.length} phòng.
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Phòng</th>
                <th>Loại</th>
                <th>Giá</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="fw-bold">#{room.id}</td>

                  <td>
                    <strong>{room.title || "Chưa có tên phòng"}</strong>
                    <br />

                    <span className="text-muted small">
                      Số phòng: {room.room_number || "Không rõ"}
                    </span>
                    <br />

                    <span className="text-muted small">
                      {room.description || "Không có mô tả"}
                    </span>
                  </td>

                  <td>{getRoomTypeName(room)}</td>

                  <td className="fw-bold text-danger">
                    {formatMoney(room.price)}
                  </td>

                  <td>{room.capacity || 0} người</td>

                  <td>{renderStatus(room.status)}</td>

                  <td>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(room)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleToggleStatus(room)}
                      >
                        {room.status === "active"
                          ? "Bảo trì"
                          : "Mở hoạt động"}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(room.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRooms.length === 0 && (
          <div className="alert alert-info m-3">
            Không có phòng nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRooms;