  document.addEventListener("DOMContentLoaded", function() {
    renderCategories();
    renderScores();
  });

  //pull category from API
  const api = "http://localhost:3000/categories";
  const quizBar = document.getElementById("quiz-bar");
  const quizbox = document.querySelector("#quiz-summary-container");
  const leaderTable = document.querySelector("#table");

  const state = {
    selectedCategory: null,
    currentScore: 0,
    currentRound: null,
    currentQuestion: null,
    answers: [],
    lives: 3,
    currentUser: null,
    questions: []
  };

  function getCategory() {
    return fetch(api).then(response => response.json());
  }

  function addCategoryToBar(category) {
    divEl = document.createElement("div");
    divEl.className = "card";
    divEl.dataset.id = category.id;
    divEl.innerHTML = `
    <img class = "category-image" src='${category.image_url}'/>
    `;

    quizBar.appendChild(divEl);
    divEl.addEventListener("click", event => {

      showQuiz(category);
    });
  }

  function showQuiz(category) {
    state.selectedCategory = category;
    state.questions = []
    state.currentScore = 0,
    state.answers = [],
    state.lives = 3,
    quizbox.innerHTML = `
    <h2>${category.name}</h2>
    <button class="btn btn-light" id="start-quiz-btn" type="button">Start Quiz! </button>
  `;

    const startBtn = document.querySelector("#start-quiz-btn");
    startBtn.addEventListener("click", event => {
      newRound();
      getQuestion();
    });
  }

  function getQuestion() {
    let number = Math.floor(Math.random() * Math.floor(15));
    const newnumber = number + 1;

    return fetch(`http://localhost:3000/questions/${newnumber}`)
      .then(resp => resp.json())
      .then(question => {
        if (state.answers.length > 9) {
          endRound();
        } else {
          renderQuestion(question);
          state.questions.push(question.id)
        }
      });
  }

  function endRound() {
    state.answers = [];
    createUser();
    quizbox.innerHTML = `<h2>End of Game. Play Again?</h2>
    `;
    console.log("end of game");
    state.lives = 3;
    state.questions = []

    const restartBtn = document.createElement("button");
    restartBtn.type = "button";
    restartBtn.id = "restart-quiz-btn";
    restartBtn.className = "btn btn-light";
    restartBtn.setAttribute("type", "submit");
    restartBtn.innerText = 'Restart Quiz'
    restartBtn.addEventListener("click", event => {
      showQuiz(state.selectedCategory);
    });
    quizbox.append(restartBtn)

    state.currentScore = 0;
    state.currentUser = null;
  }

  function renderCategories() {
    getCategory().then(categories => categories.forEach(addCategoryToBar));
  }

  function renderQuestion(question) {

    if (state.questions.includes(question.id)) {
      getQuestion();
    } else {

    // randomised radio buttons - ensures answers aren't always in the same position
    const shuffle = Math.floor(Math.random() * 20) + 1
    if (shuffle > 10) {
      quizbox.innerHTML = `

      <p>${question.content}</p>
      <form id="form">
      <div id="answers-div">
      <input id="answers" type="radio" name="test" value='correct'>   ${question.answer}<br>
      <input id="answers" type="radio" name="test" value='incorrect'> ${question.incorrect_1}<br>
      </div>
      </form>
      <br><br><br><br><br>

      <p>Current score: ${state.currentScore}</p>
      <p>Current Lives: ${state.lives}</p>
      `;
    } else {
      quizbox.innerHTML = `

      <p>${question.content}</p>
      <form id="form">
      <div id="answers-div">
      <input id="answers" type="radio" name="test" value='incorrect'> ${question.incorrect_1}<br>
      <input id="answers" type="radio" name="test" value='correct'>   ${question.answer}<br>
      </div>
      </form>
      <br><br><br><br><br>

      <p>Current score: ${state.currentScore}</p>
      <p>Current Lives: ${state.lives}</p>
      `;
    }

    const submitBtn = document.createElement("button");
    submitBtn.type = "button"
    submitBtn.className = "btn btn-light";
    submitBtn.setAttribute("type", "submit");
    submitBtn.innerText = "Submit Answer";
    quizbox.append(submitBtn);

    submitBtn.addEventListener("click", event => {
      const providedAnswer = form.test.value;

      createAnswer(providedAnswer, question);
      state.answers.push(providedAnswer);
      if (providedAnswer === "incorrect") {
        --state.lives;
      } else {
        ++state.currentScore;
      }

      if (state.answers.length > 9 || state.lives === 0) {
        endRound();
      } else {
        getQuestion();
      }
    })
  }
  }

  function valReq(val) {
    return (val);
  }

  function valString(val) {
    return (isNaN(val));
  }

  function newRound() {
    state.answers = [];
    let text;
    let player;
    let valid=false;

    while(!valid) {
    	player = prompt("Please enter your name");
    	valid = (valReq(player) && valString(player));
    }

    state.currentUser = player;
    createRound(player);
    //state.currentRound = Round.id
  }

  // post new player to backend
  function createRound(player) {
    return fetch("http://localhost:3000/rounds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ playername: player })
    }).then(resp => resp.json());
  }

  function createAnswer(providedAnswer, question) {
    return fetch("http://localhost:3000/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ answer: providedAnswer, question_id: question.id })
    }).then(resp => resp.json());
    // .then(resp => state.answers.push(resp.answer));
  }

  function createUser() {
    return fetch("http://localhost:3000/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: state.currentUser,
        points: state.currentScore
      })
    }).then(resp => resp.json())
      .then(score => addScore(score))
  }

  function checkAnswers() {
    console.log(form.test.value);
  }

  function addScore(score) {
    const li = document.createElement("li");
    li.id = "score-entries"
    li.innerHTML = `
    ${score.name} Scored ${score.points}
    `;
    leaderTable.append(li);
  }

  function getScores() {
    return fetch("http://localhost:3000/scores").then(resp => resp.json());
  }

  function renderScores() {
    getScores().then(scores => scores.forEach(addScore));
  }

//   quizbox.innerHTML = state.selectedCategory.questions
//     .map(function(e) {
//       return `<li id='${e.id}'>
//   <label> ${e.content} </label>
//   <form id="form${e.id}">
//   <input type="radio" name="test" value='correct'>   ${e.answer}<br>
//   <input type="radio" name="test" value='incorrect'> ${e.incorrect_1}<br>
// </form>
//   </li>
//   <br>`;
//     })
//     .join("");

// const submitBtn = document.createElement("button");
// submitBtn.className = "submit";
// submitBtn.setAttribute("type", "submit");
// submitBtn.innerText = "Submit Answers";
// quizbox.append(submitBtn);
// submitBtn.addEventListener("click", e => {
//   checkAnswers();
//   console.log(state.currentScore);
