import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import RoomAmenities from "../components/RoomAmenities";
import RoomReviews from "../components/RoomReviews";
import RoomDetailModal from "../components/RoomDetailModal";
import RoomFilters from "../components/RoomFilters";

function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [searchForm, setSearchForm] = useState({
    check_in: "",
    check_out: "",
    capacity: 1,
  });

  const [filters, setFilters] = useState({
    keyword: "",
    roomType: "all",
    capacity: "all",
    price: "all",
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailRoom, setDetailRoom] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [bookingForm, setBookingForm] = useState({
    check_in: "",
    check_out: "",
    note: "",
    promotion_code: "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRooms = async () => {
    const response = await axiosClient.get("/rooms");
    const roomData = response.data?.data?.rooms || [];
    setRooms(roomData);
  };

  const fetchServices = async () => {
    const response = await axiosClient.get("/services");
    const serviceData = response.data?.data?.services || [];
    setServices(serviceData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchRooms(), fetchServices()]);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setMessage("Không thể tải dữ liệu phòng hoặc dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;

    setSearchForm({
      ...searchForm,
      [name]: value,
    });
  };

  const handleSearchAvailableRooms = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setSuccess("");

      if (!searchForm.check_in || !searchForm.check_out) {
        setMessage("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
        return;
      }

      if (new Date(searchForm.check_in) >= new Date(searchForm.check_out)) {
        setMessage("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }

      setSearchLoading(true);

      const response = await axiosClient.get("/available-rooms", {
        params: {
          check_in: searchForm.check_in,
          check_out: searchForm.check_out,
          capacity: searchForm.capacity,
        },
      });

      const availableRooms = response.data?.data?.rooms || [];
      setRooms(availableRooms);
      setSearched(true);
      setSelectedRoom(null);
      setSelectedServiceIds([]);

      setBookingForm({
        check_in: searchForm.check_in,
        check_out: searchForm.check_out,
        note: "",
        promotion_code: "",
      });

      if (availableRooms.length === 0) {
        setMessage("Không có phòng trống phù hợp trong khoảng ngày này.");
      } else {
        setSuccess("Đã tìm thấy phòng trống phù hợp.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Không thể tìm phòng trống. Vui lòng thử lại."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetAvailableSearch = async () => {
    try {
      setMessage("");
      setSuccess("");
      setSearched(false);
      setSelectedRoom(null);
      setSelectedServiceIds([]);

      setSearchForm({
        check_in: "",
        check_out: "",
        capacity: 1,
      });

      setBookingForm({
        check_in: "",
        check_out: "",
        note: "",
        promotion_code: "",
      });

      await fetchRooms();
    } catch (error) {
      setMessage("Không thể tải lại danh sách phòng.");
    }
  };

  const handleOpenDetail = (room) => {
    setDetailRoom(room);
  };

  const handleCloseDetail = () => {
    setDetailRoom(null);
  };

  const handleSelectRoom = (room) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Bạn cần đăng nhập để đặt phòng.");
      navigate("/login");
      return;
    }

    setSelectedRoom(room);
    setSelectedServiceIds([]);
    setMessage("");
    setSuccess("");

    setBookingForm({
      ...bookingForm,
      check_in: searchForm.check_in || bookingForm.check_in,
      check_out: searchForm.check_out || bookingForm.check_out,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleService = (serviceId) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const calculateNights = () => {
    if (!bookingForm.check_in || !bookingForm.check_out) {
      return 0;
    }

    const start = new Date(bookingForm.check_in);
    const end = new Date(bookingForm.check_out);
    const diffTime = end - start;
    const nights = diffTime / (1000 * 60 * 60 * 24);

    return nights > 0 ? nights : 0;
  };

  const calculateRoomPrice = () => {
    const nights = calculateNights();

    if (!selectedRoom || nights <= 0) {
      return 0;
    }

    return nights * Number(selectedRoom.price);
  };

  const calculateServicePrice = () => {
    return services
      .filter((service) => selectedServiceIds.includes(Number(service.id)))
      .reduce((total, service) => total + Number(service.price), 0);
  };

  const calculateDiscount = () => {
    const code = bookingForm.promotion_code.trim().toUpperCase();
    const beforeDiscount = calculateRoomPrice() + calculateServicePrice();

    if (!code || beforeDiscount <= 0) {
      return 0;
    }

    if (code === "WELCOME10") {
      return beforeDiscount * 0.1;
    }

    if (code === "SUMMER200") {
      return Math.min(200000, beforeDiscount);
    }

    return 0;
  };

  const getPromotionMessage = () => {
    const code = bookingForm.promotion_code.trim().toUpperCase();

    if (!code) {
      return "";
    }

    if (code === "WELCOME10") {
      return "Mã WELCOME10: giảm 10% tổng đơn.";
    }

    if (code === "SUMMER200") {
      return "Mã SUMMER200: giảm 200.000 VNĐ.";
    }

    return "Mã này sẽ được hệ thống kiểm tra khi xác nhận đặt phòng.";
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess("");

    if (!selectedRoom) {
      alert("Vui lòng chọn phòng.");
      setMessage("Vui lòng chọn phòng.");
      return;
    }

    if (!bookingForm.check_in || !bookingForm.check_out) {
      alert("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
      setMessage("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
      return;
    }

    if (bookingForm.check_out <= bookingForm.check_in) {
      alert("Ngày trả phòng phải sau ngày nhận phòng.");
      setMessage("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    try {
      const bookingData = {
        room_id: selectedRoom.id,
        check_in: bookingForm.check_in,
        check_out: bookingForm.check_out,
        note: bookingForm.note,
        service_ids: selectedServiceIds,
        promotion_code: bookingForm.promotion_code.trim().toUpperCase(),
      };

      const response = await axiosClient.post("/bookings", bookingData);

      const successMessage =
        response.data.message ||
        "Đặt phòng thành công. Vui lòng chờ admin xác nhận.";

      alert(successMessage);
      setSuccess(successMessage);

      setBookingForm({
        check_in: "",
        check_out: "",
        note: "",
        promotion_code: "",
      });

      setSelectedServiceIds([]);
      setSelectedRoom(null);

      navigate("/my-bookings");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đặt phòng thất bại. Vui lòng thử lại.";

      alert(errorMessage);
      setMessage(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <h4>Đang tải danh sách phòng...</h4>
      </div>
    );
  }

  const nights = calculateNights();
  const roomPrice = calculateRoomPrice();
  const servicePrice = calculateServicePrice();
  const beforeDiscount = roomPrice + servicePrice;
  const discountAmount = calculateDiscount();
  const totalPrice = Math.max(beforeDiscount - discountAmount, 0);

  const roomTypes = [
    ...new Set(
      rooms
        .map((room) => room.room_type)
        .filter((type) => type && type.trim() !== "")
    ),
  ];

  const filteredRooms = rooms.filter((room) => {
    const keyword = filters.keyword.trim().toLowerCase();

    const title = String(room.title || "").toLowerCase();
    const roomNumber = String(room.room_number || "").toLowerCase();
    const roomType = String(room.room_type || "");
    const capacity = Number(room.capacity || 0);
    const price = Number(room.price || 0);

    const matchKeyword =
      keyword === "" || title.includes(keyword) || roomNumber.includes(keyword);

    const matchRoomType =
      filters.roomType === "all" || roomType === filters.roomType;

    let matchCapacity = true;

    if (filters.capacity === "1-2") {
      matchCapacity = capacity >= 1 && capacity <= 2;
    }

    if (filters.capacity === "3-4") {
      matchCapacity = capacity >= 3 && capacity <= 4;
    }

    if (filters.capacity === "5") {
      matchCapacity = capacity >= 5;
    }

    let matchPrice = true;

    if (filters.price === "under-1000000") {
      matchPrice = price < 1000000;
    }

    if (filters.price === "1000000-2000000") {
      matchPrice = price >= 1000000 && price <= 2000000;
    }

    if (filters.price === "over-2000000") {
      matchPrice = price > 2000000;
    }

    return matchKeyword && matchRoomType && matchCapacity && matchPrice;
  });

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Danh sách phòng</h2>

        <p className="text-muted">
          Lựa chọn phòng phù hợp và tiến hành đặt phòng trực tuyến.
        </p>
      </div>

      {message && <div className="alert alert-danger">{message}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="available-search-box">
        <h3>Tìm phòng trống</h3>

        <form onSubmit={handleSearchAvailableRooms} className="available-search-form">
          <div className="form-group">
            <label>Ngày nhận phòng</label>
            <input
              type="date"
              name="check_in"
              value={searchForm.check_in}
              onChange={handleSearchChange}
            />
          </div>

          <div className="form-group">
            <label>Ngày trả phòng</label>
            <input
              type="date"
              name="check_out"
              value={searchForm.check_out}
              onChange={handleSearchChange}
            />
          </div>

          <div className="form-group">
            <label>Số người</label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={searchForm.capacity}
              onChange={handleSearchChange}
            />
          </div>

          <div className="available-search-actions">
            <button type="submit" className="btn btn-primary" disabled={searchLoading}>
              {searchLoading ? "Đang tìm..." : "Tìm phòng trống"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleResetAvailableSearch}
            >
              Xem tất cả
            </button>
          </div>
        </form>

        {searched && (
          <p className="search-result-note">
            Đang hiển thị các phòng còn trống từ {searchForm.check_in} đến{" "}
            {searchForm.check_out}.
          </p>
        )}
      </div>

      <RoomFilters filters={filters} setFilters={setFilters} roomTypes={roomTypes} />

      {selectedRoom && (
        <div className="card border-0 shadow-sm mb-5 booking-box">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">
              Đặt phòng: {selectedRoom.title}
            </h4>

            <div className="row mb-3">
              <div className="col-md-4">
                <p className="mb-1 text-muted">Số phòng</p>
                <h6>{selectedRoom.room_number}</h6>
              </div>

              <div className="col-md-4">
                <p className="mb-1 text-muted">Loại phòng</p>
                <h6>{selectedRoom.room_type}</h6>
              </div>

              <div className="col-md-4">
                <p className="mb-1 text-muted">Giá / đêm</p>

                <h6 className="text-danger">
                  {Number(selectedRoom.price).toLocaleString("vi-VN")} VNĐ
                </h6>
              </div>
            </div>

            <div className="mb-3">
              <RoomAmenities roomId={selectedRoom.id} />
            </div>

            <form onSubmit={handleBooking}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ngày nhận phòng</label>

                  <input
                    type="date"
                    name="check_in"
                    className="form-control"
                    value={bookingForm.check_in}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Ngày trả phòng</label>

                  <input
                    type="date"
                    name="check_out"
                    className="form-control"
                    value={bookingForm.check_out}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Số đêm</label>

                  <input
                    type="text"
                    className="form-control"
                    value={nights > 0 ? `${nights} đêm` : ""}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Dịch vụ thêm</label>

                {services.length === 0 && (
                  <p className="text-muted">Chưa có dịch vụ nào.</p>
                )}

                <div className="row">
                  {services.map((service) => (
                    <div className="col-md-6 mb-2" key={service.id}>
                      <label className="service-option">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={selectedServiceIds.includes(Number(service.id))}
                          onChange={() => handleToggleService(Number(service.id))}
                        />

                        <span className="fw-semibold">{service.name}</span>

                        <span className="text-danger ms-2">
                          {Number(service.price).toLocaleString("vi-VN")} VNĐ
                        </span>

                        <div className="text-muted small">
                          {service.description}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Mã giảm giá</label>

                <input
                  type="text"
                  name="promotion_code"
                  className="form-control"
                  placeholder="Nhập mã WELCOME10 hoặc SUMMER200"
                  value={bookingForm.promotion_code}
                  onChange={handleChange}
                />

                {getPromotionMessage() && (
                  <div className="form-text">{getPromotionMessage()}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Ghi chú</label>

                <textarea
                  name="note"
                  className="form-control"
                  rows="3"
                  placeholder="Nhập yêu cầu thêm nếu có"
                  value={bookingForm.note}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="price-summary mb-3">
                <p className="mb-1">
                  Tiền phòng: <strong>{roomPrice.toLocaleString("vi-VN")} VNĐ</strong>
                </p>

                <p className="mb-1">
                  Tiền dịch vụ: <strong>{servicePrice.toLocaleString("vi-VN")} VNĐ</strong>
                </p>

                <p className="mb-1">
                  Tạm tính: <strong>{beforeDiscount.toLocaleString("vi-VN")} VNĐ</strong>
                </p>

                <p className="mb-1 text-success">
                  Giảm giá: <strong>-{discountAmount.toLocaleString("vi-VN")} VNĐ</strong>
                </p>

                <h5 className="fw-bold text-danger mb-0">
                  Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VNĐ
                </h5>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => {
                    setSelectedRoom(null);
                    setSelectedServiceIds([]);
                  }}
                >
                  Hủy chọn
                </button>

                <button type="submit" className="btn btn-warning">
                  Xác nhận đặt phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-4">
        {filteredRooms.map((room) => (
          <div className="col-md-4" key={room.id}>
            <div className="card h-100 shadow-sm border-0 room-card">
              <div
                className="room-image room-image-clickable"
                onClick={() => handleOpenDetail(room)}
              >
                <span>{room.room_type}</span>

                <div className="room-image-overlay">
                  Bấm để xem chi tiết
                </div>
              </div>

              <div className="card-body">
                <h5
                  className="card-title fw-bold room-title-clickable"
                  onClick={() => handleOpenDetail(room)}
                >
                  {room.title}
                </h5>

                <p className="text-muted mb-2">
                  Số phòng: <strong>{room.room_number}</strong>
                </p>

                <p className="text-muted mb-2">
                  Sức chứa: <strong>{room.capacity} người</strong>
                </p>

                <p className="text-muted">{room.description}</p>

                <RoomAmenities roomId={room.id} />

                <h5 className="text-danger fw-bold mt-3">
                  {Number(room.price).toLocaleString("vi-VN")} VNĐ / đêm
                </h5>

                <button
                  className="btn btn-outline-dark w-100 mt-3"
                  onClick={() => handleOpenDetail(room)}
                >
                  Xem chi tiết
                </button>

                <button
                  className="btn btn-dark w-100 mt-2"
                  onClick={() => handleSelectRoom(room)}
                >
                  Đặt phòng
                </button>

                <RoomReviews roomId={room.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="alert alert-warning text-center mt-4">
          Không tìm thấy phòng phù hợp với bộ lọc.
        </div>
      )}

      {detailRoom && (
        <RoomDetailModal room={detailRoom} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default Rooms;