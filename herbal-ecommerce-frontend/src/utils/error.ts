import axios from "axios";

// Đổi tên thành ServerResponseError để phân biệt rõ đây là dữ liệu nhận từ Server
interface ServerResponseError {
  message?: string;
  success?: boolean;
  [key: string]: unknown; // Giữ quy tắc strict, không dùng any
}

export const getErrorMessage = (err: unknown): string => {
  // 1. Kiểm tra nếu lỗi sinh ra do việc gọi API bằng Axios
  if (axios.isAxiosError(err)) {
    // Ép kiểu an toàn dữ liệu trả về từ server sang Interface đã định nghĩa ở trên
    const serverError = err.response?.data as ServerResponseError | undefined;

    if (serverError?.message) {
      return serverError.message; // Trả về câu thông báo lỗi chi tiết từ backend (VD: "Email đã tồn tại")
    }

    return err.message; // Nếu server không trả về message, dùng message mặc định của Axios
  }

  // 2. Nếu là lỗi Error hệ thống cục bộ tại Frontend
  if (err instanceof Error) {
    return err.message;
  }

  // 3. Nếu lỗi là chuỗi chữ thuần
  if (typeof err === "string") {
    return err;
  }

  return "Đã xảy ra lỗi không xác định. Vui lòng thử lại!";
};
