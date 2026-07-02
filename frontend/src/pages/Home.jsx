import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero-section d-flex align-items-center">
        <div className="container text-white">
          <div className="row">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bold">
                Đặt phòng khách sạn trực tuyến nhanh chóng
              </h1>

              <p className="lead mt-3">
                Hệ thống hỗ trợ khách hàng xem phòng, kiểm tra phòng trống,
                đặt phòng và theo dõi lịch sử đặt phòng một cách tiện lợi.
              </p>

              <Link to="/rooms" className="btn btn-warning btn-lg mt-3">
                Xem phòng ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Chức năng nổi bật</h2>
          <p className="text-muted">
            Website sử dụng React, PHP 8 API, MySQL và cơ chế phân quyền.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm text-center p-4">
              <div className="feature-icon">🏨</div>
              <h5 className="fw-bold mt-3">Quản lý phòng</h5>
              <p className="text-muted">
                Admin có thể thêm, sửa, xóa và quản lý thông tin phòng khách sạn.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm text-center p-4">
              <div className="feature-icon">📅</div>
              <h5 className="fw-bold mt-3">Đặt phòng trực tuyến</h5>
              <p className="text-muted">
                Khách hàng chọn ngày nhận phòng, ngày trả phòng và gửi yêu cầu đặt phòng.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm text-center p-4">
              <div className="feature-icon">🔐</div>
              <h5 className="fw-bold mt-3">Bảo mật phân quyền</h5>
              <p className="text-muted">
                Hệ thống có đăng nhập, session, mã hóa mật khẩu và phân quyền người dùng.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;