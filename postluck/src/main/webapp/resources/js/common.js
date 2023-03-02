/**
 * Smart POS - Common Function
 */
/* keyEvent 새로고침 
document.onkeydown = function(event){
	const key = event.keyCode;
	if(key == 116 || (event.ctrlKey && key == 82) || (event.altKey && key == 37)){
		event.preventDefault();
	}
};*/

let jsonString = '';
/* PUBLIC IP 수집 CallBackFunc */
let publicIp;
function getPublicIp(jsonData) {
	publicIp = jsonData.ip
}

let header ;
if (getJWT()) {                  
	header= new Headers(getJWT());
}
//commit test 
/* HttpRequest를 이용한 서버 요청
		clientData format : [['name', 'value'], ...]
 */
function serverCallByRequest(jobCode, methodType, clientData) {
	const form = createForm("", jobCode, methodType);

	if (clientData != '' && clientData != null) {
		for (let idx = 0; idx < clientData.length; idx++) {
			form.appendChild(createInputBox('hidden', clientData[idx][0], clientData[idx][1], ''));
		}
	}
	document.body.appendChild(form);
	form.submit();
}

/* ajax.readyState 
	0  request not initialize << new XMLHttpRequest()
	1	 server Connection established  << ajax.open() ajax.send()
	2  request recieved <<  client --> data --> server
	3	 processing request << server request processing
	4	 response ready
	
	ajax.status << data flow status
	200 << 'OK'
	400 403 << 'Forbidden'
		404 << 'PageNotFound'
*/
function serverCallByXHRAjax(formData, jobCode, methodType, callBackFunc) {
	const ajax = new XMLHttpRequest();
	console.log(formData);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4 && ajax.status == 200) {
			alert(ajax.responseText);
			window[callBackFunc](JSON.parse(ajax.responseText));
		} else {
			showModal('error:오류:오류가 발생했습니다:');
		}
	};

	ajax.open(methodType, jobCode);
	//ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	//ajax.setRequestHeader("Content-Type", "application/json");

	ajax.send(formData);
}

function serverCallByFetchAjax(formData, jobCode, methodType, callBackFunc) {
	fetch(jobCode, {
		method: methodType,
		/*
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	body: new URLSearchParams(formData)
	*/
		body: formData
	}).then(res => {
		if (res.headers.get("JWTForPostluck") != null) {
			//				console.log(res.headers.get("JWTForPostluck"))
			const jwt = res.headers.get("JWTForPostluck");
			if (jwt != '') sessionStorage.setItem('JWT', jwt);
		}
//		if (res.headers.get("AccessInfo") != null) {
//			const AccessInfo = res.headers.get("AccessInfo");
//			if (AccessInfo != '') sessionStorage.setItem('AccessInfo', AccessInfo);
//		} 
		console.log(res);
		return res.json();
	})
		.then(jsonData => window[callBackFunc](jsonData))
		.catch(error => {
			console.log(error);
			showModal('error:오류:오류가 발생했습니다:moveIndex');
		})
}
function moveIndex (){
	serverCallByRequest("/Index","get","");
}
/* JWT 사용한 서버 요청 */
function serverCallByFetch(formData, jobCode, methodType, callBackFunc, header) {
	fetch(jobCode, {
		method: methodType,
		headers: header,
		body: formData
	}).then(res => {
		if (res.headers.get("JWTForPostluck") != null) {
			const jwt = res.headers.get("JWTForPostluck");
			if (jwt != '') sessionStorage.setItem('JWT', jwt);
		}
		console.log(res);
		return res.json();
	})
		.then(jsonData => window[callBackFunc](jsonData))
		.catch(error => {
			console.log(error);
			showModal('error:오류:오류가 발생했습니다:');
		})
}

function serverCallByFetchAjaxUsingJson(jsonString, jobCode, methodType, callBackFunc) {

	fetch(jobCode, {
		method: methodType,
		headers: {
			'Content-Type': 'application/json'
		},
		body: jsonString
	}).then(response => response.json())
		.then(jsonData => window[callBackFunc](jsonData))
		.catch(error => {
			console.log(error);
			showModal('error:오류:오류가 발생했습니다:');
		})
}

function serverCallByFetchAjaxUsingUrl(jobCode, methodType, callBackFunc) {
	fetch(jobCode, {
		method: methodType,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
	}).then(response => response.json())
		.then(jsonData => window[callBackFunc](jsonData))
		.catch(error => {
			console.log(error);
			showModal('error:오류:오류가 발생했습니다:');
		})
}

/* Page Initialize */
function pageInit(messageString) {
	if (messageString != '') showModal(messageString);
}

