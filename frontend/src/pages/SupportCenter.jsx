import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "./SupportCenter.css";

function SupportCenter() {
  const { language, t } = useLanguage();

  const text = {
    heroLabel: language === "en" ? "Help Center" : "Trung tâm trợ giúp",
    heroTitle:
      language === "en"
        ? "How can we help you?"
        : "Chúng tôi có thể hỗ trợ gì cho bạn?",
    heroDesc:
      language === "en"
        ? "Customers can send questions about bookings, payments, cancellations, discount codes, or accounts. The admin will check and reply in the system."
        : "Khách hàng có thể gửi câu hỏi về đặt phòng, thanh toán, hủy phòng hoặc tài khoản. Admin sẽ kiểm tra và phản hồi trong hệ thống.",
    sendSupport:
      language === "en" ? "Send support request" : "Gửi câu hỏi hỗ trợ",
    myQuestions: language === "en" ? "My questions" : "Câu hỏi của tôi",
    name: language === "en" ? "Full name" : "Họ tên",
    email: "Email",
    category: language === "en" ? "Support topic" : "Chủ đề hỗ trợ",
    subject: language === "en" ? "Question title" : "Tiêu đề câu hỏi",
    message: language === "en" ? "Support message" : "Nội dung cần hỗ trợ",
    enterName: language === "en" ? "Enter full name" : "Nhập họ tên",
    enterEmail: language === "en" ? "Enter email" : "Nhập email",
    enterSubject:
      language === "en"
        ? "Example: I cannot see my payment status"
        : "Ví dụ: Tôi chưa thấy trạng thái thanh toán",
    enterMessage:
      language === "en"
        ? "Enter your question..."
        : "Nhập nội dung câu hỏi của bạn...",
    submit: language === "en" ? "Send question" : "Gửi câu hỏi",
    required:
      language === "en"
        ? "Please enter all support information."
        : "Vui lòng nhập đầy đủ thông tin hỗ trợ.",
    submitSuccess:
      language === "en"
        ? "Your question has been sent successfully. Please wait for the admin reply."
        : "Gửi câu hỏi thành công. Vui lòng chờ admin phản hồi.",
    empty:
      language === "en"
        ? "No questions yet. After you send a question, the admin reply will appear here."
        : "Chưa có câu hỏi nào. Sau khi gửi câu hỏi, phản hồi của admin sẽ hiển thị tại đây.",
    answered: language === "en" ? "Answered" : "Đã phản hồi",
    waiting: language === "en" ? "Waiting for reply" : "Đang chờ phản hồi",
    sentAt: language === "en" ? "Sent at" : "Gửi lúc",
    adminReply: language === "en" ? "Admin reply" : "Phản hồi từ admin",
    repliedAt: language === "en" ? "Replied at" : "Phản hồi lúc",
    noReply:
      language === "en"
        ? "The admin has not replied to this question yet."
        : "Admin chưa phản hồi câu hỏi này.",
  };

  const categories = [
    {
      value: "booking",
      vi: "Đặt phòng",
      en: "Booking",
    },
    {
      value: "payment",
      vi: "Thanh toán",
      en: "Payment",
    },
    {
      value: "cancellation",
      vi: "Hủy phòng",
      en: "Cancellation",
    },
    {
      value: "promotion",
      vi: "Mã giảm giá",
      en: "Discount code",
    },
    {
      value: "account",
      vi: "Tài khoản",
      en: "Account",
    },
    {
      value: "other",
      vi: "Khác",
      en: "Other",
    },
  ];

  const getCategoryLabel = (value) => {
    const found = categories.find((item) => item.value === value);

    if (found) {
      return language === "en" ? found.en : found.vi;
    }

    const oldCategoryMap = {
      "Đặt phòng": language === "en" ? "Booking" : "Đặt phòng",
      "Thanh toán": language === "en" ? "Payment" : "Thanh toán",
      "Hủy phòng": language === "en" ? "Cancellation" : "Hủy phòng",
      "Mã giảm giá": language === "en" ? "Discount code" : "Mã giảm giá",
      "Tài khoản": language === "en" ? "Account" : "Tài khoản",
      Khác: language === "en" ? "Other" : "Khác",
    };

    return oldCategoryMap[value] || value;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(language === "en" ? "en-US" : "vi-VN");
  };

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

  const [form, setForm] = useState({
    name: currentUser?.name || currentUser?.full_name || "",
    email: currentUser?.email || "",
    category: "booking",
    subject: "",
    message: "",
  });

  const [submittedEmail, setSubmittedEmail] = useState(
    currentUser?.email || ""
  );

  const [tickets, setTickets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("supportTickets") || "[]");
    } catch (error) {
      return [];
    }
  });

  const myTickets = useMemo(() => {
    const email = currentUser?.email || submittedEmail;

    if (!email) {
      return [];
    }

    return tickets.filter((ticket) => ticket.email === email);
  }, [tickets, currentUser, submittedEmail]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      alert(text.required);
      return;
    }

    const newTicket = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
      status: "waiting",
      reply: "",
      created_at: new Date().toISOString(),
      replied_at: "",
    };

    const updatedTickets = [newTicket, ...tickets];

    localStorage.setItem("supportTickets", JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    setSubmittedEmail(form.email.trim());

    setForm({
      ...form,
      subject: "",
      message: "",
    });

    alert(text.submitSuccess);
  };

  return (
    <div className="support-page">
      <section className="support-hero">
        <span>{text.heroLabel}</span>

        <h1>{text.heroTitle}</h1>

        <p>{text.heroDesc}</p>
      </section>

      <main className="support-container">
        <section className="support-card">
          <h2>{text.sendSupport}</h2>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-row">
              <div>
                <label>{text.name}</label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={text.enterName}
                />
              </div>

              <div>
                <label>{text.email}</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={text.enterEmail}
                />
              </div>
            </div>

            <div>
              <label>{text.category}</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {language === "en" ? item.en : item.vi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>{text.subject}</label>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder={text.enterSubject}
              />
            </div>

            <div>
              <label>{text.message}</label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder={text.enterMessage}
              ></textarea>
            </div>

            <button type="submit">{text.submit}</button>
          </form>
        </section>

        <section className="support-card">
          <h2>{text.myQuestions}</h2>

          {myTickets.length === 0 ? (
            <p className="support-empty">{text.empty}</p>
          ) : (
            <div className="ticket-list">
              {myTickets.map((ticket) => (
                <div className="ticket-item" key={ticket.id}>
                  <div className="ticket-top">
                    <span>{getCategoryLabel(ticket.category)}</span>

                    <strong>
                      {ticket.status === "answered"
                        ? text.answered
                        : text.waiting}
                    </strong>
                  </div>

                  <h3>{ticket.subject}</h3>

                  <p>{ticket.message}</p>

                  <small>
                    {text.sentAt}: {formatDateTime(ticket.created_at)}
                  </small>

                  {ticket.reply ? (
                    <div className="admin-reply">
                      <h4>{text.adminReply}</h4>

                      <p>{ticket.reply}</p>

                      <small>
                        {text.repliedAt}: {formatDateTime(ticket.replied_at)}
                      </small>
                    </div>
                  ) : (
                    <div className="waiting-reply">{text.noReply}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SupportCenter;