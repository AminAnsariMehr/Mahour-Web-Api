const serviceTime = document.getElementById("serviceTime");
const servicePrice = document.getElementById("serviceTotalPrice");
const progressBar = document.getElementById("currentProgressBar");
const questionTitle = document.getElementById("questionTitle");
const questionOptions = document.getElementById("questionOptions");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
let data, result, question;

nextBtn.addEventListener("click", () => {
    const targetQuestionID = getAnswers();

    handleShowQuestion(targetQuestionID);
});

prevBtn.addEventListener("click", () => {
    const [lastAnsweredQuestionID, lastAnsweredOptions] = Object.entries(
        result.answers
    ).at(-1);

    if (Array.isArray(lastAnsweredOptions)) {
        lastAnsweredOptions.forEach(option =>
            updateServiceStatus(+lastAnsweredQuestionID, option, "prev")
        );
    } else if (typeof lastAnsweredOptions !== "string") {
        updateServiceStatus(
            +lastAnsweredQuestionID,
            lastAnsweredOptions,
            "prev"
        );
    }

    delete result.answers[lastAnsweredQuestionID];
    handleShowQuestion(+lastAnsweredQuestionID);
});

submitBtn.addEventListener("click", () => {
    getAnswers();
    console.log(result.answers);
});

const getData = async () => {
    try {
        const formData = new FormData();
        formData.append("service_id", "8");
        formData.append("provider_id", "");

        const requestOptions = {
            method: "POST",
            body: formData,
            redirect: "follow",
        };

        const response = await fetch(
            "https://maahoura.com/api/v1/question/getQuestions",
            requestOptions
        );
        const json = await response.json();

        data = json.data;
        result = {
            price: +data.price,
            company: "some",
            time: data.time,
            answers: {},
        };

        handleShowQuestion(data.questions[0].id);
        updateServiceStatus(data.questions[0].id);
    } catch (error) {
        console.error(error);
    }

};

const handleShowQuestion = questionID => {
    let questionIndex;

    question = data.questions.find((question, index) => {
        if (question.id === questionID) {
            questionIndex = index;
            return true;
        }
    });
    questionTitle.innerText = question.title;

    if (question.type === 0) {
        questionOptions.innerHTML = questionOption(
            question.id,
            null,
            null,
            question.type
        );
    } else {
        questionOptions.innerHTML = question.options
            .map(option =>
                questionOption(
                    question.id,
                    option.id,
                    option.title,
                    question.type
                )
            )
            .join("");
    }

    progressBar.setAttribute(
        "style",
        `--p: ${(360 / data.questions.length) * (questionIndex + 1)}deg`
    );

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

const questionOption = (questionID, optionID, optionTitle, optionType) => {
    if (optionType === 0) {
        return `
    <img class="textArea-svg" src="./assets/svg/textArea.svg" alt="">
    <textarea name="${questionID}" id="${questionID}" cols="30" rows="10" placeholder="توضیحات: "></textarea>`;
    } else if (optionType === 1) {
        return `<div>
          <input type="radio" name="${questionID}" id="${optionID}" value="${optionID}" />
          <label for="${optionID}" class="Header7">${optionTitle}</label>
        </div>`;
    } else if (optionType === 2) {
        return `<div>
          <input type="file" name="${questionID}" id="${optionID}" value="${optionID}" multiple />
          <label for="${optionID}" class="Header7">${optionTitle}</label>
        </div>`;
    } else if (optionType === 3) {
        return `<div>
    <input type="checkbox" name="${questionID}" id="${optionID}" value="${optionID}" />
    <label for="${optionID}" class="Header7">${optionTitle}</label>
  </div>`;
    }
};

const btnDisableEnable = () => {
    const indexOfQuestion = data.questions.findIndex(
        ({ id }) => id === question.id
    );

    prevBtn.removeAttribute("disabled");
    nextBtn.removeAttribute("disabled");
    submitBtn.setAttribute("disabled", true);

    if (indexOfQuestion === 0) {
        prevBtn.setAttribute("disabled", true);
    } else if (indexOfQuestion === data.questions.length - 1) {
        nextBtn.setAttribute("disabled", true);
        submitBtn.removeAttribute("disabled");
    }
};

const getAnswers = () => {
    if (question.type === 0) {
        const { value } = document.getElementById(question.id);

        result.answers[question.id] = value;

        return question.target_question_id;
    } else if (question.type === 1) {
        const { name, value } = document.querySelector(
            `[name="${question.id}"]:checked`
        );

        result.answers[name] = +value;

        updateServiceStatus(+name, +value);

        return (
            question.options.find(({ id }) => id === +value)
                .target_question_id ?? question.target_question_id
        );
    } else if (question.type === 3) {
        const selectedOptions = document.querySelectorAll(
            `[name="${question.id}"]:checked`
        );

        selectedOptions.forEach(({ name, value }) => {
            result.answers[name] = result.answers[name]
                ? [...result.answers[name], +value]
                : [+value];

            updateServiceStatus(+name, +value);
        });

        return question.target_question_id;
    }
};

getData();
