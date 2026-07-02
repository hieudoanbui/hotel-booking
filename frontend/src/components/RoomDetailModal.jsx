import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function RoomDetailModal({ room, onClose }) {
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    if (!room || !room.id) {
      return;
    }

    const loadRoomDetail = async () => {
      try {
        const imageRes = await axiosClient.get(`/rooms/${room.id}/images`);

        const amenityRes = await axiosClient.get(
          `/rooms/${room.id}/amenities`
        );

        const reviewRes = await axiosClient.get(
          `/rooms/${room.id}/reviews`
        );

        const imageData =
          imageRes.data?.data?.images ||
          imageRes.data?.images ||
          [];

        const amenityData =
          amenityRes.data?.data?.amenities ||
          amenityRes.data?.amenities ||
          [];

        const reviewData =
          reviewRes.data?.data?.reviews ||
          reviewRes.data?.reviews ||
          [];

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

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const renderStars = (rating) => {
    const starCount = Number(rating || 0);

    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  };

  return (
    <div className="modal-overlay">
      <div className="room-detail-modal">
        <button className="modal-close-btn" onClick={onClose}>
          x
        </button>

        <div className="room-detail-header">
          <h2>{room.title}</h2>

          <p>
            Số phòng: <strong>{room.room_number}</strong>
          </p>

          <p>
            Sức chứa: <strong>{room.capacity} người</strong>
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
                <span>Chưa có ảnh phòng</span>
              </div>
            )}

            {images.length > 0 && (
              <div className="room-thumbnail-list">
                {images.map((image) => (
                  <button
                    key={image.id}
                    className={
                      mainImage === image.image_url
                        ? "room-thumbnail active"
                        : "room-thumbnail"
                    }
                    onClick={() => setMainImage(image.image_url)}
                  >
                    <img src={image.image_url} alt="Ảnh phòng" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="room-detail-info">
            <h3>Thông tin phòng</h3>

            <p>{room.description}</p>

            <p className="room-detail-price">
              {formatPrice(room.price)} / đêm
            </p>

            <h3>Tiện nghi</h3>

            {amenities.length === 0 ? (
              <p>Chưa có tiện nghi.</p>
            ) : (
              <div className="amenities-list">
                {amenities.map((amenity) => (
                  <span key={amenity.id} className="amenity-item">
                    {amenity.name}
                  </span>
                ))}
              </div>
            )}

            <h3>Đánh giá phòng</h3>

            {reviews.length === 0 ? (
              <p>Chưa có đánh giá nào.</p>
            ) : (
              <div className="modal-review-list">
                {reviews.map((review) => (
                  <div key={review.id} className="modal-review-item">
                    <strong>
                      {review.customer_name || "Khách hàng"}
                    </strong>

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