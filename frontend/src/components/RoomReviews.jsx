import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function RoomReviews({ roomId }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await axiosClient.get(`/rooms/${roomId}/reviews`);
      setReviews(response.data?.data?.reviews || []);
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchReviews();
    }
  }, [roomId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    if (user.role !== "customer") {
      alert("Chỉ khách hàng mới có thể đánh giá phòng.");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      const response = await axiosClient.post("/reviews", {
        room_id: roomId,
        rating: Number(rating),
        comment: comment,
      });

      setMessage(response.data.message || "Gửi đánh giá thành công.");
      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="room-reviews mt-3">
      <p className="fw-bold mb-2">Đánh giá phòng:</p>

      {reviews.length === 0 ? (
        <p className="text-muted small">Chưa có đánh giá nào.</p>
      ) : (
        <div className="review-list">
          {reviews.slice(0, 2).map((review) => (
            <div className="review-item" key={review.id}>
              <div className="d-flex justify-content-between">
                <strong>{review.customer_name}</strong>
                <span className="text-warning">
                  {"★".repeat(Number(review.rating))}
                </span>
              </div>

              <p className="mb-1 small">{review.comment}</p>

              <p className="text-muted small mb-0">{review.created_at}</p>
            </div>
          ))}
        </div>
      )}

      {user && user.role === "customer" && (
        <form className="review-form mt-3" onSubmit={handleSubmitReview}>
          {message && <div className="alert alert-success py-2">{message}</div>}

          <div className="mb-2">
            <label className="form-label small">Số sao</label>
            <select
              className="form-select form-select-sm"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          <div className="mb-2">
            <textarea
              className="form-control form-control-sm"
              rows="2"
              placeholder="Nhập đánh giá của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-outline-dark btn-sm">
            Gửi đánh giá
          </button>
        </form>
      )}
    </div>
  );
}

export default RoomReviews;