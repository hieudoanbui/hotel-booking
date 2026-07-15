import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import "./Footer.css";

function Footer() {
  const location = useLocation();
  const { t, language } = useLanguage();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const footerText = t.footer;

  const contactText = {
    email: "Email: support@hotelbooking.vn",
    hotline:
      language === "en" ? "Hotline: 1900 8888" : "Hotline: 1900 8888",
    address:
      language === "en"
        ? "Address: Phenikaa University, Hanoi"
        : "Địa chỉ: Đại học Phenikaa, Hà Nội",
    copyright: "© 2026 Hotel Booking System. All rights reserved.",
  };

  const destinations = {
    danang: language === "en" ? "Da Nang" : "Đà Nẵng",
    nhatrang: language === "en" ? "Nha Trang" : "Nha Trang",
    hanoi: language === "en" ? "Ha Noi" : "Hà Nội",
    hochiminh: language === "en" ? "Ho Chi Minh City" : "Hồ Chí Minh",
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Hotel Booking</h2>

          <p>{footerText.desc}</p>

          <div className="footer-contact">
            <p>{contactText.email}</p>
            <p>{contactText.hotline}</p>
            <p>{contactText.address}</p>
          </div>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>{footerText.support}</h3>

            <Link to="/help">{footerText.helpCenter}</Link>
            <Link to="/info/faq">{footerText.faq}</Link>
            <Link to="/info/cancellation-policy">
              {footerText.cancellationPolicy}
            </Link>
            <Link to="/info/payment-policy">{footerText.paymentPolicy}</Link>
          </div>

          <div className="footer-column">
            <h3>{footerText.policy}</h3>

            <Link to="/info/privacy-policy">{footerText.privacyPolicy}</Link>
            <Link to="/info/cookie-policy">{footerText.cookiePolicy}</Link>
            <Link to="/info/terms">{footerText.terms}</Link>
            <Link to="/info/payment-policy">{footerText.paymentRules}</Link>
          </div>

          <div className="footer-column">
            <h3>{footerText.about}</h3>

            <Link to="/info/about">{footerText.aboutSystem}</Link>
            <Link to="/info/contact">{footerText.contact}</Link>
            <Link to="/help">{footerText.sendSupport}</Link>
            <Link to="/info/faq">{footerText.guide}</Link>
          </div>

          <div className="footer-column">
            <h3>{footerText.explore}</h3>

            <Link to="/rooms">{destinations.danang}</Link>
            <Link to="/rooms">{destinations.nhatrang}</Link>
            <Link to="/rooms">{destinations.hanoi}</Link>
            <Link to="/rooms">{destinations.hochiminh}</Link>
            <Link to="/rooms">{footerText.destinationHighlight}</Link>
          </div>

          <div className="footer-column">
            <h3>{footerText.service}</h3>

            <Link to="/rooms">{footerText.hotelBooking}</Link>
            <Link to="/rooms">{footerText.featuredRooms}</Link>
            <Link to="/rooms">{footerText.promotion}</Link>
            <Link to="/help">{footerText.customerSupport}</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{contactText.copyright}</p>
        <p>{footerText.subject}</p>
      </div>
    </footer>
  );
}

export default Footer;