import { Link } from "react-router-dom";
import { useState } from "react";
import "./SupportCenter.css";

function AdminSupport() {
  const getCurrentUser = () => {
    try {
      const user =
        localStorage.getItem("user") ||
        localStorage.getItem("authUser") ||
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("authUser");

      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const [tickets, setTickets] = useState(() => {
    return JSON.parse(localStorage.getItem("supportTickets") || "[]");
  });

  const [replies, setReplies] = useState({});

  if (!isAdmin) {
    return (
      <div className="support-page">
        <main className="support-container">
          <section className="support-card">
            <h2>Không có quyền truy cập</h2>
            <p>Trang này chỉ dành cho quản trị viên.</p>
            <Link to="/" className="back-home-btn">
              Quay về trang chủ
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const handleReplyChange = (ticketId, value) => {
    setReplies({
      ...replies,
      [ticketId]: value,
    });
  };

  const handleSaveReply = (ticketId) => {
    const replyText = replies[ticketId];

    if (!replyText || !replyText.trim()) {
      alert("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          reply: replyText.trim(),
          status: "answered",
          replied_at: new Date().toLocaleString("vi-VN"),
        };
      }

      return ticket;
    });

    localStorage.setItem("supportTickets", JSON.stringify(updatedTickets));
    setTickets(updatedTickets);

    setReplies({
      ...replies,
      [ticketId]: "",
    });

    alert("Đã gửi phản hồi cho khách hàng.");
  };

  return (
    <div className="support-page">
      <section className="support-hero admin-support-hero">
        <span>Quản trị hỗ trợ</span>
        <h1>Phản hồi câu hỏi của khách hàng</h1>
        <p>
          Admin có thể xem các câu hỏi khách hàng gửi từ Trung tâm trợ giúp và
          nhập phản hồi trực tiếp trên hệ thống.
        </p>
      </section>

      <main className="support-container">
        <section className="support-card">
          <h2>Danh sách yêu cầu hỗ trợ</h2>

          {tickets.length === 0 ? (
            <p className="support-empty">Chưa có câu hỏi hỗ trợ nào.</p>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div className="ticket-item" key={ticket.id}>
                  <div className="ticket-top">
                    <span>{ticket.category}</span>
                    <strong>
                      {ticket.status === "answered"
                        ? "Đã phản hồi"
                        : "Đang chờ phản hồi"}
                    </strong>
                  </div>

                  <h3>{ticket.subject}</h3>

                  <div className="ticket-user">
                    <p>
                      <b>Khách hàng:</b> {ticket.name}
                    </p>
                    <p>
                      <b>Email:</b> {ticket.email}
                    </p>
                    <p>
                      <b>Thời gian gửi:</b> {ticket.created_at}
                    </p>
                  </div>

                  <p>{ticket.message}</p>

                  {ticket.reply && (
                    <div className="admin-reply">
                      <h4>Phản hồi hiện tại</h4>
                      <p>{ticket.reply}</p>
                      <small>Phản hồi lúc: {ticket.replied_at}</small>
                    </div>
                  )}

                  <div className="reply-form">
                    <label>Nhập phản hồi cho khách hàng</label>

                    <textarea
                      rows="4"
                      value={replies[ticket.id] || ""}
                      onChange={(e) =>
                        handleReplyChange(ticket.id, e.target.value)
                      }
                      placeholder="Ví dụ: Chào bạn, hệ thống đã ghi nhận yêu cầu của bạn..."
                    ></textarea>

                    <button
                      type="button"
                      onClick={() => handleSaveReply(ticket.id)}
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminSupport;