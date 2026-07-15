import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function RoomDetailModal({ room, onClose }) {
  const { language } = useLanguage();

  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mainImage, setMainImage] = useState("");

  const text = {
    roomNumber: language === "en" ? "Room number" : "Số phòng",
    capacity: language === "en" ? "Capacity" : "Sức chứa",
    guests: language === "en" ? "guests" : "người",
    noImage: language === "en" ? "No room image available" : "Chưa có ảnh phòng",
    roomImage: language === "en" ? "Room image" : "Ảnh phòng",
    roomInfo: language === "en" ? "Room information" : "Thông tin phòng",
    perNight: language === "en" ? "night" : "đêm",
    amenities: language === "en" ? "Amenities" : "Tiện nghi",
    noAmenities: language === "en" ? "No amenities available." : "Chưa có tiện nghi.",
    reviews: language === "en" ? "Room reviews" : "Đánh giá phòng",
    noReviews: language === "en" ? "No reviews yet." : "Chưa có đánh giá nào.",
    customer: language === "en" ? "Customer" : "Khách hàng",
    close: language === "en" ? "Close" : "Đóng",
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

  const formatPrice = (price) => {
    const locale = language === "en" ? "en-US" : "vi-VN";
    return `${Number(price || 0).toLocaleString(locale)} VND`;
  };

  const renderStars = (rating) => {
    const starCount = Number(rating || 0);

    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  };

  useEffect(() => {
    if (!room || !room.id) {
      return;
    }

    const loadRoomDetail = async () => {
      try {
        const imageRes = await axiosClient.get(`/rooms/${room.id}/images`);
        const amenityRes = await axiosClient.get(`/rooms/${room.id}/amenities`);
        const reviewRes = await axiosClient.get(`/rooms/${room.id}/reviews`);

        const imageData = imageRes.data?.data?.images || imageRes.data?.images || [];
        const amenityData =
          amenityRes.data?.data?.amenities || amenityRes.data?.amenities || [];
        const reviewData =
          reviewRes.data?.data?.reviews || reviewRes.data?.reviews || [];

        setImages(imageData);
        setAmenities(amenityData);
        setReviews(reviewData);

        if (imageData.length > 0) {
          setMainImage(imageData[0].image_url);
        } else {
          setMainImage("");
        }
      } catch (error) {
        console.log("Load room detail error:", error);
      }
    };

    loadRoomDetail();
  }, [room]);

  if (!room) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="room-detail-modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          title={text.close}
        >
          ×
        </button>

        <div className="room-detail-header">
          <h2>{room.title}</h2>

          <p>
            {text.roomNumber}: <strong>{room.room_number}</strong>
          </p>

          <p>
            {text.capacity}:{" "}
            <strong>
              {room.capacity} {text.guests}
            </strong>
          </p>
        </div>

        <div className="room-detail-content">
          <div className="room-detail-images">
            {mainImage ? (
              <img
                src={mainImage}
                alt={room.title}
                className="room-main-image"
              />
            ) : (
              <div className="room-no-image">
                <span>{text.noImage}</span>
              </div>
            )}

            {images.length > 0 && (
              <div className="room-thumbnail-list">
                {images.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={
                      mainImage === image.image_url
                        ? "room-thumbnail active"
                        : "room-thumbnail"
                    }
                    onClick={() => setMainImage(image.image_url)}
                  >
                    <img src={image.image_url} alt={text.roomImage} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="room-detail-info">
            <h3>{text.roomInfo}</h3>

            <p>{room.description}</p>

            <p className="room-detail-price">
              {formatPrice(room.price)} / {text.perNight}
            </p>

            <h3>{text.amenities}</h3>

            {amenities.length === 0 ? (
              <p>{text.noAmenities}</p>
            ) : (
              <div className="amenities-list">
                {amenities.map((amenity) => (
                  <span key={amenity.id} className="amenity-item">
                    {getAmenityName(amenity.name)}
                  </span>
                ))}
              </div>
            )}

            <h3>{text.reviews}</h3>

            {reviews.length === 0 ? (
              <p>{text.noReviews}</p>
            ) : (
              <div className="modal-review-list">
                {reviews.map((review) => (
                  <div key={review.id} className="modal-review-item">
                    <strong>{review.customer_name || text.customer}</strong>

                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>

                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailModal;