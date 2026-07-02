import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosClient.get("/admin/reviews");

      const data =
        response.data?.data?.reviews ||
        response.data?.reviews ||
        [];

      setReviews(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách đánh giá."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa đánh giá này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axiosClient.delete(`/admin/reviews/${id}`);

      setMessage("Xóa đánh giá thành công.");
      loadReviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa đánh giá này."
      );
    }
  };

  const renderStars = (rating) => {
    const starCount = Number(rating || 0);

    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quản lý đánh giá</h1>
        <p>Admin có thể xem và xóa các đánh giá phòng của khách hàng.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-card">
        <h2>Danh sách đánh giá</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : reviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Email</th>
                  <th>Phòng</th>
                  <th>Số sao</th>
                  <th>Nội dung</th>
                  <th>Ngày đánh giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.id}</td>

                    <td>{review.customer_name || "Không rõ"}</td>

                    <td>{review.customer_email || "Không có"}</td>

                    <td>
                      <strong>{review.room_number}</strong>
                      <br />
                      <span>{review.room_title}</span>
                    </td>

                    <td>
                      <span className="review-stars">
                        {renderStars(review.rating)}
                      </span>
                      <br />
                      <small>{review.rating}/5</small>
                    </td>

                    <td className="review-comment">
                      {review.comment}
                    </td>

                    <td>{review.created_at}</td>

                    <td>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(review.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReviews;