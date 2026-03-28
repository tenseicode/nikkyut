const questionsData = [
    {
        text: "If our vibe was a dessert, what would it be?",
        options: [
            "Cotton candy cloud",
            "Sprinkle explosion cake",
            "Warm chocolate lava",
            "Strawberry cheesecake"
        ],
        gifSrc: [
            "images/cottoncandy.gif",
            "images/sprinkleconfetti.gif",
            "images/chocolate.gif",
            "images/strawberry.gif"
        ]
    },
    {
        text: "What’s the best way to break our next awkward silence?",
        options: [
            "Tickling telekinesis",
            "Giggle tornado",
            "Awkward penguin waddle",
            "Pun laser vision"
        ],
        gifSrc: [
            "images/tickle.gif",
            "images/laughing.gif",
            "images/awkwardpenguin.gif",
            "images/huskypunny.gif"
        ]
    },
    {
        text: "What dance move defines our energy right now?",
        options: [
            "Funky flamingo",
            "Tap-dancing penguin",
            "Chaotic squirrel",
            "Breakdancing cat"
        ],
        gifSrc: [
            "images/flamingodance.gif",
            "images/pengudance.gif",
            "images/squirdance.gif",
            "images/catdance.gif"
        ]
    },
    {
        text: "Our developing story is best described as...",
        options: [
            "Adorably clumsy",
            "Sunshine and smiles",
            "Epic slow burn",
            "Messy but charming"
        ],
        gifSrc: [
            "images/adorablecute.gif",
            "images/smilehappy.gif",
            "images/rengoku.gif",
            "images/xiaopang.gif"
        ]
    },
    {
        text: "How do we spend a lazy day together (in theory)?",
        options: [
            "Happiness marathon",
            "YouTube rabbit hole",
            "Cute chaos",
            "Chocolate tasting"
        ],
        gifSrc: [
            "images/smilehappy.gif",
            "images/laughing.gif",
            "images/adorablecute.gif",
            "images/chocolate.gif"
        ]
    }
];

let currentQuestionIndex = 0;
let quizActive = true;
let waitingForModal = false;

let userAnswers = [];

const questionContainer = document.getElementById("questionContainer");
const modal = document.getElementById("gifModal");
const closeModalBtn = document.querySelector(".close-modal");
const card = document.querySelector(".surprise-card");
const gifDisplay = document.getElementById("gifDisplay");

const gifImg = document.createElement("img");
gifImg.alt = "reaction gif";
gifImg.style.cssText = `width:100%; max-width:100%; height:auto; border-radius:16px; display:block; margin:0 auto;`;
if (gifDisplay) gifDisplay.appendChild(gifImg);

function showGif(src) { gifImg.src = src; }
function showModal(src) { showGif(src); modal.classList.add("modal--open"); }
function closeModal() { modal.classList.remove("modal--open"); waitingForModal = false; }

function advanceToNextQuestion() {
    if (!quizActive) return;
    if (currentQuestionIndex < questionsData.length) {
        renderCurrentQuestion();
    } else {
        finishQuiz();
    }
}

function onAnswerSelected(gifSrc, selectedOptionText) {
    if (!quizActive || waitingForModal) return;
    const currentQuestion = questionsData[currentQuestionIndex];
    userAnswers.push({
        question: currentQuestion.text,
        answer: selectedOptionText
    });
    waitingForModal = true;
    showModal(gifSrc);
}

function renderCurrentQuestion() {
    if (!quizActive) return;
    const q = questionsData[currentQuestionIndex];
    if (!q) return;

    const optionsHtml = q.options.map((opt, idx) =>
        `<button class="option-btn" data-gif-src="${q.gifSrc[idx]}" data-option-text="${opt}">${opt}</button>`
    ).join('');

    questionContainer.innerHTML = `
        <div class="question-text">${q.text}</div>
        <div class="options">${optionsHtml}</div>
    `;

    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!quizActive || waitingForModal) return;
            const gifSrc = btn.getAttribute("data-gif-src");
            const optionText = btn.getAttribute("data-option-text");
            if (gifSrc && optionText) onAnswerSelected(gifSrc, optionText);
        });
    });
}

function formatAnswersHTML() {
    let html = '<ul>';
    userAnswers.forEach(ans => {
        html += `<li><strong>${escapeHtml(ans.question)}</strong><br>➜ ${escapeHtml(ans.answer)}</li>`;
    });
    html += '</ul>';
    return html;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function sendAnswersEmail() {
    const answersHTML = formatAnswersHTML();
    const templateParams = {
        answers: answersHTML,
    };

    emailjs.send('service_3t2093l', 'template_rcy3jyn', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response);
        }, function(error) {
            console.error('Failed to send email:', error);
        });
}

function finishQuiz() {
    quizActive = false;

    console.log("Quiz completed! Answers:", userAnswers);

    setTimeout(() => {
        sendAnswersEmail();
    }, 1000);

    setTimeout(() => {
        if (card) {
            card.style.transition = "opacity 0.6s ease";
            card.style.opacity = "0";
            setTimeout(() => {
                if (card.parentNode) card.parentNode.removeChild(card);
                document.body.classList.remove("not-loaded");
                document.body.classList.add("flowers-revealed");
                const flowers = document.querySelector(".flowers");
                if (flowers) {
                    const clone = flowers.cloneNode(true);
                    flowers.parentNode.replaceChild(clone, flowers);
                }
            }, 600);
        }
    }, 1500); 
}

function handleModalClose() {
    const wasWaiting = waitingForModal;
    closeModal();
    if (wasWaiting) {
        currentQuestionIndex++;
        advanceToNextQuestion();
    }
}

closeModalBtn.addEventListener("click", handleModalClose);
modal.addEventListener("click", (e) => { if (e.target === modal) handleModalClose(); });

const modalContent = document.querySelector(".modal-content");
if (modalContent) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.style.cssText = `
        margin-top:12px; padding:10px 28px; background:linear-gradient(135deg,#ff98b9,#d45a7a);
        color:white; border:none; border-radius:60px; font-size:1rem; font-weight:600;
        cursor:pointer; font-family:inherit; box-shadow:0 4px 12px rgba(212,90,122,0.35);
        display:block; margin-left:auto; margin-right:auto;
    `;
    nextBtn.addEventListener("click", handleModalClose);
    modalContent.appendChild(nextBtn);
}

renderCurrentQuestion();