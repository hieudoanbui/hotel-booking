<?php

use App\Controllers\PasswordController;
use App\Controllers\AuthController;
use App\Controllers\RoomController;
use App\Controllers\BookingController;
use App\Controllers\AdminBookingController;
use App\Controllers\InvoiceController;
use App\Controllers\DashboardController;
use App\Controllers\AmenityController;
use App\Controllers\ServiceController;
use App\Controllers\BookingServiceController;
use App\Controllers\PaymentController;
use App\Controllers\ReviewController;
use App\Controllers\CustomerController;
use App\Controllers\ProfileController;
use App\Controllers\PromotionController;
use App\Controllers\RoomTypeController;
use App\Controllers\RoomImageController;
use App\Controllers\AvatarController;

return [
    // =========================
    // AUTH
    // =========================
    ["POST", "/api/forgot-password", [PasswordController::class, "forgotPassword"]],
    ["POST", "/api/register", [AuthController::class, "register"]],
    ["POST", "/api/login", [AuthController::class, "login"]],
    ["GET", "/api/me", [AuthController::class, "me"]],
    ["POST", "/api/logout", [AuthController::class, "logout"]],

    // =========================
    // PROFILE
    // =========================
    ["GET", "/api/profile", [ProfileController::class, "show"]],
    ["PUT", "/api/profile", [ProfileController::class, "update"]],
    ["PUT", "/api/change-password", [ProfileController::class, "changePassword"]],
    ["POST", "/api/profile/avatar", [AvatarController::class, "upload"]],

    // =========================
    // ROOMS - CUSTOMER
    // =========================
    ["GET", "/api/rooms", [RoomController::class, "index"]],
    ["GET", "/api/available-rooms", [RoomController::class, "availableRooms"]],
    ["GET", "/api/rooms/{id}/images", [RoomImageController::class, "getByRoom"]],
    ["GET", "/api/rooms/{id}/amenities", [AmenityController::class, "roomAmenities"]],
    ["GET", "/api/rooms/{id}/reviews", [ReviewController::class, "getByRoom"]],
    ["GET", "/api/rooms/{id}", [RoomController::class, "show"]],

    // =========================
    // ROOM TYPES
    // =========================
    ["GET", "/api/room-types", [RoomTypeController::class, "index"]],

    // =========================
    // SERVICES - CUSTOMER
    // =========================
    ["GET", "/api/services", [ServiceController::class, "index"]],
    ["GET", "/api/bookings/{id}/services", [BookingServiceController::class, "getByBooking"]],
    // =========================
    // SERVICES - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/services", [ServiceController::class, "index"]],
    ["POST", "/api/admin/services", [ServiceController::class, "store"]],
    ["PUT", "/api/admin/services/{id}", [ServiceController::class, "update"]],
    ["DELETE", "/api/admin/services/{id}", [ServiceController::class, "destroy"]],

    // =========================
    // REVIEWS - CUSTOMER
    // =========================
    ["POST", "/api/reviews", [ReviewController::class, "store"]],

    // =========================
    // BOOKINGS - CUSTOMER
    // =========================
    ["POST", "/api/bookings/check-availability", [BookingController::class, "checkAvailability"]],
    ["POST", "/api/bookings", [BookingController::class, "store"]],
    ["GET", "/api/my-bookings", [BookingController::class, "myBookings"]],
    ["PUT", "/api/my-bookings/{id}/cancel", [BookingController::class, "cancel"]],
    ["PUT", "/api/my-bookings/{id}/paid", [BookingController::class, "confirmPayment"]],
    ["GET", "/api/my-bookings/{id}", [BookingController::class, "showMyBooking"]],

    // =========================
    // CUSTOMERS - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/customers", [CustomerController::class, "index"]],
    ["POST", "/api/admin/customers", [CustomerController::class, "store"]],
    ["PUT", "/api/admin/customers/{id}", [CustomerController::class, "update"]],
    ["DELETE", "/api/admin/customers/{id}", [CustomerController::class, "destroy"]],

    // =========================
    // ROOMS - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/rooms", [RoomController::class, "index"]],
    ["POST", "/api/admin/rooms", [RoomController::class, "store"]],
    ["PUT", "/api/admin/rooms/{id}", [RoomController::class, "update"]],
    ["DELETE", "/api/admin/rooms/{id}", [RoomController::class, "destroy"]],

    // =========================
    // BOOKINGS - ADMIN
    // =========================
    ["GET", "/api/admin/bookings", [AdminBookingController::class, "index"]],
    ["PUT", "/api/admin/bookings/{id}/confirm", [AdminBookingController::class, "confirm"]],
    ["PUT", "/api/admin/bookings/{id}/cancel", [AdminBookingController::class, "cancel"]],
    ["PUT", "/api/admin/bookings/{id}/paid", [AdminBookingController::class, "markPaid"]],
    ["GET", "/api/admin/bookings/{id}", [AdminBookingController::class, "show"]],

    // =========================
    // PAYMENTS - ADMIN
    // =========================
    ["GET", "/api/admin/payments", [PaymentController::class, "index"]],
    ["PUT", "/api/admin/payments/{id}/paid", [PaymentController::class, "markAsPaid"]],

    // =========================
    // INVOICES - ADMIN
    // =========================
    ["GET", "/api/admin/invoices", [InvoiceController::class, "index"]],
    ["PUT", "/api/admin/invoices/{id}/paid", [InvoiceController::class, "markAsPaid"]],

    // =========================
    // DASHBOARD - ADMIN
    // =========================
    ["GET", "/api/admin/dashboard", [DashboardController::class, "index"]],

    // =========================
    // PROMOTIONS - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/promotions", [PromotionController::class, "index"]],
    ["POST", "/api/admin/promotions", [PromotionController::class, "store"]],
    ["PUT", "/api/admin/promotions/{id}", [PromotionController::class, "update"]],
    ["DELETE", "/api/admin/promotions/{id}", [PromotionController::class, "destroy"]],

    // =========================
    // AMENITIES - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/amenities", [AmenityController::class, "index"]],
    ["POST", "/api/admin/amenities", [AmenityController::class, "store"]],
    ["PUT", "/api/admin/amenities/{id}", [AmenityController::class, "update"]],
    ["DELETE", "/api/admin/amenities/{id}", [AmenityController::class, "destroy"]],
    ["GET", "/api/admin/rooms/{id}/amenities", [AmenityController::class, "getRoomAmenityIds"]],
    ["PUT", "/api/admin/rooms/{id}/amenities", [AmenityController::class, "updateRoomAmenities"]],

    // =========================
    // REVIEWS - ADMIN
    // =========================
    ["GET", "/api/admin/reviews", [ReviewController::class, "adminIndex"]],
    ["DELETE", "/api/admin/reviews/{id}", [ReviewController::class, "destroy"]],

    // =========================
    // ROOM TYPES - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/room-types", [RoomTypeController::class, "adminIndex"]],
    ["POST", "/api/admin/room-types", [RoomTypeController::class, "store"]],
    ["PUT", "/api/admin/room-types/{id}", [RoomTypeController::class, "update"]],
    ["DELETE", "/api/admin/room-types/{id}", [RoomTypeController::class, "destroy"]],

    // =========================
    // ROOM IMAGES - ADMIN CRUD
    // =========================
    ["GET", "/api/admin/room-images", [RoomImageController::class, "adminIndex"]],
    ["POST", "/api/admin/room-images", [RoomImageController::class, "store"]],
    ["PUT", "/api/admin/room-images/{id}", [RoomImageController::class, "update"]],
    ["DELETE", "/api/admin/room-images/{id}", [RoomImageController::class, "destroy"]],
];