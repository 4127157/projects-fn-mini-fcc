window.addEventListener("DOMContentLoaded", (event) => {
	var register = [];
	var display_register = ["0"];
	var operator_bool = false;
	var decimal_bool = true;
	var allow_zero = false;
	var allow_neg = true;
	var dBtns = document.querySelectorAll(".registerable");
	var decBtn = document.getElementById("decimal");
	var eqlBtn = document.getElementById("equals");
	var clrBtn = document.getElementById("clear");

	for (let i = 0; i < dBtns.length; i++) {
		dBtns.item(i).addEventListener("click", (e) => {
			e.preventDefault();
			if (e.target.value == "0") {
				if (allow_zero == true) {
					setRegister(e.target.value);
				}
			} else {
				setRegister(e.target.value);
			}
		});
	}

	decBtn.addEventListener("click", (e) => {
		e.preventDefault();
		if (decimal_bool == true) {
			if (
				isOperator(register[register.length - 1]) == true ||
				register.length == 0
			) {
				display_register.push("0.");
				register.push("0.");
				decimal_bool = false;
				updateDisplay();
			} else {
				display_register.push(".");
				register.push(".");
				decimal_bool = false;
				updateDisplay();
			}
		}
	});

	eqlBtn.addEventListener("click", (e) => {
		e.preventDefault();
		if (isOperator(register[register.length - 1])) {
			register.pop();
		}
		processSum();
	});

	clrBtn.addEventListener("click", (e) => {
		e.preventDefault();
		register = [];
		display_register = ["0"];
		operator_bool = false;
		decimal_bool = true;
		allow_zero = false;
		allow_neg = true;
		updateDisplay();
	});

	function processSum() {
		let temp = [];
		let sample = [];

		for (let i = 0; i < register.length; i++) {
			if (isOperator(register[i]) == true) {
				if (register[i] == "-" && i == 0) {
					temp.push(register[i]);
				} else if (register[i] == "-" && isOperator(register[i - 1]) == true) {
					temp.push(register[i]);
				} else {
					sample.push(temp.join(""));
					temp = [];
					sample.push(register[i]);
				}
			} else {
				temp.push(register[i]);
			}

			if (i == register.length - 1) {
				sample.push(temp.join(""));
				temp = [];
			}
		}

		for (let i = 0; i < sample.length; i++) {
			if (sample[i] == "/") {
				sample = [
					...sample.slice(0, i - 1),
					+sample[i - 1] / +sample[i + 1],
					...sample.slice(i + 2, sample.length)
				];
				i = 0;
				console.log("sample from divison:" + sample);
			}

			if (sample[i] == "x") {
				sample = [
					...sample.slice(0, i - 1),
					+sample[i - 1] * +sample[i + 1],
					...sample.slice(i + 2, sample.length)
				];
				i = 0;
				console.log("sample from multiple:" + sample);
			}
		}

		for (let i = 0; i < sample.length; i++) {
			if (sample[i] == "+") {
				sample = [
					...sample.slice(0, i - 1),
					+sample[i - 1] + +sample[i + 1],
					...sample.slice(i + 2, sample.length)
				];
				i = 0;
				console.log("sample from plus:" + sample);
			}
			if (sample[i] == "-") {
				sample = [
					...sample.slice(0, i - 1),
					+sample[i - 1] - +sample[i + 1],
					...sample.slice(i + 2, sample.length)
				];
				i = 0;
				console.log("sample from minus:" + sample);
			}
		}

		register = sample;
		display_register = sample;
		updateDisplay();
		console.log("this is equals test:");
		console.log("register:" + register);
		console.log("sample:" + sample);
	}

	function setRegister(val) {
		if (register.length == 0 && val == "-") {
			display_register = [];
			register.push(val);
			display_register.push(val);
			updateDisplay();
			operator_bool = false;
			allow_zero = false;
			decimal_bool = true;
			allow_neg = false;
		} else if (register.length == 0 && isOperator(val) == false) {
			display_register = [];
			register.push(val);
			operator_bool = true;
			decimal_bool = true;
			allow_zero = true;
			allow_neg = true;
			display_register.push(val);
			updateDisplay();
		} else if (isOperator(val) == false) {
			register.push(val);
			display_register.push(val);
			updateDisplay();
			operator_bool = true;
			allow_zero = true;
			allow_neg = true;
		} else if (operator_bool && isOperator(val) == true) {
			if (register[register.length - 1] == ".") {
				register.pop();
			}
			register.push(val);
			display_register = [];
			display_register.push(val);
			updateDisplay();
			operator_bool = false;
			decimal_bool = true;
			allow_zero = false;
			allow_neg = true;
		} else if (
			operator_bool == false &&
			isOperator(val) == true &&
			register.length > 0
		) {
			if (allow_neg == true && val == "-") {
				register.push(val);
				display_register = [];
				display_register.push(val);
				updateDisplay();
				operator_bool = false;
				decimal_bool = true;
				allow_zero = false;
				allow_neg = false;
			} else {
				if (isOperator(register[register.length - 2]) == true) {
					register = [...register.slice(0, register.length - 2), val];
				} else {
					register = [...register.slice(0, register.length - 1), val];
				}
				display_register = [];
				display_register.push(val);
				updateDisplay();
				decimal_bool = true;
				allow_zero = false;
			}
		}
	}

	function updateDisplay() {
		if (display_register.length > 1 && isOperator(display_register[0]) == true) {
			display_register.shift();
		}
		document.getElementById("display_register").innerText = register.join("");
		document.getElementById("display").innerText = display_register.join("");
	}

	function isOperator(val) {
		if (val == "/" || val == "x" || val == "+" || val == "-") return true;
		else return false;
	}
});

