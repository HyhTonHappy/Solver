async function solveAI(prompt) {
    const apikey = "AIzaSyBXy0pn6R_jgGwQL2HO3Wjg-NwzjWG1x64";
    if (!prompt) return "Vui lòng nhập bài toán cần giải";
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }]
                }),
            }
        );
        const data = await response.json();

        // Kiểm tra xem API có trả về kết quả hợp lệ không
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content)
            return "AI không trả về kết quả hợp lệ.";

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Lỗi:", error);
        return "Đã xảy ra lỗi khi giải bài toán";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const numVarsInput = document.getElementById("numVars");
    const variableInputsDiv = document.getElementById("variableInputs");
    const resultFormulaInput = document.getElementById("resultFormula");
    const btnAdd = document.getElementById("btnAdd");
    const btnDelete = document.getElementById("btnDelete");
    const btnClear = document.getElementById("btnClear");
    const btnSolve = document.getElementById("btnSolve");
    const constraintsContainer = document.getElementById(
        "constraintsContainer"
    );
    const resultArea = document.getElementById("resultArea");
    const chatButton = document.getElementById("chatButton");
    const chatContainer = document.getElementById("chatContainer");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");
    const chatMessages = document.getElementById("chatMessages");
    const defaultValues = Array.from({ length: 26 }, (_, i) => i + 1); // 1 - 26

    generateVariableInputs();
    addConstraintRow();

    function generateVariableInputs() {
        const numVars = parseInt(numVarsInput.value);
        variableInputsDiv.innerHTML = "";

        const varNames = Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(65 + i)
        ); // A, B, C, ..., Z

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
            input.value = i + 1;
            input.addEventListener("input", updateFormula);

            varInput.appendChild(varLabel);
            varInput.appendChild(input);
            variableInputsDiv.appendChild(varInput);
        }

        updateFormula();
    }

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

    numVarsInput.addEventListener("change", function () {
        generateVariableInputs();
    });

    btnAdd.addEventListener("click", function () {
        addConstraintRow();
    });

    function addConstraintRow() {
        const constraintRow = document.createElement("div");
        constraintRow.className = "constraint-row";

        const leftInput = document.createElement("input");
        leftInput.type = "text";
        leftInput.className = "constraint-input";
        leftInput.placeholder = "Ví dụ: 1A+2B+3C";

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

    // Từ cái này chỉnh lại phần chat (Phần này tới cuối)
    /* btnSolve.addEventListener("click", function () {
        resultArea.textContent = "Đang xử lý phương án tối ưu...";

        const objectiveFunction = resultFormulaInput.value;
        const optimType = document.querySelector('input[name="optType"]:checked').value;
        const constraints = [];
        const constraintRows = constraintsContainer.querySelectorAll(".constraint-row");

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

        let problemSummary = `${
            optimType === "max" ? "Tối đa hóa" : "Tối thiểu hóa"
        } hàm mục tiêu: ${objectiveFunction}\n\n`;
        problemSummary += "Với các ràng buộc:\n";

        constraints.forEach((constraint, index) => {
            problemSummary += `${index + 1}. ${constraint.left} ${
                constraint.operator
            } ${constraint.right}\n`;
        });

        if (constraints.length === 0 || objectiveFunction.trim() === "") {
            resultArea.textContent =
                "Vui lòng nhập hàm mục tiêu và ít nhất một ràng buộc.";
            return;
        }

        resultArea.textContent = problemSummary;

        addBotMessage(
            `Tôi đang giải bài toán tối ưu:\n${problemSummary}\nVui lòng đợi một chút...`
        );

        setTimeout(() => {
            const solution = solveProblem(
                objectiveFunction,
                optimType,
                constraints
            );
            resultArea.textContent = problemSummary + "\n\n" + solution;
            addBotMessage(`Tôi đã tìm được phương án tối ưu:\n${solution}`);
        }, 1500);
    }); */

    btnSolve.addEventListener("click", async function () {
        resultArea.textContent = "Đang xử lý phương án tối ưu...";

        const objectiveFunction = resultFormulaInput.value;
        const optimType = document.querySelector(
            'input[name="optType"]:checked'
        ).value;
        const constraints = [];
        const constraintRows =
            constraintsContainer.querySelectorAll(".constraint-row");

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

        if (constraints.length === 0 || objectiveFunction.trim() === "") {
            resultArea.textContent =
                "Vui lòng nhập hàm mục tiêu và ít nhất một ràng buộc.";
            return;
        }

        // Tạo chuỗi prompt để gửi lên AI
        let prompt = `Hãy giải bài toán tối ưu hóa tuyến tính sau bằng cách sử dụng phương pháp GrG simplex:
${optimType === "max" ? "Tối đa hóa" : "Tối thiểu hóa"} hàm mục tiêu: ${objectiveFunction}\n`;
        prompt += "Với các ràng buộc:\n";
        constraints.forEach((constraint, index) => {
            prompt += `${index + 1}. ${constraint.left} ${constraint.operator} ${constraint.right};\n`;
        });
        prompt += "Chỉ trả về kết quả A, B... và kết quả hàm mục tiêu, không cần giải thích cách làm!.\n"
        /* const prompt = `Bạn là một chuyên gia tối ưu hóa toán học. 
Hãy giải bài toán tối ưu hóa tuyến tính sau bằng cách sử dụng phương pháp đơn hình hoặc bất kỳ thuật toán phù hợp nào:

**Tối đa hóa hàm mục tiêu:**
Z = 1A + 1B

**Với các ràng buộc:**
1A + 2B >= 10
2A + 3B <= 20
A >= 0
B >= 0

Hãy trả về giá trị tối ưu của A, B và Z.
Nếu bài toán không có nghiệm, hãy trả lời: "Bài toán không có nghiệm".`; */
        addBotMessage(
            `Tôi đang giải bài toán tối ưu:\n${prompt}\nVui lòng đợi một chút...`
        );

        // Gọi AI để giải bài toán
        const solution = await solveAI(prompt);

        resultArea.textContent = prompt + "\n\n" + solution;
        addBotMessage(`Tôi đã tìm được phương án tối ưu:\n${solution}`);
    });

    function solveProblem(objective, optimType, constraints) {
        const varPattern = /[A-J]/g;
        const variables = [...new Set(objective.match(varPattern) || [])];

        if (variables.length === 0) {
            return "Không thể tìm thấy biến trong hàm mục tiêu.";
        }

        const coefficients = {};
        variables.forEach((variable) => {
            const regex = new RegExp(`([+-]?\\d*\\.?\\d*)${variable}`, "g");
            const match = regex.exec(objective);
            if (match) {
                let coef = match[1];
                if (coef === "+" || coef === "-" || coef === "") {
                    coef = coef + "1";
                }
                coefficients[variable] = parseFloat(coef);
            } else {
                coefficients[variable] = 1; // Default coefficient
            }
        });

        const solution = {};
        let totalValue = 0;

        variables.forEach((variable) => {
            const isMax = optimType === "max";
            const favorable =
                (isMax && coefficients[variable] > 0) ||
                (!isMax && coefficients[variable] < 0);
            const baseValue = favorable
                ? Math.floor(Math.random() * 5) + 5
                : Math.floor(Math.random() * 4) + 1;
            solution[variable] = baseValue;
            totalValue += coefficients[variable] * baseValue;
        });

        let solutionText = `Giá trị ${
            optimType === "max" ? "tối đa" : "tối thiểu"
        }: ${totalValue.toFixed(2)}\n\n`;
        solutionText += "Giá trị tối ưu cho các biến:\n";

        Object.keys(solution)
            .sort()
            .forEach((variable) => {
                solutionText += `${variable} = ${solution[variable]}\n`;
            });

        return solutionText;
    }

    chatButton.addEventListener("click", function () {
        chatContainer.style.display =
            chatContainer.style.display === "flex" ? "none" : "flex";
    });

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addUserMessage(message);
            chatInput.value = "";

            setTimeout(() => {
                respondToMessage(message);
            }, 500);
        }
    }

    function addUserMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message user-message";
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addBotMessage(message) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message bot-message";
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function respondToMessage(message) {
        message = message.toLowerCase();
        let response;
        response = solveAI(message);

        /* if (
            message.includes("xin chào") ||
            message.includes("chào") ||
            message.includes("hello") ||
            message.includes("hi")
        ) {
            response =
                "Xin chào! Tôi là trợ lý giải bài toán tối ưu tuyến tính. Bạn cần giúp đỡ gì không?";
        } else if (message.includes("cảm ơn")) {
            response = "Rất vui khi được giúp đỡ bạn!";
        } else if (message.includes("giải") || message.includes("solve")) {
            response =
                'Để giải bài toán tối ưu, bạn cần:\n1. Nhập số biến và hệ số của hàm mục tiêu\n2. Chọn loại bài toán (tối đa hóa/tối thiểu hóa)\n3. Thêm các ràng buộc\n4. Nhấn nút "Giải bài toán"';
        } else if (message.includes("max") || message.includes("tối đa")) {
            response =
                "Bài toán tối đa hóa là tìm giá trị lớn nhất có thể của hàm mục tiêu trong miền các ràng buộc. Ví dụ: Max Z = 3x + 4y với các ràng buộc x + y ≤ 10, x ≥ 0, y ≥ 0.";
        } else if (message.includes("min") || message.includes("tối thiểu")) {
            response =
                "Bài toán tối thiểu hóa là tìm giá trị nhỏ nhất có thể của hàm mục tiêu trong miền các ràng buộc. Ví dụ: Min Z = 5x + 2y với các ràng buộc 2x + y ≥ 8, x ≥ 0, y ≥ 0.";
        } else if (
            message.includes("ràng buộc") ||
            message.includes("constraint")
        ) {
            response =
                'Ràng buộc là các bất phương trình hoặc phương trình giới hạn giá trị của các biến. Ví dụ: 2A + 3B ≤ 15 là một ràng buộc. Bạn có thể thêm các ràng buộc bằng cách nhấn nút "Thêm ràng buộc".';
        } else if (
            message.includes("simplex") ||
            message.includes("thuật toán")
        ) {
            response =
                "Thuật toán Simplex là phương pháp phổ biến để giải bài toán quy hoạch tuyến tính. Nó hoạt động bằng cách di chuyển từ đỉnh này sang đỉnh khác của đa diện ràng buộc, tìm kiếm giá trị tối ưu của hàm mục tiêu.";
        } else if (message.includes("ví dụ") || message.includes("example")) {
            response =
                "Ví dụ về bài toán tối ưu tuyến tính:\n\nTối đa hóa: 3A + 2B + 5C\nRàng buộc:\n1. A + B + C ≤ 100\n2. 2A + B ≤ 150\n3. A, B, C ≥ 0";
        } else if (
            message.includes("hướng dẫn") ||
            message.includes("guide") ||
            message.includes("help")
        ) {
            response =
                'Hướng dẫn sử dụng:\n1. Nhập số lượng biến (từ 1-10)\n2. Nhập hệ số cho mỗi biến\n3. Chọn loại bài toán (tối đa hóa hoặc tối thiểu hóa)\n4. Thêm các ràng buộc\n5. Nhấn "Giải bài toán" để nhận kết quả';
        } else if (message.includes("biến") || message.includes("variable")) {
            response =
                "Biến là các giá trị cần tìm trong bài toán tối ưu. Trong ứng dụng này, bạn có thể sử dụng từ 1 đến 10 biến, được đặt tên từ A đến J.";
        } else if (
            message.includes("hàm mục tiêu") ||
            message.includes("objective function")
        ) {
            response =
                "Hàm mục tiêu là hàm cần được tối đa hóa hoặc tối thiểu hóa trong bài toán tối ưu. Ví dụ: Z = 5A + 3B - 2C là một hàm mục tiêu.";
        } else {
            response =
                "Tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về cách giải bài toán tối ưu, ý nghĩa của các thuật ngữ như ràng buộc, hàm mục tiêu, hoặc yêu cầu một ví dụ.";
        } */

        addBotMessage(response);
    }
});
