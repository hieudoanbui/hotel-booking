function RoomFilters({ filters, setFilters, roomTypes }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleReset = () => {
    setFilters({
      keyword: "",
      roomType: "all",
      capacity: "all",
      price: "all",
    });
  };

  return (
    <div className="room-filter-box">
      <h4>Bộ lọc tìm phòng</h4>

      <div className="room-filter-grid">
        <div className="filter-group">
          <label>Tìm kiếm</label>

          <input
            type="text"
            name="keyword"
            placeholder="Nhập tên phòng hoặc số phòng"
            value={filters.keyword}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label>Loại phòng</label>

          <select
            name="roomType"
            value={filters.roomType}
            onChange={handleChange}
          >
            <option value="all">Tất cả loại phòng</option>

            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sức chứa</label>

          <select
            name="capacity"
            value={filters.capacity}
            onChange={handleChange}
          >
            <option value="all">Tất cả</option>

            <option value="1-2">1 - 2 người</option>

            <option value="3-4">3 - 4 người</option>

            <option value="5">Từ 5 người trở lên</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Khoảng giá</label>

          <select
            name="price"
            value={filters.price}
            onChange={handleChange}
          >
            <option value="all">Tất cả mức giá</option>

            <option value="under-1000000">Dưới 1.000.000 VNĐ</option>

            <option value="1000000-2000000">1.000.000 - 2.000.000 VNĐ</option>

            <option value="over-2000000">Trên 2.000.000 VNĐ</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary mt-3"
        onClick={handleReset}
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

export default RoomFilters;