// 1. 데이터 파트 (mdeia -> media 오타 및 Key 이름 통일)
const memberInfo = {
    "HITOMI": { birthday: "2001.10.06", role: "리더, 서브보컬", mbti: "INTJ", color: "#f6f07b", media: [ {img: "images/hitomi.jpg", vId: "CfFnOJTY-sw"}, {img: "images/hitomi1.jpg", vId: "yTiPN2VCXdc"}, {img: "images/hitomi2.jpg", vId: "bJYh3xD5lTk"}, {img: "images/hitomi3.jpg", vId: "MdL3JtlxCQc"} ] },
    "SHUIE": { birthday: "2004.06.06", role: "래퍼", mbti: "ISFP", color: "#cca9dd", media: [ {img: "images/shuie3.jpg", vId: "amFvnRHxvOU"}, {img: "images/shuie.jpg", vId: "DH0oZVBNjro"}, {img: "images/shuie1.jpg", vId: "1kPsA0HjKgA" }, {img: "images/shuie2.jpg", vId: "jFXYajmiyfo" } ] }, 
    "MEI": { birthday: "2005.09.27", role: "메인댄서, 서브보컬", mbti: "ENFP", color: "#f2afce", media: [ {img: "images/mei.jpg", vId: "VCUpP49UU60"}, {img: "images/mei1.jpg", vId: "N3nTKB0qwNA"}, {img: "images/mei2.jpg", vId: "C5KPys5U9-Q"}, {img: "images/mei3.jpg", vId: "j4RdDQvurkc"} ] },
    "KANNY": { birthday: "2005.12.26", role: "메인래퍼", mbti: "INFP", color: "#de3b60", media: [ {img: "images/kanny.jpg", vId: "YEA8CJsNJQM"}, {img: "images/kanny1.jpg", vId: "p1ntJu0QMu8"}, {img: "images/kanny2.jpg", vId: "TvmVy6LASjQ"}, {img: "images/kanny3.jpg", vId: "tM4H4Lht2fk"} ] },
    "SOHA": { birthday: "2006.07.26", role: "메인보컬", mbti: "ENTP", color: "#f47c50", media: [ {img: "images/soha.jpg", vId: "17y9z5RpZ6c"}, {img: "images/soha1.jpg", vId: "43yJBJKNfLk"},{img: "images/soha2.jpg", vId: "pnhA1UyEEDg"}, {img: "images/soha3.jpg", vId: "Wl8sKnxAiW8" } ] },
    "DOHEE": { birthday: "2006.12.09", role: "센터, 리드보컬", mbti: "INTP", color: "#f5f5f5", media: [ {img: "images/dohee.jpg", vId: "Ir59UwpWCCI"}, {img: "images/dohee1.jpg", vId: "-awSN4bJWTY"}, {img: "images/dohee2.jpg", vId: "qNdAIxWFRPY"}, {img: "images/dohee3.jpg", vId: "Sx3yCd2g-8o"} ] },
    "JUNHWI": { birthday: "2007.06.11", role: "메인댄서, 서브래퍼", mbti: "ISFP", color: "#464153", media: [ {img: "images/junhwi.jpg", vId: "M-u9-dWa9Y4" },{img: "images/junhwi1.jpg", vId: "Go9GNJfmCHs"}, {img: "images/junhwi2.jpg", vId: "kOEeA6IhV3I"}, {img: "images/junhwi3.jpg", vId: "HDQ1cl4D5Io"} ] },
    "SEUNGJOO": { birthday: "2010.09.24", role: "메인보컬, 메인댄서", mbti: "INFP", color: "#bcddc4", media: [ {img: "images/seungjoo.jpg", vId: "JCoh1teTyYw"}, {img: "images/seungjoo1.jpg", vId: "lRulvtnqx4Y"}, {img: "images/seungjoo2.jpg", vId: "e9pQjpUCYPI"}, {img: "images/seungjoo3.jpg", vId: "mZPT3bnbv8g"} ] },
};

const modal = document.getElementById("profile-modal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");

// 클릭 이벤트
document.querySelectorAll(".member-card").forEach(card => {
    card.addEventListener("click", () => {
        const name = card.innerText.trim();
        const info = memberInfo[name];

        if (info && info.media) {
            // item.img와 item.vId로 Key 이름 일치시킴
            const imgTags = info.media.map(item => 
                `<img src="${item.img}" class="modal-img" alt="${name} 사진" onclick="playVideo('${item.vId}')" style="cursor: pointer;">`
            ).join("");

            modalBody.innerHTML = `
                <div id="video-container" class="modal-image-container">
                    ${imgTags}
                </div>
                <p style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                    사진을 클릭하면 서로 다른 직캠이 재생됩니다!
                </p>
                <h2 id="modal-name" style="color: ${info.color}; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${name}</h2>
                <p><strong>생일:</strong> ${info.birthday}</p>
                <p><strong>포지션:</strong> ${info.role}</p>
                <p><strong>MBTI:</strong> ${info.mbti}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
            `;
            
            const modalContent = document.querySelector(".modal-content");
            modalContent.style.borderTop = `10px solid ${info.color}`;
            modal.style.display = "block";
        }
    });
});

// 영상 재생 함수
function playVideo(videoId) {
    const container = document.getElementById("video-container");
    container.innerHTML = `
        <div style="width:100%">
            <iframe 
                width="100%" 
                height="300" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen
                style="border-radius: 12px;">
            </iframe>
            <button onclick="resetPhotos()" style="margin-top:10px; cursor:pointer; padding:5px 10px; border-radius:5px; border:1px solid #ddd; background:#E0E0E0;">
                ↺ 사진 목록으로 돌아가기
            </button>
        </div>
    `;
}

// 다시 사진 목록을 보여주는 함수
function resetPhotos() {
    const currentName = document.getElementById("modal-name").innerText;
    const info = memberInfo[currentName];
    
    const container = document.getElementById("video-container");
    // 여기서도 item.img와 item.vId를 사용해야 합니다.
    const imgTags = info.media.map(item => 
        `<img src="${item.img}" class="modal-img" onclick="playVideo('${item.vId}')" style="cursor:pointer;">`
    ).join("");
    
    container.innerHTML = imgTags;
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};