function pageInitJson() {
	serverCallByFetchAjaxUsingUrl("https://api64.ipify.org?format=json", "get", "getPublicIp");

	console.log(serverData);
	const messageString = serverData.message;
	const accessInfo = serverData.accessDate;

	if (messageString != '') messageController(true, messageString);
	if (accessInfo != '') document.getElementById("accessInfo").innerText = "로그아웃(Access Time : " + accessInfo.substr(11) + ")";
	pageAuthorization();
}
/* 메세지박스 제어 */
function messageController(turn, messageString) {
	let message;

	const background = document.getElementById("background");
	const title = document.getElementById("messageTitle");
	const content = document.getElementById("messageContent");

	if (turn) {
		message = messageString.split(":");
		title.innerText = message[0];
		content.innerText = message[1];
		background.style.display = "block";
	} else {
		title.innerText = "";
		content.innerText = "";
		background.style.display = "none";
		if (messageString != '') {
			message = messageString.split(":");
			window[message[0]](message[1], message[2], message[3]);
		}
	}
}

/* 문자열이 JSON 데이터 타입인지 여부 */
function isJsonString(str) {
	let result;
	try {
		result = (typeof JSON.parse(str) === 'object');
	} catch (e) {
		result = false;
	}
	return result;
}

/* 서버로 전송할 데이터 길이의 유효성 판단 */
function lengthCheck(obj) {
	const dataLength = [["storeCode", 10, 10], ["storeName", 2, 50], ["storePhone", 11, 11], ["ceoName", 2, 20], ["storeInfo", 0, 30], ["storeInfoDetail", 0, 2000]];
	let result = false;

	for (let recordIdx = 0; recordIdx < dataLength.length; recordIdx++) {
		if (obj.getAttribute("id") == dataLength[recordIdx][0]) {
			if (dataLength[recordIdx][0] == 'storeCode' || dataLength[recordIdx][0] == 'storePhone') {
				if (obj.value.length >= dataLength[recordIdx][1]
					&& obj.value.length <= dataLength[recordIdx][2]) {
					if (!isNaN(obj.value)) result = true;
					/*isNaN : 문자면 true*/
				}
			} else if (obj.value.length >= dataLength[recordIdx][1] && obj.value.length <= dataLength[recordIdx][2]
				&& isNaN(obj.value.substr(0, 1))) result = true;
		}
	}

	return result;
}

