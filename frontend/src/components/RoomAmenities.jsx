import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function RoomAmenities({ roomId }) {
  const { language } = useLanguage();

  const [amenities, setAmenities] = useState([]);

  const text = {
    title: language === "en" ? "Amenities:" : "Tiện nghi:",
  };

  const amenityTranslations = {
    "Wifi miễn phí": "Free Wi-Fi",
    Wifi: "Wi-Fi",
    "Wi-Fi": "Wi-Fi",
    "Điều hòa": "Air conditioning",
    "Máy lạnh": "Air conditioning",
    Tivi: "TV",
    TV: "TV",
    "Bữa sáng": "Breakfast",
    "Ăn sáng": "Breakfast",
    "Hồ bơi": "Swimming pool",
    "Bể bơi": "Swimming pool",
    "Chỗ đậu xe": "Parking",
    "Bãi đỗ xe": "Parking",
    "Nhà hàng": "Restaurant",
    "Ban công": "Balcony",
    "Phòng tắm riêng": "Private bathroom",
    "Máy sấy tóc": "Hair dryer",
    "Tủ lạnh": "Refrigerator",
    "Két an toàn": "Safe box",
    "Dọn phòng": "Housekeeping",
    "Dịch vụ phòng": "Room service",
  };

  const getAmenityName = (name) => {
    if (language !== "en") {
      return name;
    }

    return amenityTranslations[name] || name;
  };

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axiosClient.get(`/rooms/${roomId}/amenities`);
        setAmenities(response.data?.data?.amenities || []);
      } catch (error) {
        console.error("Room amenities loading error:", error);
      }
    };

    if (roomId) {
      fetchAmenities();
    }
  }, [roomId]);

  if (amenities.length === 0) {
    return null;
  }

  return (
    <div className="room-amenities">
      <p className="amenities-title">{text.title}</p>

      <div className="amenities-list">
        {amenities.map((item) => (
          <span key={item.id} className="amenity-item">
            ✓ {getAmenityName(item.name)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RoomAmenities;