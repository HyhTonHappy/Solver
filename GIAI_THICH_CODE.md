# Giải thích chi tiết các hàm trong `index.js`

Dưới đây là giải thích chi tiết về từng hàm và khối mã trong file `index.js` của dự án Solver Tối ưu hóa.

---

## 1. Hàm `solveAI(prompt)`

Hàm này chịu trách nhiệm giao tiếp với OpenAI API để giải bài toán tối ưu hóa.

- **Mục đích**: Gửi một `prompt` (câu lệnh) chứa toàn bộ bài toán đến API của OpenAI và nhận về kết quả giải.
- **Loại hàm**: `async function` (hàm bất đồng bộ) vì nó cần chờ phản hồi từ API mà không làm "đóng băng" giao diện người dùng.
- **Tham số**:
  - `prompt` (string): Một chuỗi văn bản đã được định dạng, mô tả chi tiết hàm mục tiêu và các ràng buộc của bài toán.
- **Luồng hoạt động**:
  1. **Khởi tạo**:
     - `apiKey`: Lưu trữ khóa API của OpenAI. **Lưu ý**: Đây là thông tin nhạy cảm và không nên để trực tiếp trong code ở môi trường production.
  2. **Gửi yêu cầu (fetch)**:
     - Sử dụng `fetch` để gửi một yêu cầu `POST` đến endpoint của OpenAI (`https://api.openai.com/v1/chat/completions`).
     - **Headers**: Bao gồm `Content-Type` là `application/json` và `Authorization` chứa `apiKey` để xác thực.
     - **Body**: Dữ liệu gửi đi được chuyển thành chuỗi JSON, bao gồm:
       - `model`: "gpt-4.5-preview" - Chỉ định mô hình AI sẽ sử dụng.
       - `messages`: Một mảng chứa đối tượng tin nhắn từ người dùng (`role: "user"`) với nội dung là `prompt`.
       - `max_tokens`: Giới hạn độ dài của câu trả lời (200 tokens).
       - `temperature`: Thiết lập là `0.2` để kết quả trả về có tính nhất quán cao, ít sáng tạo ngẫu nhiên.
  3. **Xử lý phản hồi**:
     - `await response.json()`: Chờ và chuyển đổi phản hồi từ API sang đối tượng JavaScript.
     - **Kiểm tra lỗi**: Nếu `data.choices` không tồn tại hoặc rỗng, hàm sẽ `throw new Error` để báo rằng AI không có phản hồi.
     - **Lấy kết quả**: Trích xuất nội dung câu trả lời từ `data.choices[0].message.content` và dùng `.trim()` để loại bỏ khoảng trắng thừa.
  4. **Trả về**:
     - Trả về chuỗi `answer` (kết quả từ AI) nếu thành công.
     - Nếu có bất kỳ lỗi nào trong khối `try` (ví dụ: lỗi mạng, API key sai), khối `catch` sẽ được thực thi, in lỗi ra console và trả về một chuỗi thông báo lỗi thân thiện.

---

## 2. Khối `document.addEventListener("DOMContentLoaded", function () { ... })`

Đây là khối mã chính của ứng dụng, nó sẽ chỉ chạy sau khi toàn bộ cây DOM (tức là toàn bộ file HTML) đã được tải và phân tích xong. Điều này đảm bảo rằng tất cả các phần tử HTML đều đã tồn tại trước khi JavaScript cố gắng tương tác với chúng.

### 2.1. Khởi tạo và Lấy các phần tử DOM

- **Mục đích**: Lấy và lưu trữ các tham chiếu đến các phần tử HTML quan trọng vào các biến để dễ dàng sử dụng sau này.
- **Các biến**:
  - `numVarsInput`: Input cho số lượng biến.
  - `variableInputsDiv`: `div` chứa các input cho hệ số của biến.
  - `resultFormulaInput`: Input chỉ đọc để hiển thị hàm mục tiêu.
  - `btnAdd`, `btnDelete`, `btnClear`, `btnSolve`: Các nút bấm chức năng.
  - `constraintsContainer`: `div` chứa các hàng ràng buộc.
  - `resultArea`: `div` để hiển thị kết quả cuối cùng.

### 2.2. Khởi tạo giao diện mặc định

- **Mục đích**: Thiết lập giao diện ban đầu khi người dùng mới tải trang.
- **Hành động**:
  - `generateVariableInputs()`: Gọi hàm để tạo ra số lượng input biến mặc định (là 2).
  - `addConstraintRow()`: Gọi hàm 2 lần để tạo ra 2 hàng ràng buộc trống.

---

## 3. Hàm `generateVariableInputs()`

- **Mục đích**: Tự động tạo ra các ô nhập liệu cho hệ số của các biến (A, B, C,...) dựa trên số lượng người dùng chọn.
- **Luồng hoạt động**:
  1. Lấy giá trị từ `numVarsInput` (số lượng biến).
  2. Xóa sạch nội dung cũ trong `variableInputsDiv`.
  3. Tạo một mảng `varNames` chứa các chữ cái từ 'A' đến 'Z'.
  4. Dùng vòng lặp `for` để tạo các phần tử HTML cho mỗi biến:
     - Một `div` với class `variable-input` để bao bọc.
     - Một `label` (ví dụ: "A:", "B:").
     - Một `input` `type="number"` để người dùng nhập hệ số, có giá trị mặc định là `1`.
     - Gán một `event listener` ("input") cho mỗi ô `input` này, để mỗi khi người dùng thay đổi giá trị, hàm `updateFormula()` sẽ được gọi ngay lập tức.
  5. `updateFormula()`: Gọi hàm này sau khi tạo xong các input để cập nhật hiển thị hàm mục tiêu lần đầu.

