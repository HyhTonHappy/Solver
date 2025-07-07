# Solver

Giải bài toán tối ưu hóa sau đây bằng phương pháp **GRG (Generalized Reduced Gradient)** Simplex hoặc các phương pháp tương tự. Giải gần đúng bằng Excel Solver hoặc lập trình.

**Hàm mục tiêu**:

Tối đa hóa: 1A + 1B + 1C + 1D + 1E

**Các ràng buộc**:

1. 288952A + 264757B + 9482C + 216888D + 199363E <= 185031596467;
2. 362296A + 290211B + 332490C + 295140D + 265298E <= 247054381662;
3. 166969A + 268147B + 193514C + 189349D + 102352E <= 154929879600;
4. 1A <= 200000;
5. 1B <= 100000;
6. 1C <= 50000;
7. 1D <= 700000;
8. 1E <= 100000;
9. 1A >= 0;
10. 1B >= 0;
11. 1C >= 0;
12. 1D >= 0;
13. 1E >= 0;

Chỉ trả về kết quả A, B, C, D, E,... và giá trị hàm mục tiêu. Không cần giải thích cách làm. Nếu bài toán không có nghiệm, hãy trả lời: "Bài toán không có nghiệm". Sau đó đánh giá ẩn nào tối ưu nhất và giải thích tại sao. **Lưu ý**: Giải bài toán này có thể cần sử dụng Excel Solver, Python (scipy.optimize, PuLP) hoặc phần mềm tối ưu hóa tương tự.