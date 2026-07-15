import { useLanguage } from "../i18n/LanguageContext";

function RoomFilters({ filters, setFilters, roomTypes }) {
  const { language } = useLanguage();

  const text = {
    title: language === "en" ? "Room filters" : "Bộ lọc tìm phòng",
    search: language === "en" ? "Search" : "Tìm kiếm",
    searchPlaceholder:
      language === "en"
        ? "Enter room name or room number"
        : "Nhập tên phòng hoặc số phòng",
    roomType: language === "en" ? "Room type" : "Loại phòng",
    allRoomTypes:
      language === "en" ? "All room types" : "Tất cả loại phòng",
    capacity: language === "en" ? "Capacity" : "Sức chứa",
    all: language === "en" ? "All" : "Tất cả",
    guests12: language === "en" ? "1 - 2 guests" : "1 - 2 người",
    guests34: language === "en" ? "3 - 4 guests" : "3 - 4 người",
    guests5: language === "en" ? "From 5 guests" : "Từ 5 người trở lên",
    priceRange: language === "en" ? "Price range" : "Khoảng giá",
    allPrices: language === "en" ? "All prices" : "Tất cả mức giá",
    under1m: language === "en" ? "Under 1,000,000 VND" : "Dưới 1.000.000 VNĐ",
    from1mTo2m:
      language === "en"
        ? "1,000,000 - 2,000,000 VND"
        : "1.000.000 - 2.000.000 VNĐ",
    over2m: language === "en" ? "Over 2,000,000 VND" : "Trên 2.000.000 VNĐ",
    clearFilter: language === "en" ? "Clear filters" : "Xóa bộ lọc",
  };

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
      <h4>{text.title}</h4>

      <div className="room-filter-grid">
        <div className="filter-group">
          <label>{text.search}</label>

          <input
            type="text"
            name="keyword"
            placeholder={text.searchPlaceholder}
            value={filters.keyword}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label>{text.roomType}</label>

          <select
            name="roomType"
            value={filters.roomType}
            onChange={handleChange}
          >
            <option value="all">{text.allRoomTypes}</option>

            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{text.capacity}</label>

          <select
            name="capacity"
            value={filters.capacity}
            onChange={handleChange}
          >
            <option value="all">{text.all}</option>
            <option value="1-2">{text.guests12}</option>
            <option value="3-4">{text.guests34}</option>
            <option value="5">{text.guests5}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{text.priceRange}</label>

          <select
            name="price"
            value={filters.price}
            onChange={handleChange}
          >
            <option value="all">{text.allPrices}</option>
            <option value="under-1000000">{text.under1m}</option>
            <option value="1000000-2000000">{text.from1mTo2m}</option>
            <option value="over-2000000">{text.over2m}</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary mt-3"
        onClick={handleReset}
      >
        {text.clearFilter}
      </button>
    </div>
  );
}

export default RoomFilters;