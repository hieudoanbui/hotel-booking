import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "./InfoPage.css";

const pageContent = {
  vi: {
    faq: {
      title: "Câu hỏi thường gặp",
      subtitle: "Một số câu hỏi phổ biến khi sử dụng hệ thống đặt phòng.",
      sections: [
        {
          heading: "Làm thế nào để đặt phòng?",
          content:
            "Khách hàng vào trang danh sách phòng, chọn phòng phù hợp, nhập ngày nhận phòng, ngày trả phòng, dịch vụ đi kèm và gửi yêu cầu đặt phòng.",
        },
        {
          heading: "Sau khi đặt phòng, đơn có được xác nhận ngay không?",
          content:
            "Sau khi đặt phòng, đơn sẽ ở trạng thái chờ xác nhận. Admin sẽ kiểm tra và xác nhận đơn trên hệ thống.",
        },
        {
          heading: "Tôi có thể hủy đơn đặt phòng không?",
          content:
            "Khách hàng có thể hủy đơn khi đơn vẫn đang ở trạng thái chờ xác nhận. Nếu đơn đã được xác nhận, khách hàng cần liên hệ bộ phận hỗ trợ.",
        },
      ],
    },

    "privacy-policy": {
      title: "Chính sách bảo mật",
      subtitle: "Cam kết bảo vệ thông tin cá nhân của người dùng.",
      sections: [
        {
          heading: "Thông tin được thu thập",
          content:
            "Hệ thống có thể lưu các thông tin như họ tên, email, số điện thoại, lịch sử đặt phòng và thông tin liên quan đến quá trình sử dụng dịch vụ.",
        },
        {
          heading: "Mục đích sử dụng thông tin",
          content:
            "Thông tin người dùng được sử dụng để xác thực tài khoản, xử lý đặt phòng, hỗ trợ khách hàng và quản lý lịch sử giao dịch.",
        },
        {
          heading: "Bảo vệ dữ liệu",
          content:
            "Mật khẩu người dùng được mã hóa trước khi lưu trữ. Hệ thống có phân quyền giữa khách hàng và quản trị viên để hạn chế truy cập trái phép.",
        },
      ],
    },

    "cookie-policy": {
      title: "Chính sách cookie",
      subtitle: "Giải thích cách hệ thống sử dụng cookie và phiên đăng nhập.",
      sections: [
        {
          heading: "Cookie là gì?",
          content:
            "Cookie là dữ liệu nhỏ được lưu trên trình duyệt để giúp hệ thống ghi nhớ phiên đăng nhập và một số tùy chọn của người dùng.",
        },
        {
          heading: "Hệ thống sử dụng cookie để làm gì?",
          content:
            "Cookie được dùng để quản lý phiên đăng nhập, giúp người dùng không cần đăng nhập lại liên tục trong cùng một phiên sử dụng.",
        },
        {
          heading: "Người dùng có thể tắt cookie không?",
          content:
            "Người dùng có thể tắt cookie trong trình duyệt, tuy nhiên một số chức năng như đăng nhập, đặt phòng hoặc xem lịch sử đặt phòng có thể không hoạt động chính xác.",
        },
      ],
    },

    terms: {
      title: "Điều khoản sử dụng",
      subtitle: "Quy định chung khi sử dụng hệ thống đặt phòng khách sạn.",
      sections: [
        {
          heading: "Trách nhiệm của người dùng",
          content:
            "Người dùng cần cung cấp thông tin chính xác khi đăng ký tài khoản và đặt phòng. Không sử dụng hệ thống cho mục đích gây rối hoặc truy cập trái phép.",
        },
        {
          heading: "Trách nhiệm của hệ thống",
          content:
            "Hệ thống hỗ trợ khách hàng tìm phòng, đặt phòng, theo dõi trạng thái đơn và liên hệ hỗ trợ khi cần thiết.",
        },
        {
          heading: "Thay đổi điều khoản",
          content:
            "Các điều khoản có thể được cập nhật để phù hợp với quá trình phát triển và vận hành hệ thống.",
        },
      ],
    },

    "cancellation-policy": {
      title: "Chính sách hủy phòng",
      subtitle: "Quy định về việc hủy đơn đặt phòng.",
      sections: [
        {
          heading: "Hủy đơn khi chờ xác nhận",
          content:
            "Khách hàng có thể hủy đơn nếu đơn đặt phòng vẫn đang ở trạng thái chờ xác nhận.",
        },
        {
          heading: "Hủy đơn sau khi đã xác nhận",
          content:
            "Nếu đơn đã được admin xác nhận, khách hàng cần liên hệ Trung tâm trợ giúp để được hỗ trợ xử lý.",
        },
        {
          heading: "Hoàn tiền",
          content:
            "Trong phạm vi bài tập lớn, hệ thống mới mô phỏng quy trình thanh toán nên chưa tích hợp hoàn tiền tự động.",
        },
      ],
    },

    "payment-policy": {
      title: "Chính sách thanh toán",
      subtitle: "Thông tin về cách hệ thống xử lý thanh toán.",
      sections: [
        {
          heading: "Hình thức thanh toán",
          content:
            "Khách hàng có thể thanh toán trực tiếp tại khách sạn hoặc chuyển khoản theo hướng dẫn được hiển thị trong hệ thống.",
        },
        {
          heading: "Xác nhận thanh toán",
          content:
            "Khi khách hàng bấm 'Tôi đã thanh toán', hệ thống chỉ ghi nhận yêu cầu chờ duyệt. Admin sẽ kiểm tra và xác nhận trước khi chuyển trạng thái sang đã thanh toán.",
        },
        {
          heading: "Bảo mật thanh toán",
          content:
            "Hệ thống không lưu thông tin thẻ ngân hàng của khách hàng. Quy trình thanh toán hiện được mô phỏng để phục vụ bài tập lớn.",
        },
      ],
    },

    about: {
      title: "Giới thiệu hệ thống",
      subtitle: "Thông tin tổng quan về website Hotel Booking.",
      sections: [
        {
          heading: "Mục tiêu",
          content:
            "Website được xây dựng nhằm hỗ trợ khách hàng đặt phòng trực tuyến và hỗ trợ admin quản lý phòng, đơn đặt phòng, hóa đơn, thanh toán và thống kê.",
        },
        {
          heading: "Công nghệ",
          content:
            "Hệ thống sử dụng React cho Frontend, PHP 8 cho Backend, MySQL cho cơ sở dữ liệu và Axios để giao tiếp API.",
        },
      ],
    },

    contact: {
      title: "Liên hệ",
      subtitle: "Thông tin liên hệ của hệ thống.",
      sections: [
        {
          heading: "Thông tin hỗ trợ",
          content:
            "Email: support@hotelbooking.vn. Hotline: 1900 8888. Địa chỉ: Đại học Phenikaa, Hà Nội.",
        },
        {
          heading: "Gửi yêu cầu hỗ trợ",
          content:
            "Khách hàng có thể truy cập Trung tâm trợ giúp để gửi câu hỏi và chờ admin phản hồi.",
        },
      ],
    },
  },

  en: {
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions when using the hotel booking system.",
      sections: [
        {
          heading: "How do I book a room?",
          content:
            "Go to the Rooms page, choose a suitable room, enter your check-in and check-out dates, select extra services if needed, and submit your booking request.",
        },
        {
          heading: "Is my booking confirmed immediately?",
          content:
            "After booking, your request will be marked as pending. The administrator will check and confirm the booking in the system.",
        },
        {
          heading: "Can I cancel my booking?",
          content:
            "You can cancel a booking while it is still pending. If the booking has already been confirmed, please contact the Help Center for support.",
        },
      ],
    },

    "privacy-policy": {
      title: "Privacy Policy",
      subtitle: "Our commitment to protecting user personal information.",
      sections: [
        {
          heading: "Information collected",
          content:
            "The system may store information such as your full name, email, phone number, booking history, and other information related to your use of the service.",
        },
        {
          heading: "Purpose of using information",
          content:
            "User information is used for account authentication, booking processing, customer support, and transaction history management.",
        },
        {
          heading: "Data protection",
          content:
            "User passwords are encrypted before storage. The system uses role-based access for customers and administrators to reduce unauthorized access.",
        },
      ],
    },

    "cookie-policy": {
      title: "Cookie Policy",
      subtitle: "How the system uses cookies and login sessions.",
      sections: [
        {
          heading: "What are cookies?",
          content:
            "Cookies are small pieces of data stored in your browser to help the system remember login sessions and certain user preferences.",
        },
        {
          heading: "Why does the system use cookies?",
          content:
            "Cookies are used to manage login sessions, so users do not need to sign in repeatedly during the same session.",
        },
        {
          heading: "Can users disable cookies?",
          content:
            "Users can disable cookies in their browser, but some functions such as signing in, booking rooms, or viewing booking history may not work correctly.",
        },
      ],
    },

    terms: {
      title: "Terms of Use",
      subtitle: "General rules for using the hotel booking system.",
      sections: [
        {
          heading: "User responsibilities",
          content:
            "Users should provide accurate information when creating an account and booking rooms. Do not use the system for disruptive purposes or unauthorized access.",
        },
        {
          heading: "System responsibilities",
          content:
            "The system supports customers in finding rooms, booking rooms, tracking booking status, and contacting support when needed.",
        },
        {
          heading: "Changes to terms",
          content:
            "These terms may be updated to match the development and operation of the system.",
        },
      ],
    },

    "cancellation-policy": {
      title: "Cancellation Policy",
      subtitle: "Rules for cancelling hotel bookings.",
      sections: [
        {
          heading: "Cancelling a pending booking",
          content:
            "Customers can cancel a booking if it is still in pending status.",
        },
        {
          heading: "Cancelling after confirmation",
          content:
            "If the booking has already been confirmed by the administrator, customers should contact the Help Center for support.",
        },
        {
          heading: "Refunds",
          content:
            "Within the scope of this coursework project, the system only simulates the payment process and does not include automatic refunds.",
        },
      ],
    },

    "payment-policy": {
      title: "Payment Policy",
      subtitle: "Information about how payments are handled in the system.",
      sections: [
        {
          heading: "Payment methods",
          content:
            "Customers can pay directly at the hotel or transfer money using the payment instructions displayed in the system.",
        },
        {
          heading: "Payment confirmation",
          content:
            "When customers click 'I have paid', the system records a pending payment confirmation request. The administrator will check and approve it before marking the payment as paid.",
        },
        {
          heading: "Payment security",
          content:
            "The system does not store customer bank card information. The payment process is simulated for the coursework project.",
        },
      ],
    },

    about: {
      title: "About the System",
      subtitle: "Overview information about the Hotel Booking website.",
      sections: [
        {
          heading: "Objective",
          content:
            "The website is built to help customers book rooms online and help administrators manage rooms, bookings, invoices, payments, and statistics.",
        },
        {
          heading: "Technology",
          content:
            "The system uses React for the Frontend, PHP 8 for the Backend, MySQL for the database, and Axios for API communication.",
        },
      ],
    },

    contact: {
      title: "Contact",
      subtitle: "System contact information.",
      sections: [
        {
          heading: "Support information",
          content:
            "Email: support@hotelbooking.vn. Hotline: 1900 8888. Address: Phenikaa University, Hanoi.",
        },
        {
          heading: "Send a support request",
          content:
            "Customers can visit the Help Center to submit a question and wait for the administrator's reply.",
        },
      ],
    },
  },
};