/* Password Validation */
function isPasswordCheck(text) {

	const largeChar = /[A-Z]/;
	const smallChar = /[a-z]/;
	const num = /[0-9]/;
	const specialChar = /[!@#$%^&*]/;

	let typeCount = 0;

	if (largeChar.test(text)) typeCount++;
	if (smallChar.test(text)) typeCount++;
	if (num.test(text)) typeCount++;
	if (specialChar.test(text)) typeCount++;

	return typeCount >= 3 ? true : false;
}

/* FORM 생성 */
function createForm(name, action, method) {
	const form = document.createElement("form");
	if (name != "") form.setAttribute("name", name);
	form.setAttribute("action", action);
	form.setAttribute("method", method);
	return form;
}

/* DIV 생성 */
function createDIV(objId, className, funcName) {
	const div = document.createElement("div");
	if (objId != '') div.setAttribute("id", objId);
	if (className != '') div.setAttribute("class", className);
	if (funcName != '') div.setAttribute("onClick", funcName);

	return div;
}

function createDiv(objId, className, funcName, innerText) {
	const div = document.createElement("div");
	if (objId != '') div.setAttribute("id", objId);
	if (className != '') div.setAttribute("class", className);
	if (funcName != '') div.setAttribute("onClick", funcName);
	if (innerText != '') div.innerText = innerText;
	return div;
}


/* Input Box 생성*/
function createInputBox(type, name, value, placeholder) {
	const input = document.createElement("input");
	input.setAttribute("type", type);
	input.setAttribute("name", name);
	if (value != "") input.setAttribute("value", value);
	if (placeholder != "") input.setAttribute("placeholder", placeholder);
	return input;
}
/* DatePicker 생성 */
function createDatePicker(name, minDate, maxDate) {
	const date = document.createElement("input");
	date.setAttribute("type", "date");
	date.setAttribute("name", name);
	if (minDate != "") date.setAttribute("min", minDate);
	if (maxDate != "") date.setAttribute("max", maxDate);
	return date;
}

function createSelect(name, options, className, displayName) {
	const select = document.createElement("select");
	select.setAttribute("name", name);
	select.setAttribute("class", className);

	if (displayName != null && displayName != '') {
		const option = document.createElement("option");
		option.innerText = displayName;
		select.appendChild(option);
	}

	for (idx = 0; idx < options.length; idx++) {
		const option = document.createElement("option");
		option.setAttribute("value", options[idx].levCode);
		option.innerText = options[idx].levName;
		select.appendChild(option);
	}
	return select;
}

function createFileBox(name, className) {
	const fileBox = document.createElement("div");
	fileBox.setAttribute("class", className);
	const uploadName = document.createElement("input");
	uploadName.setAttribute("class", "uploadName");
	uploadName.setAttribute("readOnly", true);
	uploadName.setAttribute("placeholder", "NONE");
	uploadName.style.marginRight = "3%";
	const label = document.createElement("label");
	label.setAttribute("for", "file");
	label.innerText = "찾기";
	const file = document.createElement("input");
	file.setAttribute("type", "file");
	file.setAttribute("id", "file");
	file.setAttribute("name", name);
	file.addEventListener("change", function() {
		let fileName = document.getElementById("file").value;
		document.getElementsByClassName("uploadName")[0].value = fileName;
	});

	fileBox.appendChild(uploadName);
	fileBox.appendChild(label);
	fileBox.appendChild(file);

	return fileBox;
}

function createTextarea(name, placeholder, value, className) {
	const textarea = document.createElement('textarea');
	textarea.setAttribute('name', name);
	if (placeholder != '') textarea.setAttribute('placeholder', placeholder);
	if (value != '') textarea.setAttribute('value', value);
	textarea.setAttribute('class', className);
	return textarea;
}

function getJWT() {
	let accessToken = null;
	if (sessionStorage.JWT) {
		accessToken = [["JWTForPostluck", sessionStorage.JWT]];
	}
	return accessToken;
}

function accessOut() {
	const form = createForm("", "LogOut", "post");
	document.body.appendChild(form);
	form.submit();
}

function afterIssuance(jsonData) {
	console.log(jsonData);
	const accessToken = getJWT();
	//[[JWTForPostluck,ehfedrfgaksfdjhgaleiru245235]]
	if (jsonData != null) {
		if (accessToken) {
			accessToken.push(['snsID', jsonData.snsID]);
			serverCallByRequest('View/AccessCtl', 'post', accessToken);
		} else {
			console.log('accessToken is null')
		}
	} else {
		console.log(jsonData);
	}

}

function movePage(targetPage) {
	serverCallByRequest('/View/Move' + targetPage, 'post', getJWT());
}
function logout() {
	serverCallByRequest('/View/logOut', 'post', getJWT());
}
//카카오로그아웃  
function kakaoLogout() {
	if (Kakao.Auth.getAccessToken()) {
		Kakao.API.request({
			url: '/v1/user/unlink',
			success: function(response) {
			},
			fail: function(error) {
				console.log(error);
			},
		})
		Kakao.Auth.setAccessToken(undefined);
	}
}
function modalClose() {
	const modal = document.querySelector("#messageModal");
	modal.setAttribute("class", "modal fade hide");
	setTimeout(() => { modal.style.display = "none" }, 200);

}

function showModal(messageString) {
	if(isJsonString(messageString)){
		console.log("this is JsonString")
		if(messageString.message!=null){	
			console.log(messageString.message)		
		messageString = messageString.message;
		}
	}
	if (messageString != '') {
		console.log(messageString);
		let message = messageString.split(':');
		console.log(message);
		const btnOk = document.getElementById("btnOk");
		const btnCancel = document.getElementById("btnCancel");
		const btnClose = document.getElementById("modalClose");
		btnClose.addEventListener("click", modalClose)
		if (message[0] == 'warn') {
			document.getElementById("svgZone").innerHTML = '<i class="bi bi-exclamation-circle fs-1" style="color: var(--bs-danger)"></i>';
			btnOk.setAttribute("class", "btn btn-danger");
			btnOk.addEventListener("click", modalClose);
			btnCancel.addEventListener("click", modalClose);
			btnOk.addEventListener("click", window[message[message.length - 1]]);
		} else if (message[0] == 'plain') {
			document.getElementById("svgZone").innerHTML = '<i class="bi bi-check-circle fs-1" style="color: var(--bs-primary)"></i>';
			btnOk.setAttribute("class", "btn btn-primary");
			btnOk.addEventListener("click", modalClose);
			btnOk.addEventListener("click", window[message[message.length - 1]]);
			btnCancel.setAttribute("class", "btn btn-secondary d-none");
		} else if (message[0] == 'check') {
			btnOk.setAttribute("class", "btn btn-primary");
			btnOk.addEventListener("click", modalClose);
			btnOk.addEventListener("click", window[message[message.length - 1]]);
			btnCancel.addEventListener("click", modalClose);
		} else if (message[0] == 'error') {
			document.getElementById("svgZone").innerHTML = '<i class="bi bi-x-circle fs-1" style="color: var(--bs-danger)"></i>';
			btnOk.setAttribute("class", "btn btn-danger");
			btnOk.addEventListener("click", modalClose);
			btnOk.addEventListener("click", window[message[message.length - 1]]);
			btnCancel.setAttribute("class", "btn btn-secondary d-none");
		}
		document.getElementsByClassName('modal-title col-10')[0].innerText = message[1];
		let result = "";
		if (message[2].includes('.')) {
			const messages = message[2].split(".");
			for (let i = 0; i < messages.length; i++) {
				if (i != 0) {
					result += ".<br>";
				}
				result += messages[i].trim();
				
			}
		}else{
			result=message[2];
		}

		document.getElementById('alertContent').innerHTML = result;
		const modal = document.querySelector('#messageModal');
		modal.style.display = "block";  // modal 요소를 화면에 표시
		setTimeout(() => { modal.classList.add("show") }, 10);
	}
}


