import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useLanguage } from "../i18n/LanguageContext";
import "./Home.css";

const destinationImages = {
  danang:
    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80",
  nhatrang:
    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80",
  hanoi:
    "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=900&q=80",
  hochiminh:
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80",
};

const homeContent = {
  vi: {
    roomsOnSystem: "Xem phòng trên hệ thống",
    goAdminShort: "Vào quản trị",
    seeHistory: "Xem lịch sử",
    manageRooms: "Quản lý phòng",
    discoverRooms: "Khám phá phòng",
    modalLabel: "Khám phá điểm đến",
    placesTitle: "Địa điểm gợi ý",
    recommendLabel: "Gợi ý",
    seeSuitableRooms: "Xem phòng phù hợp",
    priceSuffix: "đ",
    destinations: [
      {
        id: "danang",
        name: "Đà Nẵng",
        desc: "Thành phố biển hiện đại, năng động",
        history:
          "Đà Nẵng là một trong những thành phố du lịch nổi bật của miền Trung Việt Nam. Thành phố nằm bên sông Hàn, có vị trí kết nối giữa Huế, Hội An và Mỹ Sơn. Đà Nẵng nổi tiếng với bãi biển đẹp, những cây cầu hiện đại và môi trường sống năng động.",
        places: [
          "Bà Nà Hills",
          "Cầu Rồng",
          "Biển Mỹ Khê",
          "Ngũ Hành Sơn",
          "Bán đảo Sơn Trà",
        ],
        recommend:
          "Phù hợp với khách thích du lịch biển, nghỉ dưỡng, vui chơi giải trí và khám phá thành phố hiện đại.",
      },
      {
        id: "nhatrang",
        name: "Nha Trang",
        desc: "Thiên đường biển xanh và nghỉ dưỡng",
        history:
          "Nha Trang là thành phố biển nổi tiếng của tỉnh Khánh Hòa, được biết đến với vịnh biển đẹp, khí hậu dễ chịu và hệ thống đảo phong phú. Đây là điểm đến quan trọng của du lịch Việt Nam nhờ cảnh quan biển đảo và dịch vụ nghỉ dưỡng.",
        places: [
          "VinWonders Nha Trang",
          "Hòn Mun",
          "Tháp Bà Ponagar",
          "Bãi Dài",
          "Viện Hải dương học",
        ],
        recommend:
          "Phù hợp với khách thích nghỉ dưỡng ven biển, lặn biển, tham quan đảo và trải nghiệm dịch vụ cao cấp.",
      },
      {
        id: "hanoi",
        name: "Hà Nội",
        desc: "Thủ đô nghìn năm văn hiến",
        history:
          "Hà Nội là thủ đô của Việt Nam, có lịch sử hơn một nghìn năm kể từ thời Thăng Long. Thành phố lưu giữ nhiều giá trị văn hóa, kiến trúc và lịch sử quan trọng, nổi bật với phố cổ, hồ Hoàn Kiếm và ẩm thực truyền thống.",
        places: [
          "Hồ Hoàn Kiếm",
          "Phố cổ Hà Nội",
          "Văn Miếu - Quốc Tử Giám",
          "Lăng Chủ tịch Hồ Chí Minh",
          "Hoàng thành Thăng Long",
        ],
        recommend:
          "Phù hợp với khách thích tìm hiểu lịch sử, văn hóa, ẩm thực và không gian đô thị cổ.",
      },
      {
        id: "hochiminh",
        name: "Hồ Chí Minh",
        desc: "Trung tâm sôi động bậc nhất Việt Nam",
        history:
          "Thành phố Hồ Chí Minh là trung tâm kinh tế, văn hóa và du lịch lớn của Việt Nam. Thành phố có nhịp sống hiện đại, năng động nhưng vẫn lưu giữ nhiều công trình lịch sử gắn với quá trình phát triển của đất nước.",
        places: [
          "Nhà thờ Đức Bà",
          "Dinh Độc Lập",
          "Chợ Bến Thành",
          "Phố đi bộ Nguyễn Huệ",
          "Bảo tàng Chứng tích Chiến tranh",
        ],
        recommend:
          "Phù hợp với khách thích thành phố năng động, mua sắm, ẩm thực và tham quan các công trình lịch sử.",
      },
    ],
    promoBanners: [
      {
        badge: "Ưu đãi chỗ ở",
        title: "Giảm đến 20%",
        desc: "Đặt phòng hôm nay để nhận ưu đãi đặc biệt cho kỳ nghỉ của bạn.",
        note: "Áp dụng từ 01/07 đến 10/07",
        code: "SALE20",
        icon: "🏨",
        className: "deal-blue",
      },
      {
        badge: "Khách hàng mới",
        title: "Giảm 10%",
        desc: "Ưu đãi dành riêng cho khách hàng lần đầu đặt phòng trên hệ thống.",
        note: "Áp dụng cho tài khoản mới",
        code: "NEW10",
        icon: "🎁",
        className: "deal-purple",
      },
      {
        badge: "Cuối tuần",
        title: "Giảm 15%",
        desc: "Ưu đãi cho khách đặt phòng vào thứ 6, thứ 7 và chủ nhật.",
        note: "Áp dụng cuối tuần",
        code: "WEEKEND15",
        icon: "🌴",
        className: "deal-orange",
      },
      {
        badge: "Thanh toán linh hoạt",
        title: "Giảm 5%",
        desc: "Ưu đãi cho khách đặt phòng và xác nhận thanh toán sớm.",
        note: "Áp dụng khi đặt trước",
        code: "PAY5",
        icon: "💳",
        className: "deal-green",
      },
    ],
    benefitsList: [
      {
        icon: "🏨",
        title: "Phòng đa dạng",
        desc: "Nhiều loại phòng phù hợp với nhu cầu nghỉ dưỡng, công tác và du lịch.",
      },
      {
        icon: "⚡",
        title: "Đặt phòng nhanh",
        desc: "Quy trình đặt phòng rõ ràng, kiểm tra phòng trống trực tiếp trên hệ thống.",
      },
      {
        icon: "🔒",
        title: "Thông tin an toàn",
        desc: "Tài khoản được xác thực, mật khẩu được mã hóa và phân quyền rõ ràng.",
      },
      {
        icon: "💳",
        title: "Thanh toán linh hoạt",
        desc: "Hỗ trợ thanh toán trực tiếp hoặc chuyển khoản, admin xác nhận trước khi hoàn tất.",
      },
    ],
    customerSteps: [
      {
        number: "01",
        title: "Chọn phòng",
        desc: "Xem danh sách phòng, giá, sức chứa và tiện nghi.",
      },
      {
        number: "02",
        title: "Chọn ngày",
        desc: "Nhập ngày nhận phòng và ngày trả phòng để kiểm tra phòng trống.",
      },
      {
        number: "03",
        title: "Đặt phòng",
        desc: "Gửi yêu cầu đặt phòng và theo dõi trạng thái trong tài khoản.",
      },
      {
        number: "04",
        title: "Thanh toán",
        desc: "Thực hiện thanh toán và chờ admin xác nhận.",
      },
    ],
    adminSteps: [
      {
        number: "01",
        title: "Xem Dashboard",
        desc: "Theo dõi tổng quan phòng, đơn đặt phòng, hóa đơn và doanh thu.",
      },
      {
        number: "02",
        title: "Quản lý phòng",
        desc: "Thêm, sửa, cập nhật giá, trạng thái và thông tin phòng.",
      },
      {
        number: "03",
        title: "Xử lý đơn",
        desc: "Xác nhận, hủy hoặc xem chi tiết các đơn đặt phòng.",
      },
      {
        number: "04",
        title: "Duyệt thanh toán",
        desc: "Kiểm tra yêu cầu thanh toán của khách và cập nhật trạng thái.",
      },
    ],
  },

  en: {
    roomsOnSystem: "View system rooms",
    goAdminShort: "Admin panel",
    seeHistory: "View history",
    manageRooms: "Manage rooms",
    discoverRooms: "Explore rooms",
    modalLabel: "Explore destination",
    placesTitle: "Recommended places",
    recommendLabel: "Suggestion",
    seeSuitableRooms: "View suitable rooms",
    priceSuffix: " VND",
    destinations: [
      {
        id: "danang",
        name: "Da Nang",
        desc: "A modern and dynamic coastal city",
        history:
          "Da Nang is one of the most popular tourist cities in Central Vietnam. Located by the Han River, it connects Hue, Hoi An, and My Son. The city is famous for beautiful beaches, modern bridges, and a vibrant lifestyle.",
        places: [
          "Ba Na Hills",
          "Dragon Bridge",
          "My Khe Beach",
          "Marble Mountains",
          "Son Tra Peninsula",
        ],
        recommend:
          "Suitable for travelers who enjoy beaches, resorts, entertainment, and modern city exploration.",
      },
      {
        id: "nhatrang",
        name: "Nha Trang",
        desc: "A paradise of blue sea and resorts",
        history:
          "Nha Trang is a famous coastal city in Khanh Hoa Province, known for its beautiful bay, pleasant climate, and rich island system.",
        places: [
          "VinWonders Nha Trang",
          "Hon Mun Island",
          "Ponagar Tower",
          "Bai Dai Beach",
          "Institute of Oceanography",
        ],
        recommend:
          "Suitable for travelers who enjoy beach resorts, diving, island tours, and premium services.",
      },
      {
        id: "hanoi",
        name: "Ha Noi",
        desc: "The thousand-year-old capital of Vietnam",
        history:
          "Ha Noi is the capital of Vietnam with more than a thousand years of history since the Thang Long period. The city preserves important cultural, architectural, and historical values.",
        places: [
          "Hoan Kiem Lake",
          "Ha Noi Old Quarter",
          "Temple of Literature",
          "Ho Chi Minh Mausoleum",
          "Imperial Citadel of Thang Long",
        ],
        recommend:
          "Suitable for travelers interested in history, culture, cuisine, and old urban spaces.",
      },
      {
        id: "hochiminh",
        name: "Ho Chi Minh City",
        desc: "One of the most vibrant cities in Vietnam",
        history:
          "Ho Chi Minh City is a major economic, cultural, and tourism center of Vietnam. It has a modern and dynamic lifestyle while preserving many historical landmarks.",
        places: [
          "Notre-Dame Cathedral",
          "Independence Palace",
          "Ben Thanh Market",
          "Nguyen Hue Walking Street",
          "War Remnants Museum",
        ],
        recommend:
          "Suitable for travelers who enjoy dynamic cities, shopping, cuisine, and historical attractions.",
      },
    ],
    promoBanners: [
      {
        badge: "Accommodation deal",
        title: "Up to 20% off",
        desc: "Book today to receive special offers for your trip.",
        note: "Valid from 01/07 to 10/07",
        code: "SALE20",
        icon: "🏨",
        className: "deal-blue",
      },
      {
        badge: "New customers",
        title: "10% off",
        desc: "A special offer for first-time customers on the system.",
        note: "For new accounts",
        code: "NEW10",
        icon: "🎁",
        className: "deal-purple",
      },
      {
        badge: "Weekend deal",
        title: "15% off",
        desc: "Discount for bookings on Friday, Saturday, and Sunday.",
        note: "Valid on weekends",
        code: "WEEKEND15",
        icon: "🌴",
        className: "deal-orange",
      },
      {
        badge: "Flexible payment",
        title: "5% off",
        desc: "Offer for customers who book and confirm payment early.",
        note: "Valid for early bookings",
        code: "PAY5",
        icon: "💳",
        className: "deal-green",
      },
    ],
    benefitsList: [
      {
        icon: "🏨",
        title: "Various rooms",
        desc: "Many room types for leisure, business trips, and travel needs.",
      },
      {
        icon: "⚡",
        title: "Fast booking",
        desc: "A clear booking process with real-time availability checking.",
      },
      {
        icon: "🔒",
        title: "Secure information",
        desc: "Accounts are authenticated, passwords are encrypted, and roles are clearly managed.",
      },
      {
        icon: "💳",
        title: "Flexible payment",
        desc: "Support for direct payment or bank transfer, with admin confirmation.",
      },
    ],
    customerSteps: [
      {
        number: "01",
        title: "Choose a room",
        desc: "View room lists, prices, capacity, and amenities.",
      },
      {
        number: "02",
        title: "Choose dates",
        desc: "Enter check-in and check-out dates to check availability.",
      },
      {
        number: "03",
        title: "Book the room",
        desc: "Submit your booking request and track its status in your account.",
      },
      {
        number: "04",
        title: "Payment",
        desc: "Make payment and wait for admin confirmation.",
      },
    ],
    adminSteps: [
      {
        number: "01",
        title: "View dashboard",
        desc: "Monitor rooms, bookings, invoices, and revenue overview.",
      },
      {
        number: "02",
        title: "Manage rooms",
        desc: "Add, edit, update prices, status, and room information.",
      },
      {
        number: "03",
        title: "Process bookings",
        desc: "Confirm, cancel, or view details of booking requests.",
      },
      {
        number: "04",
        title: "Approve payments",
        desc: "Check payment requests and update payment status.",
      },
    ],
  },
};

