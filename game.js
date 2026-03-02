// 1. Firebase 라이브러리 불러오기 (게임에 필요한 것들로 정리)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. 본인의 Firebase 설정 (photo.js에 있는 것과 동일)
const firebaseConfig = {
    apiKey: "AIzaSyBrhP_DPagVEzILp5MftnZXN5m1nJD3qgg",
    authDomain: "saymyname-fanpage.firebaseapp.com",
    projectId: "saymyname-fanpage",
    storageBucket: "saymyname-fanpage.firebasestorage.app",
    messagingSenderId: "613226162204",
    appId: "1:613226162204:web:641483775d9fad18cf57d9",
    measurementId: "G-XTHQ805VV9"
};

// 3. Firebase 초기화 및 컬렉션 연결
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rankCol = collection(db, "rankings"); // 게임용은 'rankings' 컬렉션 사용

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// [수정] 배경음악 설정
const bgm = document.getElementById("bgm");
const bgmSources = bgm.getElementsByTagName("source"); // HTML에 넣은 노래 목록들
bgm.volume = 0.5;

// [추가] 랜덤으로 노래를 선택하는 함수
function playRandomBGM() {
    const randomIndex = Math.floor(Math.random() * bgmSources.length);
    bgm.src = bgmSources[randomIndex].src; // 랜덤하게 선택된 경로를 적용
    bgm.load(); // 새로운 곡 로드
    bgm.play(); // 재생
} 

// [추가] 볼륨 조절 기능
const volumeRange = document.getElementById("volumeRange");
const volumeValue = document.getElementById("volumeValue");

// 슬라이더 값이 바뀔 때마다 실행됨
volumeRange.addEventListener("input", (e) => {
    const vol = e.target.value;
    bgm.volume = vol; // 실제 음악 볼륨 조절
    volumeValue.innerText = `${Math.round(vol * 100)}%`; // 화면에 숫자 표시
});

// 1. 이미지 로드 체크 (멤버 + 플레이어)
const memberImagePaths = [
    'images/hitomi4.jpg', 'images/hitomi5.jpg','images/hitomi6.jpg', 'images/hitomi7.jpg',
    'images/shuie4.jpg', 'images/shuie5.jpg', 'images/shuie6.jpg', 'images/shuie7.jpg',
    'images/mei4.jpg', 'images/mei5.jpg', 'images/mei6.jpg', 'images/mei7.jpg',  
    'images/kanny4.jpg', 'images/kanny5.jpg', 'images/kanny6.jpg', 'images/kanny7.jpg',
    'images/soha4.jpg', 'images/soha5.jpg', 'images/soha6.jpg', 'images/soha7.jpg',
    'images/dohee4.jpg', 'images/dohee5.jpg', 'images/dohee6.jpg', 'images/dohee7.jpg',
    'images/junhwi4.jpg', 'images/junhwi5.jpg', 'images/junhwi6.jpg', 'images/junhwi7.jpg', 
    'images/seungjoo4.jpg', 'images/seungjoo5.jpg', 'images/seungjoo6.jpg', 'images/seungjoo7.jpg' 
];

// 플레이어 이미지 추가
const playerImg = new Image();
playerImg.src = 'images/cat.jpg'; // <-- 여기에 플레이어 이미지 경로를 넣으세요!
let playerLoaded = false;
playerImg.onload = () => { playerLoaded = true; };

let loadedImages = 0;
const memberImages = memberImagePaths.map(path => {
    const img = new Image();
    img.onload = () => { loadedImages++; };
    img.src = path;
    return img;
});

// 게임 상태 변수
let score = 0;
let gameOver = false;
let gameStarted = false;
let animationId; 
let members = [];
let spawnRate = 0.02;

// 플레이어 설정 (이미지 비율에 따라 w, h를 조절하세요)
const player = { x: 180, y: 510, w: 35, h: 35 }; 