function InfoPage() {
  const { type } = useParams();
  const { language } = useLanguage();

  const currentContent = pageContent[language] || pageContent.vi;
  const page = currentContent[type];

  const text = {
    notFoundTitle:
      language === "en" ? "Page not found" : "Không tìm thấy trang",
    notFoundDesc:
      language === "en"
        ? "The content you are looking for does not exist."
        : "Nội dung bạn đang tìm không tồn tại.",
    backHome: language === "en" ? "Back to home" : "Quay về trang chủ",
    needMoreHelp:
      language === "en" ? "Need more help?" : "Cần hỗ trợ thêm?",
  };

  if (!page) {
    return (
      <div className="info-page">
        <div className="info-container">
          <h1>{text.notFoundTitle}</h1>

          <p>{text.notFoundDesc}</p>

          <Link to="/" className="info-btn">
            {text.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="info-page">
      <section className="info-hero">
        <span>Hotel Booking</span>

        <h1>{page.title}</h1>

        <p>{page.subtitle}</p>
      </section>

      <main className="info-container">
        {page.sections.map((section) => (
          <section className="info-card" key={section.heading}>
            <h2>{section.heading}</h2>

            <p>{section.content}</p>
          </section>
        ))}

        <div className="info-actions">
          <Link to="/help" className="info-btn">
            {text.needMoreHelp}
          </Link>

          <Link to="/" className="info-btn secondary">
            {text.backHome}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default InfoPage;