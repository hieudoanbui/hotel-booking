import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "./ForeignerGuide.css";

const guideContent = {
  vi: {
    label: "Dành cho khách nước ngoài",
    title: "Hướng dẫn đặt phòng khách sạn tại Việt Nam",
    desc: "Trang này giúp khách nước ngoài hiểu cách sử dụng hệ thống, đặt phòng, thanh toán và nhận hỗ trợ khi lưu trú tại Việt Nam.",
    stepsTitle: "Cách đặt phòng",
    steps: [
      {
        title: "Tìm phòng phù hợp",
        desc: "Vào trang Phòng để xem danh sách phòng, giá mỗi đêm, sức chứa và trạng thái phòng.",
      },
      {
        title: "Chọn ngày lưu trú",
        desc: "Nhập ngày nhận phòng và ngày trả phòng để hệ thống kiểm tra tình trạng phòng trống.",
      },
      {
        title: "Gửi yêu cầu đặt phòng",
        desc: "Sau khi chọn phòng, khách hàng gửi yêu cầu đặt phòng và chờ admin xác nhận.",
      },
      {
        title: "Thanh toán và nhận phòng",
        desc: "Khách hàng có thể thanh toán theo hướng dẫn. Sau khi admin xác nhận, đơn sẽ được cập nhật trạng thái.",
      },
    ],
    usefulTitle: "Thông tin hữu ích",
    useful: [
      "Nên kiểm tra kỹ ngày nhận phòng và ngày trả phòng trước khi đặt.",
      "Mang theo hộ chiếu hoặc giấy tờ tùy thân khi nhận phòng.",
      "Liên hệ Trung tâm trợ giúp nếu cần hỗ trợ về thanh toán, hủy phòng hoặc thay đổi lịch.",
      "Một số khách sạn có thể yêu cầu xác nhận thông tin trước khi nhận phòng.",
    ],
    supportTitle: "Cần hỗ trợ?",
    supportDesc:
      "Bạn có thể gửi câu hỏi tại Trung tâm trợ giúp. Admin sẽ xem và phản hồi trực tiếp trên hệ thống.",
    buttonRooms: "Xem danh sách phòng",
    buttonHelp: "Trung tâm trợ giúp",
  },

  en: {
    label: "For foreign visitors",
    title: "Hotel booking guide in Vietnam",
    desc: "This page helps foreign visitors understand how to use the system, book rooms, make payments, and get support while staying in Vietnam.",
    stepsTitle: "How to book a room",
    steps: [
      {
        title: "Find a suitable room",
        desc: "Go to the Rooms page to view room types, nightly prices, capacity, and room status.",
      },
      {
        title: "Choose your stay dates",
        desc: "Enter your check-in and check-out dates so the system can check room availability.",
      },
      {
        title: "Submit your booking request",
        desc: "After selecting a room, submit your booking request and wait for admin confirmation.",
      },
      {
        title: "Pay and check in",
        desc: "Follow the payment instructions. Once the admin confirms your payment, the booking status will be updated.",
      },
    ],
    usefulTitle: "Useful information",
    useful: [
      "Please check your check-in and check-out dates carefully before booking.",
      "Bring your passport or valid identification when checking in.",
      "Contact the Help Center if you need support with payment, cancellation, or schedule changes.",
      "Some hotels may require information confirmation before check-in.",
    ],
    supportTitle: "Need help?",
    supportDesc:
      "You can submit your question at the Help Center. The admin will review and reply directly in the system.",
    buttonRooms: "View rooms",
    buttonHelp: "Help Center",
  },
};

function ForeignerGuide() {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage("en");
  }, [setLanguage]);

  const content = guideContent[language] || guideContent.en;

  return (
    <div className="foreigner-page">
      <section className="foreigner-hero">
        <span>{content.label}</span>

        <h1>{content.title}</h1>

        <p>{content.desc}</p>

        <div className="foreigner-actions">
          <Link to="/rooms">{content.buttonRooms}</Link>

          <Link to="/help" className="secondary">
            {content.buttonHelp}
          </Link>
        </div>
      </section>

      <main className="foreigner-container">
        <section className="foreigner-section">
          <div className="foreigner-title">
            <span>01</span>

            <h2>{content.stepsTitle}</h2>
          </div>

          <div className="foreigner-step-grid">
            {content.steps.map((step, index) => (
              <div className="foreigner-step-card" key={step.title}>
                <div className="step-index">{index + 1}</div>

                <h3>{step.title}</h3>

                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="foreigner-section">
          <div className="foreigner-title">
            <span>02</span>

            <h2>{content.usefulTitle}</h2>
          </div>

          <div className="useful-list">
            {content.useful.map((item) => (
              <div className="useful-item" key={item}>
                <span>✓</span>

                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="foreigner-support-box">
          <h2>{content.supportTitle}</h2>

          <p>{content.supportDesc}</p>

          <Link to="/help">{content.buttonHelp}</Link>
        </section>
      </main>
    </div>
  );
}

export default ForeignerGuide;