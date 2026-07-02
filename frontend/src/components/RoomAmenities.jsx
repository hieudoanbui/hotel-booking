import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function RoomAmenities({ roomId }) {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axiosClient.get(`/rooms/${roomId}/amenities`);
        setAmenities(response.data.data.amenities || []);
      } catch (error) {
        console.error("Lỗi lấy tiện nghi phòng:", error);
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
      <p className="amenities-title">Tiện nghi:</p>

      <div className="amenities-list">
        {amenities.map((item) => (
          <span key={item.id} className="amenity-item">
            ✓ {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RoomAmenities;