function getHomeContent(language) {
  return homeContent[language] || homeContent.en;
}

function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const copy = getHomeContent(language);

  const homeText = {
    badge: t.home?.badge || "Hotel Booking System",
    heroTitle: t.home?.heroTitle || copy.heroTitle,
    heroDesc: t.home?.heroDesc || copy.heroDesc,
    adminHeroTitle: t.home?.adminHeroTitle || copy.adminHeroTitle,
    adminHeroDesc: t.home?.adminHeroDesc || copy.adminHeroDesc,
    viewRooms: t.home?.viewRooms || t.common?.viewAll || "View rooms",
    exploreMore: t.home?.exploreMore || "Explore more",
    goAdmin: t.home?.goAdmin || t.nav?.adminPage || "Admin panel",
    role: t.home?.role || "Role",
    adminRole: t.home?.adminRole || t.nav?.administrator || "Administrator",
    destination: t.home?.destination || "Destination",
    vietnam: t.home?.vietnam || "Vietnam",
    management: t.home?.management || "Management",
    roomsAndBookings: t.home?.roomsAndBookings || "Rooms and bookings",
    checkIn: t.home?.checkIn || "Check-in date",
    checkOut: t.home?.checkOut || "Check-out date",
    chooseWhenBooking: t.home?.chooseWhenBooking || "Choose when booking",
    tracking: t.home?.tracking || "Tracking",
    invoicesAndPayments: t.home?.invoicesAndPayments || "Invoices and payments",
    findRoom: t.home?.findRoom || t.common?.search || "Search rooms",
    statsRooms: t.home?.statsRooms || "Active rooms",
    statsSupport: t.home?.statsSupport || "Booking support",
    statsAvailability: t.home?.statsAvailability || "Availability checking",
    statsRoles: t.home?.statsRoles || "User roles",
    destinationSection: t.home?.destinationSection || "Destinations",
    destinationTitle: t.home?.destinationTitle || "Popular destinations",
    promo: t.home?.promo || "Promotions",
    promoTitle: t.home?.promoTitle || "Special offers for hotel guests",
    viewAll: t.home?.viewAll || t.common?.viewAll || "View all",
    promoCode: t.home?.promoCode || "Promotion code",
    useCode: t.home?.useCode || "Use this code",
    featuredRooms: t.home?.featuredRooms || "Featured rooms",
    featuredRoomsTitle:
      t.home?.featuredRoomsTitle || "Recommended rooms for you",
    adminFeaturedRoomsTitle:
      t.home?.adminFeaturedRoomsTitle ||
      "Rooms currently displayed in the system",
    hotelRoom: t.home?.roomType || t.home?.hotelRoom || "Hotel room",
    capacity: t.home?.capacity || t.common?.capacity || "Capacity",
    guests: t.home?.guests || t.common?.guests || "guests",
    status: t.home?.status || t.common?.status || "Status",
    active: t.home?.active || "Active",
    maintenance: t.home?.maintenance || "Maintenance",
    perNight: t.home?.perNight || t.common?.night || "night",
    bookRoom: t.home?.bookRoom || t.common?.bookRoom || "Book room",
    manage: t.home?.manage || t.common?.manage || "Manage",
    emptyRoom:
      t.home?.emptyRoom || "No featured room data. Please check the room API.",
    promoBoxLabel: t.home?.promoBoxLabel || "Special offer",
    promoBoxTitle: t.home?.promoBoxTitle || "Book today and enjoy deals",
    promoBoxDesc:
      t.home?.promoBoxDesc ||
      "Customers can book online and track payment status directly in the system.",
    adminPromoBoxLabel: t.home?.adminPromoBoxLabel || "System administration",
    adminPromoBoxTitle:
      t.home?.adminPromoBoxTitle ||
      "Monitor and manage hotel operations in one place",
    adminPromoBoxDesc:
      t.home?.adminPromoBoxDesc ||
      "Administrators can manage rooms, bookings, invoices, payments, services, promotions, and statistics.",
    manageSystem: t.home?.manageSystem || "Manage system",
    bookNow: t.home?.bookNow || t.common?.bookNow || "Book now",
    benefits: t.home?.benefits || "Why choose us",
    benefitsTitle: t.home?.benefitsTitle || "Why should you use our system?",
    process: t.home?.process || "Process",
    processTitle: t.home?.processTitle || "Book a room in a few simple steps",
    adminProcessTitle:
      t.home?.adminProcessTitle ||
      "Manage the system with a clear workflow",
    finalTitle: t.home?.finalTitle || "Ready for your next trip?",
    finalDesc:
      t.home?.finalDesc ||
      "Explore hotel rooms and book the one that suits your needs today.",
    adminFinalTitle:
      t.home?.adminFinalTitle || "Ready to manage the system?",
    adminFinalDesc:
      t.home?.adminFinalDesc ||
      "Access the admin panel to monitor rooms, bookings, invoices, and payments.",
  };

  const destinations = copy.destinations.map((item) => ({
    ...item,
    image: destinationImages[item.id],
  }));

  const promoBanners = copy.promoBanners;
  const benefits = copy.benefitsList;

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

  const adminDashboardPath = "/admin/dashboard";
  const adminRoomsPath = "/admin/rooms";
  const customerRoomsPath = "/rooms";

  const mainActionPath = isAdmin ? adminDashboardPath : customerRoomsPath;
  const roomActionPath = isAdmin ? adminRoomsPath : customerRoomsPath;

  const steps = isAdmin ? copy.adminSteps : copy.customerSteps;

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const imageBaseUrl = isLocalhost
    ? "http://localhost/hotel-booking/backend/public/images/"
    : "https://doanhieu283.rf.gd/backend/public/images/";

  useEffect(() => {
    fetchFeaturedRooms();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      const res = await axiosClient.get("/rooms");
      const rooms = res.data?.data?.rooms || res.data?.rooms || [];
      setFeaturedRooms(rooms.slice(0, 3));
    } catch (error) {
      console.error("Room API error:", error);
    }
  };

  const getRoomImage = (image) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return imageBaseUrl + image;
  };

  const formatPrice = (price) => {
    const locale = language === "vi" ? "vi-VN" : "en-US";
    const formattedPrice = Number(price || 0).toLocaleString(locale);

    return language === "vi"
      ? `${formattedPrice}đ`
      : `${formattedPrice}${copy.priceSuffix}`;
  };

  const handleUsePromotion = (code) => {
    localStorage.setItem("selectedPromotionCode", code);
    navigate("/rooms");
  };

  const scrollPromos = (direction) => {
    const promoList = document.getElementById("promo-banner-list");

    if (!promoList) {
      return;
    }

    promoList.scrollBy({
      left: direction === "right" ? 420 : -420,
      behavior: "smooth",
    });
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <span className="hero-badge">{homeText.badge}</span>

          <h1>{isAdmin ? homeText.adminHeroTitle : homeText.heroTitle}</h1>

          <p>{isAdmin ? homeText.adminHeroDesc : homeText.heroDesc}</p>

          <div className="hero-actions">
            <Link to={mainActionPath} className="btn-primary">
              {isAdmin ? homeText.goAdmin : homeText.viewRooms}
            </Link>

            <a href="#featured-rooms" className="btn-secondary">
              {isAdmin ? copy.roomsOnSystem : homeText.exploreMore}
            </a>
          </div>

          <div className="search-panel">
            <div className="search-item">
              <span>{isAdmin ? homeText.role : homeText.destination}</span>
              <strong>{isAdmin ? homeText.adminRole : homeText.vietnam}</strong>
            </div>

            <div className="search-item">
              <span>{isAdmin ? homeText.management : homeText.checkIn}</span>
              <strong>
                {isAdmin
                  ? homeText.roomsAndBookings
                  : homeText.chooseWhenBooking}
              </strong>
            </div>

            <div className="search-item">
              <span>{isAdmin ? homeText.tracking : homeText.checkOut}</span>
              <strong>
                {isAdmin
                  ? homeText.invoicesAndPayments
                  : homeText.chooseWhenBooking}
              </strong>
            </div>

            <Link to={mainActionPath} className="search-btn">
              {isAdmin ? copy.goAdminShort : homeText.findRoom}
            </Link>
          </div>
        </div>
      </section>

      <main className="home-container">
        <section className="stats-section">
          <div className="stat-card">
            <h3>5+</h3>
            <p>{homeText.statsRooms}</p>
          </div>

          <div className="stat-card">
            <h3>24/7</h3>
            <p>{homeText.statsSupport}</p>
          </div>

          <div className="stat-card">
            <h3>100%</h3>
            <p>{homeText.statsAvailability}</p>
          </div>

          <div className="stat-card">
            <h3>2</h3>
            <p>{homeText.statsRoles}</p>
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <span>{homeText.destinationSection}</span>
            <h2>{homeText.destinationTitle}</h2>
          </div>

          <div className="destination-grid">
            {destinations.map((item) => (
              <button
                type="button"
                className="destination-card"
                key={item.id}
                onClick={() => setSelectedDestination(item)}
              >
                <img src={item.image} alt={item.name} />

                <div className="destination-info">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <span className="destination-more">{copy.seeHistory}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {!isAdmin && (
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <span>{homeText.promo}</span>
                <h2>{homeText.promoTitle}</h2>
              </div>

              <Link to="/rooms" className="view-all">
                {homeText.viewAll}
              </Link>
            </div>

            <div className="promo-banner-wrapper">
              <button
                type="button"
                className="promo-arrow promo-arrow-left"
                onClick={() => scrollPromos("left")}
              >
                ‹
              </button>

              <div className="promo-banner-list" id="promo-banner-list">
                {promoBanners.map((promo) => (
                  <div
                    className={`deal-card ${promo.className}`}
                    key={promo.title}
                  >
                    <div className="deal-icon">{promo.icon}</div>

                    <div className="deal-content">
                      <span>{promo.badge}</span>
                      <h3>{promo.title}</h3>
                      <p>{promo.desc}</p>

                      <div className="promo-code-box">
                        <span>{homeText.promoCode}</span>
                        <strong>{promo.code}</strong>
                      </div>

                      <div className="deal-bottom">
                        <small>{promo.note}</small>

                        <button
                          type="button"
                          className="deal-btn"
                          onClick={() => handleUsePromotion(promo.code)}
                        >
                          {homeText.useCode}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="promo-arrow promo-arrow-right"
                onClick={() => scrollPromos("right")}
              >
                ›
              </button>
            </div>
          </section>
        )}

        <section className="section" id="featured-rooms">
          <div className="section-header">
            <div className="section-title">
              <span>{homeText.featuredRooms}</span>

              <h2>
                {isAdmin
                  ? homeText.adminFeaturedRoomsTitle
                  : homeText.featuredRoomsTitle}
              </h2>
            </div>

            <Link to={roomActionPath} className="view-all">
              {isAdmin ? copy.manageRooms : homeText.viewAll}
            </Link>
          </div>

          <div className="room-grid">
            {featuredRooms.length > 0 ? (
              featuredRooms.map((room) => (
                <div className="room-card" key={room.id}>
                  <img
                    src={getRoomImage(room.image)}
                    alt={room.title || room.room_number}
                  />

                  <div className="room-content">
                    <div className="room-type">
                      {room.room_type || room.type_name || homeText.hotelRoom}
                    </div>

                    <h3>
                      {room.title ||
                        `${homeText.hotelRoom} ${room.room_number}`}
                    </h3>

                    <p>
                      {homeText.capacity}: {room.capacity || 2}{" "}
                      {homeText.guests} · {homeText.status}:{" "}
                      {room.status === "active"
                        ? homeText.active
                        : homeText.maintenance}
                    </p>

                    <div className="room-footer">
                      <strong>
                        {formatPrice(room.price)}
                        <span>/{homeText.perNight}</span>
                      </strong>

                      <Link to={roomActionPath} className="small-btn">
                        {isAdmin ? homeText.manage : homeText.bookRoom}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-room">{homeText.emptyRoom}</div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="promo-box">
            <div>
              <span>
                {isAdmin
                  ? homeText.adminPromoBoxLabel
                  : homeText.promoBoxLabel}
              </span>

              <h2>
                {isAdmin
                  ? homeText.adminPromoBoxTitle
                  : homeText.promoBoxTitle}
              </h2>

              <p>
                {isAdmin
                  ? homeText.adminPromoBoxDesc
                  : homeText.promoBoxDesc}
              </p>
            </div>

            <Link to={mainActionPath} className="promo-btn">
              {isAdmin ? homeText.manageSystem : homeText.bookNow}
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-title center">
            <span>{homeText.benefits}</span>
            <h2>{homeText.benefitsTitle}</h2>
          </div>

          <div className="benefit-grid">
            {benefits.map((item) => (
              <div className="benefit-card" key={item.title}>
                <div className="benefit-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title center">
            <span>{homeText.process}</span>

            <h2>
              {isAdmin ? homeText.adminProcessTitle : homeText.processTitle}
            </h2>
          </div>

          <div className="step-grid">
            {steps.map((item) => (
              <div className="step-card" key={item.number}>
                <div className="step-number">{item.number}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <h2>{isAdmin ? homeText.adminFinalTitle : homeText.finalTitle}</h2>

          <p>{isAdmin ? homeText.adminFinalDesc : homeText.finalDesc}</p>

          <Link to={mainActionPath} className="btn-primary">
            {isAdmin ? homeText.goAdmin : copy.discoverRooms}
          </Link>
        </section>
      </main>

      {selectedDestination && (
        <div className="destination-modal">
          <div
            className="destination-modal-overlay"
            onClick={() => setSelectedDestination(null)}
          ></div>

          <div className="destination-modal-content">
            <button
              type="button"
              className="destination-modal-close"
              onClick={() => setSelectedDestination(null)}
            >
              ×
            </button>

            <img
              src={selectedDestination.image}
              alt={selectedDestination.name}
              className="destination-modal-image"
            />

            <div className="destination-modal-body">
              <span className="modal-label">{copy.modalLabel}</span>

              <h2>{selectedDestination.name}</h2>

              <p>{selectedDestination.history}</p>

              <h3>{copy.placesTitle}</h3>

              <div className="place-tags">
                {selectedDestination.places.map((place) => (
                  <span key={place}>{place}</span>
                ))}
              </div>

              <div className="recommend-box">
                <strong>{copy.recommendLabel}:</strong>{" "}
                {selectedDestination.recommend}
              </div>

              <Link to={mainActionPath} className="modal-book-btn">
                {isAdmin ? homeText.goAdmin : copy.seeSuitableRooms}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;