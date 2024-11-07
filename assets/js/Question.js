import { data } from "../db.js";

const serviceTime = document.getElementById("serviceTime");
const servicePrice = document.getElementById("serviceTotalPrice");
const questionTitle = document.getElementById("questionTitle");
const questionOptions = document.getElementById("questionOptions");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const result = { totalPrice: 0, company: "some", time: 100, answers: {} };
let question;

nextBtn.addEventListener("click", () => {
    const selectedRadio = document.querySelectorAll(
        `[name="${question.id}"]:checked`,
    );
    // -------------- for checkbox inputs ---------------
    if (selectedRadio.length > 1) {
        selectedRadio.forEach(checked => {
            result.answers[checked.name] = result.answers[checked.name]
                ? [...result.answers[checked.name], +checked.value]
                : [+checked.value];
        });
        handleShowQuestion(question.target_question_id);
    } else {
        const [target] = selectedRadio;
        result.answers[target.name] = +target.value;

        const targetQuestionID =
            question.options.find(({ id }) => id === +target.value)
                .target_question_id ?? question.target_question_id;

        handleShowQuestion(targetQuestionID);
    }
    console.log(result)
});

prevBtn.addEventListener("click", () => {
    const lastAnsweredQuestionID = Object.keys(result.answers).at(-1);

    handleShowQuestion(+lastAnsweredQuestionID);
});

const getData = () => {
    servicePrice.innerText = data.price;
    serviceTime.innerText = data.time;

    handleShowQuestion(data.questions[0].id);
};

const handleShowQuestion = questionID => {
    question = data.questions.find(question => question.id === questionID);

    questionTitle.innerText = question.title;
    questionOptions.innerHTML = question.options
        .map(option => radioOption(question.id, option.id, option.title))
        .join("");
};

const radioOption = (questionID, optionID, optionTitle) => {
    return `<div>
          <input type="radio" name="${questionID}" id="${optionID}" value="${optionID}" />
          <label for="${optionID}" class="Header7">${optionTitle}</label>
        </div>`;
};

getData();
