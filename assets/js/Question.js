import { data } from "../db.js";

const serviceTime = document.getElementById("serviceTime");
const servicePrice = document.getElementById("serviceTotalPrice");
const questionTitle = document.getElementById("questionTitle");
const questionOptions = document.getElementById("questionOptions");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const result = {
    price: +data.price,
    company: "some",
    time: data.time,
    answers: {},
};
let question;

nextBtn.addEventListener("click", () => {
    const selectedRadio = document.querySelectorAll(
        `[name="${question.id}"]:checked`
    );

    if (selectedRadio.length > 1) {
        selectedRadio.forEach(({ name, value }) => {
            result.answers[name] = result.answers[name]
                ? [...result.answers[name], +value]
                : [+value];

            updateServiceStatus(+name, +value);
        });
        handleShowQuestion(question.target_question_id);
    } else {
        const [target] = selectedRadio;
        result.answers[target.name] = +target.value;

        updateServiceStatus(+target.name, +target.value);

        const targetQuestionID =
            question.options.find(({ id }) => id === +target.value)
                .target_question_id ?? question.target_question_id;

        handleShowQuestion(targetQuestionID);
    }
});

prevBtn.addEventListener("click", () => {
    const [lastAnsweredQuestionID, lastAnsweredOptions] = Object.entries(
        result.answers
    ).at(-1);

    if (Array.isArray(lastAnsweredOptions)) {
        lastAnsweredOptions.forEach(option =>
            updateServiceStatus(+lastAnsweredQuestionID, option, "prev")
        );
    } else {
        updateServiceStatus(
            +lastAnsweredQuestionID,
            lastAnsweredOptions,
            "prev"
        );
    }

    delete result.answers[lastAnsweredQuestionID];
    handleShowQuestion(+lastAnsweredQuestionID);
});

const getData = () => {
    updateServiceStatus();
    handleShowQuestion(data.questions[0].id);
};

const handleShowQuestion = questionID => {
    question = data.questions.find(question => question.id === questionID);

    questionTitle.innerText = question.title;
    questionOptions.innerHTML = question.options
        .map(option =>
            questionOption(
                question.id,
                option.id,
                option.title,
                question.max > 1 ? "checkbox" : "radio"
            )
        )
        .join("");

    btnDisableEnable();
};

const updateServiceStatus = (questionID, optionID, status = "next") => {
    if (questionID && optionID) {
        const { price, time } = data.questions
            .find(item => item.id === questionID)
            .options.find(option => option.id === optionID);

        if (status === "next") {
            result.price += price;
            result.time += time;
        } else {
            result.price -= price;
            result.time -= time;
        }
    }

    servicePrice.innerText = result.price;
    serviceTime.innerText = result.time;
};

const questionOption = (questionID, optionID, optionTitle, inputType) => {
    return `<div>
          <input type="${inputType}" name="${questionID}" id="${optionID}" value="${optionID}" />
          <label for="${optionID}" class="Header7">${optionTitle}</label>
        </div>`;
};

const btnDisableEnable = () => {
    const indexOfQuestion = data.questions.findIndex(
        ({ id }) => id === question.id
    );

    prevBtn.removeAttribute("disabled");
    nextBtn.removeAttribute("disabled");

    if (indexOfQuestion === 0) {
        prevBtn.setAttribute("disabled", true);
    } else if (indexOfQuestion === data.questions.length - 1) {
        nextBtn.setAttribute("disabled", true);
    }
};

getData();
