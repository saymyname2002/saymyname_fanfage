const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// [추가] 배경음악 설정
const bgm = document.getElementById("bgm");
bgm.volume = 0.5; // 볼륨 50%

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
        bgm.play(); // [추가] 처음 시작할 때 음악 재생
        requestAnimationFrame(update);
    } else if (gameOver) {
        resetGame();
    }
});

// 클릭 시 시작/재시작 (기존과 동일)
canvas.addEventListener("click", () => {
    if (loadedImages < memberImagePaths.length || !playerLoaded) return; 
    
    if (!gameStarted) {
        gameStarted = true;
        gameOver = false;
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
    
    bgm.pause(); // [추가] 게임 오버 시 음악 일시정지
    bgm.currentTime = 0; // [추가] 음악을 다시 처음으로 되돌림

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
        const playerName = prompt(`점수: ${score}\n이름을 입력하세요:`, "");
        if (playerName) saveRank(playerName, score);
    }, 100);
}

function resetGame() {
    score = 0;
    gameOver = false;
    members = [];
    spawnRate = 0.02;
    document.getElementById("score").innerText = `Score: 0`;
    
    bgm.play(); // [추가] 재시작 시 음악 다시 재생
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


