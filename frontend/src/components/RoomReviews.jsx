import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";

function RoomReviews({ roomId }) {
  const { language } = useLanguage();

  let user = null;

  try {
    user =
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("authUser") || "null");
  } catch (error) {
    user = null;
  }

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const text = {
    title: language === "en" ? "Room reviews:" : "Đánh giá phòng:",
    noReviews:
      language === "en" ? "No reviews yet." : "Chưa có đánh giá nào.",
    rating: language === "en" ? "Rating" : "Số sao",
    star: language === "en" ? "stars" : "sao",
    commentPlaceholder:
      language === "en"
        ? "Enter your review..."
        : "Nhập đánh giá của bạn...",
    submit: language === "en" ? "Submit review" : "Gửi đánh giá",
    loginRequired:
      language === "en"
        ? "You need to sign in to write a review."
        : "Bạn cần đăng nhập để đánh giá.",
    customerOnly:
      language === "en"
        ? "Only customers can review rooms."
        : "Chỉ khách hàng mới có thể đánh giá phòng.",
    emptyComment:
      language === "en"
        ? "Please enter your review content."
        : "Vui lòng nhập nội dung đánh giá.",
    submitSuccess:
      language === "en"
        ? "Review submitted successfully."
        : "Gửi đánh giá thành công.",
    submitFailed:
      language === "en"
        ? "Failed to submit review. Please try again."
        : "Gửi đánh giá thất bại. Vui lòng thử lại.",
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosClient.get(`/rooms/${roomId}/reviews`);
      setReviews(response.data?.data?.reviews || []);
    } catch (error) {
      console.error("Room reviews loading error:", error);
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
      alert(text.loginRequired);
      return;
    }

    if (user.role !== "customer") {
      alert(text.customerOnly);
      return;
    }

    if (!comment.trim()) {
      alert(text.emptyComment);
      return;
    }

    try {
      await axiosClient.post("/reviews", {
        room_id: roomId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setMessage(text.submitSuccess);
      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (error) {
      const errorMessage =
        language === "en"
          ? text.submitFailed
          : error.response?.data?.message || text.submitFailed;

      alert(errorMessage);
    }
  };

  return (
    <div className="room-reviews mt-3">
      <p className="fw-bold mb-2">{text.title}</p>

      {reviews.length === 0 ? (
        <p className="text-muted small">{text.noReviews}</p>
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
            <label className="form-label small">{text.rating}</label>

            <select
              className="form-select form-select-sm"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 {text.star}</option>
              <option value="4">4 {text.star}</option>
              <option value="3">3 {text.star}</option>
              <option value="2">2 {text.star}</option>
              <option value="1">1 {text.star}</option>
            </select>
          </div>

          <div className="mb-2">
            <textarea
              className="form-control form-control-sm"
              rows="2"
              placeholder={text.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-outline-dark btn-sm">
            {text.submit}
          </button>
        </form>
      )}
    </div>
  );
}

export default RoomReviews;