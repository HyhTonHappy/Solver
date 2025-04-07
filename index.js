// Gọi API ChatGPT để giải bài toán tối ưu hóa
async function solveAI(prompt) {
    // Khóa API từ OpenAI
    const apiKey = ""; // Thay thế bằng key API của bạn
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4.5-preview",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200,
                temperature: 0.2,
            })
        });

        const data = await response.json();
        if(!data.choices || data.choices.length === 0) {
            throw new Error("Không có phản hồi từ AI.");
        }
        var answer = data.choices[0].message.content.trim();
        return answer;
    } catch (error) {
        console.error("Lỗi:", error);
        return "Đã xảy ra lỗi khi giải bài toán";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử DOM
    const numVarsInput = document.getElementById("numVars");
    const variableInputsDiv = document.getElementById("variableInputs");
    const resultFormulaInput = document.getElementById("resultFormula");
    const btnAdd = document.getElementById("btnAdd");
    const btnDelete = document.getElementById("btnDelete");
    const btnClear = document.getElementById("btnClear");
    const btnSolve = document.getElementById("btnSolve");
    const constraintsContainer = document.getElementById("constraintsContainer");
    const resultArea = document.getElementById("resultArea");

    // Khởi tạo ra số lượng biến mặc định và ràng buộc
    generateVariableInputs();
    addConstraintRow();
    addConstraintRow();

    // Tạo các input cho hệ số của các biến A, B,...
    function generateVariableInputs() {
        const numVars = parseInt(numVarsInput.value);
        variableInputsDiv.innerHTML = "";
        
        // Mảng chứa tên biến từ A đến Z
        const varNames = Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(65 + i)
        ); 
        
        // Tạo các input cho từng biến
        for (let i = 0; i < numVars && i < varNames.length; i++) {
            const varInput = document.createElement("div");
            varInput.className = "variable-input";

            const varLabel = document.createElement("label");
            varLabel.className = "variable-label";
            varLabel.textContent = varNames[i] + ":"; // Hiển thị A, B, C...

            const input = document.createElement("input");
            input.type = "number";
            input.className = "input-field";
            input.id = "var" + varNames[i];
            input.value = 1;
            input.addEventListener("input", updateFormula);

            varInput.appendChild(varLabel);
            varInput.appendChild(input);
            variableInputsDiv.appendChild(varInput);
        }

        // Cập nhật lại giao diện
        updateFormula();
    }

    // Cập nhật hàm mục tiêu theo hệ số biến
    function updateFormula() {
        const numVars = parseInt(numVarsInput.value);
        const varNames = Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(65 + i)
        ); // A, B, C...
        let formula = "";

        for (let i = 0; i < numVars && i < varNames.length; i++) {
            const varInput = document.getElementById("var" + varNames[i]);
            if (varInput) {
                const coef = varInput.value.trim();
                if (coef !== "") {
                    const numCoef = parseFloat(coef);
                    if (!isNaN(numCoef)) {
                        const sign = numCoef >= 0 && i > 0 ? " + " : "";
                        formula += `${sign}${numCoef}${varNames[i]}`; // 1A, 2B, 3C...
                    }
                }
            }
        }

        resultFormulaInput.value = formula.trim();
    }

    // Thêm sự kiện lắng nghe cho input số lượng biến
    numVarsInput.addEventListener("change", function () {
        generateVariableInputs();
    });

    // Sự kiện lắng nghe cho nút thêm ràng buộc
    btnAdd.addEventListener("click", function () {
        addConstraintRow();
    });

    // Handle thêm ràng buộc
    function addConstraintRow() {
        const constraintRow = document.createElement("div");
        constraintRow.className = "constraint-row";

        const leftInput = document.createElement("input");
        leftInput.type = "text";
        leftInput.className = "constraint-input";
        leftInput.placeholder = "Ví dụ: 1A + 2B hoặc A, B";

        const operatorSelect = document.createElement("select");
        operatorSelect.className = "constraint-operator";

        const operators = [
            { value: ">=", text: "≥" },
            { value: "<=", text: "≤" },
            { value: "=", text: "=" },
            { value: ">", text: ">" },
            { value: "<", text: "<" },
        ];

        operators.forEach((op) => {
            const option = document.createElement("option");
            option.value = op.value;
            option.textContent = op.text;
            operatorSelect.appendChild(option);
        });

        const rightInput = document.createElement("input");
        rightInput.type = "text";
        rightInput.className = "constraint-input";
        rightInput.placeholder = "Ví dụ: 10";

        constraintRow.appendChild(leftInput);
        constraintRow.appendChild(operatorSelect);
        constraintRow.appendChild(rightInput);

        constraintsContainer.appendChild(constraintRow);
    }

    // Sự kiện lắng nghe cho nút xóa
    btnDelete.addEventListener("click", function () {
        const constraintRows =
            constraintsContainer.querySelectorAll(".constraint-row");
        if (constraintRows.length > 1) {
            constraintsContainer.removeChild(
                constraintRows[constraintRows.length - 1]
            );
        } else {
            const inputs = constraintRows[0].querySelectorAll("input");
            inputs.forEach((input) => (input.value = ""));
        }
    });

    // Sự kiện lắng nghe cho nút xóa tất cả
    btnClear.addEventListener("click", function () {
        const constraintRows =
            constraintsContainer.querySelectorAll(".constraint-row");
        for (let i = constraintRows.length - 1; i > 0; i--) {
            constraintsContainer.removeChild(constraintRows[i]);
        }

        if (constraintRows.length > 0) {
            const firstRowInputs = constraintRows[0].querySelectorAll("input");
            firstRowInputs.forEach((input) => (input.value = ""));
        }
    });

    // Sự kiện lắng nghe cho nút giải bài toán
    btnSolve.addEventListener("click", async function () {
        // Hiện ra thông báo đang xử lý
        resultArea.textContent = "Đang xử lý phương án tối ưu...";

        // Lấy giá trị hàm mục tiêu và các ràng buộc
        const objectiveFunction = resultFormulaInput.value;
        const optimType = document.querySelector(
            'input[name="optType"]:checked'
        ).value;
        const constraints = [];
        const constraintRows =
            constraintsContainer.querySelectorAll(".constraint-row");
        
        // Lặp qua từng hàng ràng buộc và lấy giá trị
        constraintRows.forEach((row) => {
            const inputs = row.querySelectorAll("input");
            const operator = row.querySelector("select").value;
            if (inputs[0].value.trim() && inputs[1].value.trim()) {
                constraints.push({
                    left: inputs[0].value.trim(),
                    operator: operator,
                    right: inputs[1].value.trim(),
                });
            }
        });

        // Kiểm tra xem phải có ít nhất một ràng buộc và hàm mục tiêu không
        if (constraints.length === 0 || objectiveFunction.trim() === "") {
            resultArea.textContent = "Vui lòng nhập hàm mục tiêu và ít nhất một ràng buộc.";
            return;
        }

        // Tạo chuỗi prompt để gửi lên AI
        let promptAI = `Giải bài toán tối ưu hóa sau đây bằng phương pháp **GRG (Generalized Reduced Gradient)** Simplex hoặc các phương pháp tương tự. Giải gần đúng bằng Excel Solver hoặc lập trình.
**Hàm mục tiêu**:
${optimType === "max" ? "Tối đa hóa" : "Tối thiểu hóa"} ${objectiveFunction}\n`;
    promptAI += "**Các ràng buộc**:\n";
    constraints.forEach((constraint, index) => {
        promptAI += `${index + 1}. ${constraint.left} ${constraint.operator} ${constraint.right};\n`;
    });
    promptAI += `Chỉ trả về kết quả như sau:
Kết quả:
- A = giá trị A
- B = giá trị B
- ...(nếu có nhiều biến)
- Giá trị hàm mục tiêu = giá trị hàm mục tiêu
Không cần giải thích cách làm. Nếu bài toán không có nghiệm, hãy trả lời: "Bài toán không có nghiệm".
Sau đó đánh giá ẩn nào tối ưu nhất và giải thích tại sao?
**Lưu ý**: Giải bài toán này có thể cần sử dụng Excel Solver, Python (scipy.optimize, PuLP) hoặc phần mềm tối ưu hóa tương tự.`;

        // Tạo chuỗi giao diện để hiển thị cho người dùng
        let promtInterface = `Hàm mục tiêu:
${optimType === "max" ? "Tối đa hóa" : "Tối thiểu hóa"} ${objectiveFunction}\n`;
        promtInterface += "Các ràng buộc:\n";
        constraints.forEach((constraint, index) => {
            promtInterface += `${index + 1}. ${constraint.left} ${constraint.operator} ${constraint.right};\n`;
        });
        promtInterface += `Kết quả:`;

        // Gọi AI để giải bài toán
        const solution = await solveAI(promptAI);
        resultArea.textContent = promtInterface + "\n\n" + solution;
    });
});