// 마우스 이벤트 (기존과 동일)
canvas.addEventListener("mousemove", (e) => {
    if (!gameStarted || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.w / 2;
    
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
});

canvas.addEventListener("click", () => {
    if (loadedImages < memberImagePaths.length || !playerLoaded) return; 
    
    if (!gameStarted) {
        gameStarted = true;
        gameOver = false;
        playRandomBGM();
        requestAnimationFrame(update);
    } else if (gameOver) {
        resetGame();
    }
});

function createMember() {
    return {
        img: memberImages[Math.floor(Math.random() * memberImages.length)],
        x: Math.random() * (canvas.width - 40),
        y: -50,
        w: 40, h: 40,
        speed: 2 + Math.random() * (score / 500)
    };
}

function drawPlayer() {
    if (playerLoaded) {
        ctx.save(); // 현재 상태 저장
        ctx.beginPath();
        // 원형 경로 생성 (중심점 X, 중심점 Y, 반지름, 시작각도, 종료각도)
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip(); // 원형으로 자르기 활성화
        
        ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
        ctx.strokeStyle = "#000000"; // 테두리 색상
        ctx.lineWidth = 2; // 선 두께
        ctx.stroke(); // 원형 경로를 따라 선 긋기
        ctx.restore(); // 이전 상태로 복구 (다른 그리기에 영향 안 주게)
    }
}

function update() {
    if (gameOver) {
        cancelAnimationFrame(animationId);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 장애물 생성
    if (Math.random() < spawnRate) {
        members.push(createMember());
    }
    // 난이도 상승 (생성 빈도 증가)
    spawnRate += 0.000005; 

    // 2. 장애물 이동 및 그리기 (중첩 루프를 하나로 합침)
    for (let i = members.length - 1; i >= 0; i--) {
        let m = members[i];
        
        // 점수에 비례해서 속도 증가 (기본 속도 2 + 점수 보정)
        // m.speed는 createMember에서 이미 결정되지만, 여기서 실시간 보정도 가능합니다.
        m.y += m.speed;

        // --- 원형 그리기 ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(m.x + m.w / 2, m.y + m.h / 2, m.w / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(m.img, m.x, m.y, m.w, m.h);
        
        // 원형 테두리 (선택 사항)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // --- 충돌 체크 (원형 판정 기준) ---
        // 피타고라스 정리를 이용한 원형 충돌 판정이 가장 정확하지만, 
        // 기존 방식에서 수치만 조정해도 충분합니다.
        if (m.x < player.x + player.w - 15 && m.x + m.w > player.x + 15 &&
            m.y < player.y + player.h - 15 && m.y + m.h > player.y + 15) {
            endGame();
            return; 
        }

        // --- 화면 밖으로 나갔을 때 처리 ---
        if (m.y > canvas.height) {
            members.splice(i, 1);
            score += 10;
            document.getElementById("score").innerText = `Score: ${score}`;
        }
    }

    drawPlayer(); 
    animationId = requestAnimationFrame(update);
}

function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationId);
    
    bgm.pause(); // 게임 오버 시 음악 일시정지
    bgm.currentTime = 0; // 음악을 다시 처음으로 되돌림

    // 튕김 방지: 화면을 먼저 그린 후 팝업 띄우기
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "20px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`최종 점수: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = "15px Arial";
    ctx.fillText("다시 하려면 클릭하세요", canvas.width / 2, canvas.height / 2 + 60);

    setTimeout(() => {
        const playerName = prompt(`점수: ${score}\n닉네임을 입력하세요:`, "");
        if (playerName) saveRank(playerName, score);
    }, 100);
}

function resetGame() {
    score = 0;
    gameOver = false;
    members = [];
    spawnRate = 0.02;
    document.getElementById("score").innerText = `Score: 0`;
    
    // [수정] 노래를 멈췄다가 다시 선택해서 재생
    bgm.pause();
    bgm.currentTime = 0;
    playRandomBGM(); 
    
    requestAnimationFrame(update);
}

// 최초 실행 안내 함수
function drawStart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#333333"; // 글자 색상
    
    if (loadedImages < memberImagePaths.length || !playerLoaded) {
        // 아직 이미지가 로딩 중일 때
        ctx.font = "18px Arial";
        ctx.fillText("데이터 로딩 중...", canvas.width / 2, canvas.height / 2);
        
        // 로딩 완료 체크를 위해 계속 실행
        requestAnimationFrame(drawStart);
    } else {
        // 로딩이 완료되었을 때 (클릭 유도)
        ctx.font = "bold 24px Arial";
        ctx.fillText("클릭 시 게임시작😻", canvas.width / 2, canvas.height / 2);
    }
}

// 초기 호출

drawStart();

// [기능] 점수 저장하기 (이미 성훈님 endGame에서 호출 중)
window.saveRank = async (name, score) => {
    try {
        await addDoc(rankCol, {
            name: name,
            score: Number(score), // 숫자로 저장해야 정렬이 잘 됨
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("저장 실패:", e);
    }
};

// [기능] 실시간 랭킹 불러오기
function loadRankings() {
    // 점수 높은 순으로 10개만 감시
    const q = query(rankCol, orderBy("score", "desc"), limit(10));

    onSnapshot(q, (snapshot) => {
        const rankList = document.getElementById("rankList");
        if (!rankList) return;
        rankList.innerHTML = ""; 

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            rankList.innerHTML += `<li><strong>${index + 1}위</strong> ${data.name} : ${data.score}점</li>`;
        });
    });
}

// 시작할 때 랭킹판 불러오기
loadRankings();

// 노래가 끝나면 자동으로 다른 랜덤 노래 재생
bgm.addEventListener('ended', playRandomBGM);

