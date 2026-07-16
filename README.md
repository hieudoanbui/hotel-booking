# Hotel Booking System

## 1. Giới thiệu dự án

Hotel Booking System là website đặt phòng khách sạn trực tuyến, được xây dựng phục vụ bài tập lớn môn Thiết kế Web Nâng cao.

Hệ thống hỗ trợ khách hàng xem danh sách phòng, tìm phòng trống, đặt phòng, theo dõi lịch sử đặt phòng, xác nhận thanh toán, cập nhật hồ sơ cá nhân và gửi yêu cầu hỗ trợ. Ngoài ra, hệ thống có trang quản trị giúp admin quản lý phòng, loại phòng, dịch vụ, tiện nghi, đơn đặt phòng, hóa đơn, thanh toán, đánh giá và yêu cầu hỗ trợ.

Dự án cũng hỗ trợ giao diện song ngữ:

- Tiếng Việt
- English / International

## 2. Công nghệ sử dụng

### Frontend

- ReactJS
- Vite
- React Router DOM
- Axios
- CSS

### Backend

- PHP 8
- PDO
- MySQL
- RESTful API

### Database

- MySQL
- phpMyAdmin

### Hosting

- InfinityFree

## 3. Chức năng chính

### Khách hàng

- Đăng ký tài khoản
- Đăng nhập / đăng xuất
- Quên mật khẩu
- Xem danh sách phòng
- Tìm phòng trống theo ngày nhận phòng, ngày trả phòng và số người
- Lọc phòng theo tên, loại phòng, sức chứa và khoảng giá
- Xem chi tiết phòng
- Xem tiện nghi phòng
- Xem và gửi đánh giá phòng
- Đặt phòng trực tuyến
- Chọn dịch vụ đi kèm
- Nhập mã giảm giá
- Xem lịch sử đặt phòng
- Hủy đơn đặt phòng khi đơn đang chờ xác nhận
- Xác nhận đã thanh toán
- Cập nhật hồ sơ cá nhân
- Upload ảnh đại diện
- Đổi mật khẩu
- Gửi câu hỏi hỗ trợ
- Xem phản hồi từ admin
- Xem các trang thông tin: FAQ, chính sách thanh toán, chính sách hủy phòng, chính sách bảo mật, điều khoản sử dụng
- Chuyển đổi ngôn ngữ Việt / Anh

### Admin

- Xem dashboard thống kê
- Quản lý phòng
- Quản lý loại phòng
- Quản lý hình ảnh phòng
- Quản lý tiện nghi
- Quản lý dịch vụ
- Quản lý mã khuyến mãi
- Quản lý đơn đặt phòng
- Xác nhận / hủy đơn đặt phòng
- Quản lý hóa đơn
- Quản lý thanh toán
- Quản lý khách hàng
- Quản lý đánh giá
- Phản hồi yêu cầu hỗ trợ của khách hàng

## 4. Cấu trúc thư mục

```text
hotel-booking/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   ├── config/
│   ├── public/
│   │   ├── index.php
│   │   └── images/
│   └── routes/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── i18n/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