---

## 4. Hàm `updateFormula()`

- **Mục đích**: Cập nhật chuỗi công thức của hàm mục tiêu và hiển thị nó trong ô `resultFormulaInput`.
- **Luồng hoạt động**:
  1. Lấy số lượng biến và tạo mảng tên biến tương tự như hàm trên.
  2. Khởi tạo một chuỗi `formula` rỗng.
  3. Lặp qua từng biến, lấy giá trị hệ số từ ô `input` tương ứng.
  4. **Xây dựng chuỗi**:
     - Kiểm tra xem hệ số có phải là một số hợp lệ không.
     - Thêm dấu `+` vào trước hệ số nếu nó không phải là biến đầu tiên và có giá trị dương.
     - Nối hệ số và tên biến vào chuỗi `formula` (ví dụ: `1A`, `+ 2B`).
  5. Gán chuỗi `formula` đã hoàn chỉnh vào `resultFormulaInput.value`.

---

## 5. Hàm `addConstraintRow()`

- **Mục đích**: Tạo và thêm một hàng ràng buộc mới vào giao diện.
- **Luồng hoạt động**:
  1. Tạo một `div` chính với class `constraint-row`.
  2. Tạo 3 phần tử con:
     - `leftInput`: Ô `input` `type="text"` cho vế trái của ràng buộc.
     - `operatorSelect`: Một `select` (dropdown) chứa các toán tử (≥, ≤, =, >, <).
     - `rightInput`: Ô `input` `type="text"` cho vế phải của ràng buộc.
  3. Thêm 3 phần tử con này vào `div` chính.
  4. Thêm `div` chính vào `constraintsContainer`.

---

## 6. Các Event Listeners cho các nút

### `numVarsInput.addEventListener("change", ...)`
- **Sự kiện**: `change` - Kích hoạt khi người dùng thay đổi giá trị của ô số lượng biến và sau đó click ra ngoài.
- **Hành động**: Gọi `generateVariableInputs()` để vẽ lại các ô nhập hệ số.

### `btnAdd.addEventListener("click", ...)`
- **Sự kiện**: `click` - Kích hoạt khi nhấn nút "Thêm ràng buộc".
- **Hành động**: Gọi `addConstraintRow()` để thêm một hàng ràng buộc mới.

### `btnDelete.addEventListener("click", ...)`
- **Sự kiện**: `click` - Kích hoạt khi nhấn nút "Xóa ràng buộc".
- **Hành động**:
  - Nếu có nhiều hơn một hàng ràng buộc, nó sẽ xóa hàng cuối cùng.
  - Nếu chỉ còn một hàng, nó sẽ xóa nội dung trong các ô input của hàng đó thay vì xóa cả hàng.

### `btnClear.addEventListener("click", ...)`
- **Sự kiện**: `click` - Kích hoạt khi nhấn nút "Xóa tất cả".
- **Hành động**:
  - Xóa tất cả các hàng ràng buộc trừ hàng đầu tiên.
  - Xóa sạch nội dung của hàng ràng buộc đầu tiên còn lại.

### `btnSolve.addEventListener("click", async function () { ... })`
Đây là hàm xử lý chính khi người dùng muốn giải bài toán.

- **Loại hàm**: `async function` vì nó cần gọi hàm `solveAI` bất đồng bộ.
- **Luồng hoạt động**:
  1. **Hiển thị trạng thái**: Cập nhật `resultArea` với thông báo "Đang xử lý...".
  2. **Thu thập dữ liệu**:
     - Lấy chuỗi hàm mục tiêu từ `resultFormulaInput`.
     - Lấy loại bài toán (`max` hoặc `min`) từ radio button đang được chọn.
     - Lặp qua tất cả các hàng ràng buộc (`.constraint-row`), lấy giá trị từ các ô input và select để tạo một mảng `constraints`. Mỗi phần tử trong mảng là một object `{ left, operator, right }`.
  3. **Validation**: Kiểm tra nếu không có hàm mục tiêu hoặc không có ràng buộc nào được nhập, thì hiển thị thông báo lỗi và dừng lại.
  4. **Tạo Prompt cho AI (`promptAI`)**:
     - Xây dựng một chuỗi `prompt` chi tiết và có cấu trúc.
     - Bắt đầu bằng yêu cầu chung về phương pháp giải.
     - Thêm dòng "Hàm mục tiêu: Tối đa hóa/Tối thiểu hóa ...".
     - Thêm từng ràng buộc đã thu thập được.
     - Đưa ra yêu cầu cụ thể về định dạng của kết quả trả về.
  5. **Tạo chuỗi hiển thị cho giao diện (`promtInterface`)**:
     - Tạo một chuỗi tóm tắt lại bài toán để hiển thị cho người dùng cùng với kết quả.
  6. **Gọi AI và Hiển thị kết quả**:
     - `const solution = await solveAI(promptAI)`: Gọi hàm `solveAI` với `prompt` đã tạo và chờ kết quả.
     - Nối chuỗi tóm tắt bài toán và kết quả từ `solution` rồi hiển thị tất cả trong `resultArea`.
