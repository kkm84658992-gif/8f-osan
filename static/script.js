function cleanNumber(v){
    return parseFloat(String(v).replace(/,/g,'')) || 0;
}

function normalize(v){
    return String(v).trim().replace(/\s/g,'').toLowerCase();
}

let currentItem = null;

/* =========================
   랙 스캔 → 상품칸 이동
========================= */
function rackEnter(e){
    if(e.key === "Enter"){
        e.preventDefault();
        document.getElementById('product').focus();
        document.getElementById('product').value = "";
    }
}

/* =========================
   상품 스캔
========================= */
function scanEnter(e){
    if(e.key === "Enter"){
        e.preventDefault();
        searchItem();
    }
}

function searchItem(){
    let rack = normalize(document.getElementById('rack').value);
    let product = normalize(document.getElementById('product').value);

    let found = data.find(d =>
        normalize(d["로케이션"]) === rack &&
        normalize(d["바코드"]) === product
    );

    if(found){
        currentItem = found;
        renderFound(found);
    }else{
        currentItem = null;
        renderNew(rack, product);
    }

    document.getElementById('product').value = "";
}

/* =========================
   기존 데이터 표시
========================= */
function renderFound(item){
    document.getElementById('app').innerHTML = `
        <div class="card">
            <p><b>랙:</b> ${item["로케이션"]}</p>
            <p><b>상품명:</b> ${item["상품명"]}</p>
            <p><b>소비기한:</b> ${item["소비기한"] || "미표기"}</p>
            <p><b>로트번호:</b> ${item["로트번호"] || "미표기"}</p>
            <p><b>재고수량:</b> ${item["재고수량"]}</p>

            <input id="real" placeholder="실수량" oninput="calc()" autofocus>
            <p>차이수량: <span id="diff">0</span></p>

            <!-- 🔥 다음 버튼 -->
            <button onclick="nextItem()">다음</button>
        </div>
    `;

    // 🔥 Enter로도 다음 가능
    document.getElementById('real').addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            e.preventDefault();
            nextItem();
        }
    });
}

/* =========================
   차이 계산
========================= */
function calc(){
    let real = cleanNumber(document.getElementById('real').value);
    let stock = cleanNumber(currentItem["재고수량"]);
    let diff = real - stock;

    document.getElementById('diff').innerText = diff;
}

/* =========================
   다음 버튼 (핵심)
========================= */
function nextItem(){
    const realInput = document.getElementById('real');

    if(!realInput || realInput.value.trim() === ""){
        alert("실수량 입력해주세요");
        return;
    }

    let real = cleanNumber(realInput.value);
    let stock = cleanNumber(currentItem["재고수량"]);
    let diff = real - stock;

    // 🔥 데이터 저장
    currentItem["실수량"] = real;
    currentItem["차이수량"] = diff;

    // 🔥 UI 숨김
    document.getElementById('app').innerHTML = "";

    // 🔥 다음 스캔 준비
    document.getElementById('product').value = "";
    document.getElementById('product').focus();
}

/* =========================
   신규 등록 UI
========================= */
function renderNew(rack, product){
    document.getElementById('app').innerHTML = `
        <div class="card">
            <h3>신규 등록</h3>
            <input id="n_name" placeholder="상품명">
            <input id="n_barcode" value="${product}" placeholder="바코드">
            <input id="n_exp" placeholder="소비기한">
            <input id="n_lot" placeholder="로트번호">
            <input id="n_qty" placeholder="재고수량">
            <input id="n_loc" value="${rack}" placeholder="랙">

            <button onclick="addNew()">등록</button>
        </div>
    `;
}

/* =========================
   신규 등록 처리
========================= */
function addNew(){
    let item = {
        "로케이션": document.getElementById('n_loc').value,
        "상품명": document.getElementById('n_name').value,
        "바코드": document.getElementById('n_barcode').value,
        "소비기한": document.getElementById('n_exp').value,
        "로트번호": document.getElementById('n_lot').value,
        "재고수량": cleanNumber(document.getElementById('n_qty').value),
        "실수량": 0,
        "차이수량": 0
    };

    data.push(item);

    alert("등록 완료");

    document.getElementById('app').innerHTML = "";
    document.getElementById('product').focus();
}

/* =========================
   다운로드
========================= */
function download(){
    fetch('/save',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>{
        window.location = res.download_url;
    });
}

/* =========================
   공유
========================= */
function share(){
    fetch('/save',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(res=>{
        let url = location.origin + res.download_url;
        navigator.clipboard.writeText(url);
        alert("다운로드 링크 복사됨");
    });
}
