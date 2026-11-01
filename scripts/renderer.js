console.log('renderer loaded');

//--- ENUMS ---
//--- where to append ---
const appendPlace = Object.freeze({
  MID_COL_LIST: 0,
  SEARCH_RESULT: 1
});

const errorCodes = Object.freeze({
  NO_DATA: 0 //such as when bd returns no next lessons or homework
})

const confirmationCodes = Object.freeze({
  DONE: 0
})

const daysOfWeek = Object.freeze({
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0
});

//--- END OF ENUMS ---

//--- FLAGS & stuff ---

//--- db test ---
let isTestDbFlag = false;

//--- search namespace ---
globalThis.Search = globalThis.Search || {
  searchCounter: 0,
  isFirstSearch: true,
  isFirstSearchAppend: true,
  lastSearch: null,
  lastSearchFName: false,
  lastSearchSName: false,
  isVisible: false

}

//--- next lesson flags ---
globalThis.PopUp = globalThis.PopUp || {
  isFirstInput: [null],
  postionToWrite: 0,
  eventListener: [0],
  isWritten: [0],
  isFormActive: false
}

globalThis.Calendar = globalThis.Calendar || {
  isPopUpOn: false
}

//--- END OF FLAGS ---

function execOrder() {
  console.log('entered execOrder');
  if (!isTestDbFlag) {
    console.log('running testDb()');
    testDb();
  } else {
    renderList();
    callRenderCalendar();
  }
  renderList();
  callRenderCalendar();
}

//--- EVENT LISTENERS ---

//--- SEARCH BAR EVENT LISTENERS ---
//--- event listener for search form button ---
document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  searchByName();
})

//--- event listener to hide search box ---
document.getElementById('search-result').addEventListener('mouseleave', (h) => {
  shrinkSearResult();
});
document.getElementById('search-result').addEventListener('mouseover', (s) => {
  expandSearchResult();
})

//--- ADD LESSON EVENT LISTENER ---
//--- enevnt listener for pop up -> next lesson. Sets listner for either submit button press or Enter ---
function setPopUpEventListener(id, inputDateId, studentId, inputContainer, paragraphToRemove, buttonId) {

  if (!isWrittenCkeck(id)) {
    document.getElementById(id).addEventListener('submit', (e) => {
      e.preventDefault();
      processNextLessonInput(inputDateId, studentId, inputContainer, paragraphToRemove, buttonId);
      callRenderCalendar();
      closePopUp('popUpId_2', studentId);
      //--- set form active flag to false ---
      PopUp.isFormActive = false;
    });
    PopUp.isWritten.push(id);
    PopUp.eventListener.push(id);
  }
}

//--- END OF EVENT LISTENERS ---

function isWrittenCkeck(id) {
  let isMatch = false;
  //--- first check if the event listener already set ---
  if (!isMatch) {
    for (const i of PopUp.eventListener) {
      if (i === id) {
        isMatch = true;
        return;
      }
    }
    return isMatch;
  } else {
    return isMatch;
  }
}

//--- MID COLUMN RENDERER ---
const studentsList = document.getElementById("student-list-container-h");

//--- FETCH LIST OF STUDENTS FOR THE DB ---
async function getListOfStudents() {
  const list = await window.api.getStudents();
  return list;
}

const renderList = async () => {
  getListOfStudents().then((listOfStudents) => {
    for (const i of listOfStudents) {
      //--- Build card for current student ---
      buildCard(i, appendPlace.MID_COL_LIST, appendPlace.MID_COL_LIST);
    }
  })
}

//--- FETCHING ALL STUDENTS FROM DB ---
async function testDb() {
  const students = await window.api.getStudents();
  console.log('Students', students);

  if (students.length === 0) {
    const newId = await window.api.addStudent({
      name: 'Jotaro Kujo', phone: '911', notes: 'is a delinquent who lives an ordinary life until the Joestar Familys old enemy, DIO, returns'
    });
  } else if (students.length === 1) {
    const newId = await window.api.addStudent({
      name: 'Satory Gojo', phone: '091101', notes: 'He is a special grade jujutsu sorcerer and widely recognized as the strongest in the world. Satoru is the pride of the Gojo Clan, the first person to inherit both the Limitless and the Six Eyes in four hundred years. He works as a teacher at the Tokyo Jujutsu High and uses his influence to protect and train strong young allies.'
    });
  } else if (students.length === 2) {
    const newId = await window.api.addStudent({
      name: 'Yami Sukehiro', phone: '1254', notes: 'Nicknamed the "Lord of Destruction", he is the captain of the Black Bulls, considered the worst Magic Knight Squad, and recruits Asta. Yami is physically strong and intimidating, threatening anyone who annoys him'
    });
  }
  else {
    console.log('Student:', students);
  }

  //--- lessons check ---
  const lessonDateTest = '2026-10-21';
  if (await checkIfLessonDateIsInDB(1, lessonDateTest) === false) {
    const newLesson = await window.api.addLesson({
      student_id: 1,
      lesson_date: lessonDateTest,
      homework: 'Master stand attack'
    });
    const lesson = await window.api.getNextLesson(1);
    //console.log('Lesson: ', lesson.lesson_date);
  }
  if (await checkIfLessonDateIsInDB(3, lessonDateTest) === false) {
    const newLesson = await window.api.addLesson({
      student_id: 3,
      lesson_date: lessonDateTest,
      homework: 'Take a fat shit'
    });
  }
}

//--- BUILD A STUDENT'S CARD ---
function buildCard(currentStudent, forWhat, whereToAppend) {
  //console.log('starting building a card');
  //--- marker for id that is depend on where an element should be append ---
  const idMarkerMCL = "MCL"; //*MCL - mid column list
  const idMarkerSearch = "S";

  //--- the id marker to actually add ---
  let idMarker = null; //default null

  //--- for what the card should be build: 1. Mid column list; 2. Seacr ---
  if (forWhat === appendPlace.MID_COL_LIST) {
    idMarker = idMarkerMCL;
    //console.log(idMarker);
  } else if (forWhat === appendPlace.SEARCH_RESULT) {
    idMarker = idMarkerSearch;
  }

  //--- if id marker is null - hard stop ---
  if (idMarker === null) {
    //console.log('idMarker is null!');
    return;
  }

  //--- STUDENT CARD: NAME AND NOTE ---
  //--- create student card and add class ---
  const card = document.createElement('div');
  if (forWhat === appendPlace.MID_COL_LIST) {
    card.classList.add('student-card');
  } else if (forWhat === appendPlace.SEARCH_RESULT) {
    card.classList.add('student-card-search');
  }
  //--- build card place holder if building for search ---
  const cardPlaceHolder = document.createElement('div');
  if (forWhat === appendPlace.SEARCH_RESULT) {
    cardPlaceHolder.classList.add('student-card-hidden');
    cardPlaceHolder.setAttribute('id', 'card-place-holder' + '_' + Search.searchCounter);
  }

  //--- get name and notes on the current studen ---
  const studentNamePara = document.createElement('p');
  const studentNotePara = document.createElement('p');
  //--- add id to name and note paragraphs ---
  studentNamePara.setAttribute('id', 'studentName');
  studentNotePara.setAttribute('id', 'studentNote');
  //--- assign name and notes ---
  studentNamePara.textContent = currentStudent.name;
  studentNotePara.textContent = currentStudent.notes;

  //--- STUDENT CARD: ROLL-OUT BAR & BUTTONS ---

  //--- create roll-out bar container ---
  const rollOutBarContainer = document.createElement('div');
  rollOutBarContainer.classList.add('rollOutBar-short');

  //--- create roll-out bar background ---
  const rollOutBarBg = document.createElement('div');
  rollOutBarBg.classList.add('rollOutBg');

  //--- ROLL-OUT BAR: BUTTONS (div) ---

  //--- FIRST BUTTON ---
  const firstButton = document.createElement('span');
  firstButton.classList.add('studentCardOptions');
  //--- paragraph for the first button ---
  const firstButtonPara = document.createElement('p');
  firstButtonPara.setAttribute('id', 'firstButtonPara' + '_' + currentStudent.id + idMarker);
  console.log(firstButtonPara);
  firstButtonPara.textContent = 'Next lesson';

  //--- SECOND BUTTON ---
  const secondButton = document.createElement('span');
  secondButton.classList.add('studentCardOptions');
  //--- paragraph for the second button ---
  const secondButtonPara = document.createElement('p');
  secondButtonPara.setAttribute('id', 'secondButtonPara' + '_' + currentStudent.id + idMarker);
  secondButtonPara.textContent = 'Add lesson';

  //--- THIRD BUTTON ---
  const thirdButton = document.createElement('span');
  thirdButton.classList.add('studentCardOptions');
  //--- paragraph for the third button ---
  const thirdButtonPara = document.createElement('p');
  thirdButtonPara.setAttribute('id', 'homeWorkPara' + '_' + currentStudent.id + idMarker);
  thirdButtonPara.textContent = 'Home work';

  //--- THREE DOTS BUTTON ---

  //--- container for the button ---
  const threeDotContainer = document.createElement('div');
  threeDotContainer.classList.add('threeDotButton');
  //--- id for the three dot button container ---
  threeDotContainer.setAttribute('id', 'threeDotContainer' + idMarker + currentStudent.id);
  const threeDotContainerId = 'threeDotContainer' + idMarker + currentStudent.id;

  //--- cofing for 'onmouseover' to work ---
  const idToPass = 'threeDotBtn' + '_' + currentStudent.id + idMarker;
  rollOutBarContainer.setAttribute('id', idToPass);
  rollOutBarContainer.setAttribute('onmouseover', `rollOutMenu('${idToPass}', '${threeDotContainerId}')`);
  rollOutBarContainer.setAttribute('onmouseleave', `rollInMenu('${idToPass}', '${threeDotContainerId}')`);

  //--- POP UP ---
  const currentStudenId = currentStudent.id + idMarker;
  console.log('current student id:', currentStudenId);
  console.log(currentStudenId[0]);
  const popUp = document.createElement('div');
  popUp.classList.add('pop_up_hidden');
  popUp.setAttribute('id', 'popUpContainer' + currentStudent.id + idMarker);
  const popUpId = 'popUp_' + currentStudent.id + idMarker;

  //--- FIRST button pop up window ---
  firstButton.setAttribute('id', 'firstBtnPopUp_' + currentStudent.id + idMarker);
  //--- call openPopUp function with two param. popUpId_n and currentStudent id. First param needed to know
  //--- what margins to set and secod is needed to know from which card the function is being called
  firstButton.setAttribute('onmouseover', `openPopUp('popUpId_1', '${currentStudenId}')`);
  firstButton.setAttribute('onmouseleave', `closePopUp('popUpId_1', '${currentStudenId}')`);

  //--- SECOND button pop up window ---
  secondButton.setAttribute('id', 'secondBtnPopUp_' + currentStudent.id + idMarker);
  secondButton.setAttribute('onmouseover', `openPopUp('popUpId_2', '${currentStudenId}')`);
  secondButton.setAttribute('onmouseleave', `closePopUp('popUpId_2', '${currentStudenId}')`);
  //--- variables for addLesson function ---
  const secondBtnId = 'secondBtnPopUp_' + currentStudent.id + idMarker;
  const popUpContainerId = 'popUpContainer' + currentStudent.id + idMarker;
  const popUpParaId = 'popUpPara' + currentStudent.id + idMarker;
  secondButton.setAttribute('onclick', `addLesson('${secondBtnId}', '${popUpContainerId}', '${popUpParaId}','${currentStudenId}')`);

  //--- THIRD button pop up window ---
  thirdButton.setAttribute('id', 'thirdBtnPopUp_' + currentStudent.id + idMarker);
  thirdButton.setAttribute('onmouseover', `openPopUp('popUpId_3', '${currentStudenId}')`);
  thirdButton.setAttribute('onmouseleave', `closePopUp('popUpId_3', '${currentStudenId}')`);

  //---paragraph for the pop up ---
  const popUpPara = document.createElement('p');
  popUpPara.setAttribute('id', 'popUpPara' + currentStudent.id + idMarker);
  popUpPara.textContent = '';

  //--- the button paragraph tag ---
  const threeDotButton = document.createElement('p');
  threeDotButton.textContent = '...';
  //--- get id for current student ---
  const studentId = currentStudent.id;
  threeDotButton.setAttribute('id', 'threeDotBtn' + '_' + studentId + idMarker);

  //console.log('right before append if');
  //console.log(whereToAppend);
  //--- Append to the page ---
  if (whereToAppend === appendPlace.MID_COL_LIST) {
    //console.log('appending to mid column');
    appendToHTML(card, studentNamePara, studentNotePara, rollOutBarContainer, threeDotContainer, threeDotButton, firstButton, firstButtonPara, secondButton, secondButtonPara, thirdButton, thirdButtonPara, popUp, popUpPara);
  } else if (whereToAppend === appendPlace.SEARCH_RESULT) {
    appendToHTMLSearch(card, cardPlaceHolder, studentNamePara, studentNotePara, rollOutBarContainer, threeDotContainer, threeDotButton, firstButton, firstButtonPara, secondButton, secondButtonPara, thirdButton, thirdButtonPara, popUp, popUpPara);
  }
}

function appendToHTML(card, studentNamePara, studentNotePara, rollOutBarContainer, threeDotContainer, threeDotButton, firstButton, firstButtonPara, secondButton, secondButtonPara, thirdButton, thirdButtonPara, popUp, popUpPara) {
  //--- append the card and the paragraph with name ---
  studentsList.appendChild(card).appendChild(studentNamePara);

  //--- append paragraph with note ---
  card.appendChild(studentNotePara);

  //--- append block for three dot button and the button itself ---
  card.appendChild(rollOutBarContainer);
  rollOutBarContainer.appendChild(threeDotContainer).appendChild(threeDotButton);
  rollOutBarContainer.appendChild(popUp).appendChild(popUpPara);
  rollOutBarContainer.appendChild(firstButton).appendChild(firstButtonPara);
  rollOutBarContainer.appendChild(secondButton).appendChild(secondButtonPara);
  rollOutBarContainer.appendChild(thirdButton).appendChild(thirdButtonPara);
}

function appendToHTMLSearch(card, cardPlaceHolder, studentNamePara, studentNotePara, rollOutBarContainer, threeDotContainer, threeDotButton, firstButton, firstButtonPara, secondButton, secondButtonPara, thirdButton, thirdButtonPara, popUp, popUpPara) {
  //--- append the card and the paragraph with name ---
  let actuallCard = card;
  let parent = null;
  //--- get the container ---
  const cardContainer = document.getElementById('search-result');

  if (Search.isFirstSearchAppend) {
    //--- place holder for the next search result ---
    cardContainer.appendChild(cardPlaceHolder);
    //--- append card with actual search result ---
    cardContainer.appendChild(actuallCard).appendChild(studentNamePara);
    Search.isFirstSearchAppend = false;
  } else {
    const counter = Search.searchCounter - 1;
    const id = 'card-place-holder' + '_' + counter;
    actuallCard = document.getElementById(id);
    actuallCard.classList.remove('student-card-hidden');
    actuallCard.classList.add('student-card-search');
    parent = actuallCard.parentNode;
    parent.insertBefore(cardPlaceHolder, actuallCard);
    actuallCard.appendChild(studentNamePara);
  }
  //--- append paragraph with note ---
  actuallCard.appendChild(studentNotePara);

  //--- append block for three dot button and the button itself ---
  actuallCard.appendChild(rollOutBarContainer);
  rollOutBarContainer.appendChild(threeDotContainer).appendChild(threeDotButton);
  rollOutBarContainer.appendChild(popUp).appendChild(popUpPara);
  rollOutBarContainer.appendChild(firstButton).appendChild(firstButtonPara);
  rollOutBarContainer.appendChild(secondButton).appendChild(secondButtonPara);
  rollOutBarContainer.appendChild(thirdButton).appendChild(thirdButtonPara);
}

//--- ROLL OUT THE MENU ---
function rollOutMenu(id, containerId) {
  const rollOutBar = document.getElementById(id);
  //rollOutBar.classList.remove('rollOutBar-short');
  rollOutBar.classList.add('rollOutBar-long');
  const button = document.getElementById(containerId);
  button.style.rotate = '90deg';
}

//--- ROLL IN THE MENU ---
function rollInMenu(id, containerId) {
  const rollIn = document.getElementById(id);
  rollIn.classList.remove('rollOutBar-long');
  //rollIn.classList.add('rollOutBar-short');
  const button = document.getElementById(containerId);
  button.style.rotate = '0deg';
}

//--- POP UP WINDOW ---
//--- id is pointing to a button that is called the function and needed to choose the right margins
//--- studentId is telling from which card the call is comming to know what pop-up container to address
function openPopUp(buttonId, studentId) {
  const elementToPopUp = document.getElementById('popUpContainer' + studentId);

  for (let i = 0; i <= 3; ++i) {
    if (buttonId === 'popUpId_1') {
      elementToPopUp.classList.add('pop_up_margin_1');
      elementToPopUp.classList.remove('pop_up_hidden');
      appendPopUpContent(buttonId, studentId);
      elementToPopUp.classList.add('pop_up');
      break;
    } else if (buttonId === 'popUpId_2') {
      elementToPopUp.classList.add('pop_up_margin_2');
      elementToPopUp.classList.remove('pop_up_hidden');
      appendPopUpContent(buttonId, studentId);
      elementToPopUp.classList.add('pop_up');
      break;
    } else if (buttonId === 'popUpId_3') {
      elementToPopUp.classList.add('pop_up_margin_3');
      elementToPopUp.classList.remove('pop_up_hidden');
      appendPopUpContent(buttonId, studentId);
      elementToPopUp.classList.add('pop_up');
      break;
    }
  }
}

function closePopUp(buttonId, studentId) {
  const elementToPopUp = document.getElementById('popUpContainer' + studentId);
  for (let i = 0; i <= 3; ++i) {
    if (buttonId === 'popUpId_1') {
      elementToPopUp.classList.remove('pop_up_margin_1');
      elementToPopUp.classList.remove('pop_up');
      elementToPopUp.classList.add('pop_up_hidden');
      break;
    } else if (buttonId === 'popUpId_2') {
      elementToPopUp.classList.remove('pop_up_margin_2');
      elementToPopUp.classList.remove('pop_up');
      elementToPopUp.classList.add('pop_up_hidden');
      break;
    } else if (buttonId === 'popUpId_3') {
      elementToPopUp.classList.remove('pop_up_margin_3');
      elementToPopUp.classList.remove('pop_up');
      elementToPopUp.classList.add('pop_up_hidden');
      break;
    }
  }
}

function appendPopUpContent(buttonId, studentId) {
  switch (buttonId) {
    //--- first button ---
    case 'popUpId_1': {
      const id = 'popUpPara' + studentId;
      const paragraphToAppend = document.getElementById(id);
      getNextLesson(studentId[0]).then((lesson) => {
        if (lesson === errorCodes.NO_DATA) {
          paragraphToAppend.textContent = 'No data';
        } else {
          paragraphToAppend.textContent = lesson.lesson_date;
        }
      });
      break;
    }
    //--- second button ---
    case 'popUpId_2': {
      const id = 'popUpPara' + studentId;
      const paragraphToAppend = document.getElementById(id);
      paragraphToAppend.textContent = 'Just click the button to add a lesson';
      break;
    }
    //--- third button ---
    case 'popUpId_3': {
      const id = 'popUpPara' + studentId;
      const paragraphToAppend = document.getElementById(id);
      getHomeWork(studentId[0]).then((lesson) => {
        if (lesson === errorCodes.NO_DATA) {
          paragraphToAppend.textContent = 'No data';
        } else {
          paragraphToAppend.textContent = lesson.homework;
        }
      });
      break;
    }
  }
}

async function getNextLesson(studentId) {
  const nextLessonContainer = await window.api.getNextLesson(studentId);
  if (nextLessonContainer === undefined) {
    return errorCodes.NO_DATA;
  } else if (nextLessonContainer.lesson_date === null) {
    return errorCodes.NO_DATA;
  } else {
    return nextLessonContainer;
  }
}

async function getHomeWork(studentId) {
  const homeWorkContainer = await window.api.getNextLesson(studentId);
  if (homeWorkContainer) {
    return homeWorkContainer;
  } else {
    return errorCodes.NO_DATA;
  }
}

function addLesson(buttonId, popUpContainerId, popUpParaId, studentId) {

  if (PopUp.isFormActive) {
    return;
  }
  //--- set form active flag ---
  PopUp.isFormActive = true;

  if (isFirstInputNextLesson(studentId)) {
    //--- set flags ---
    const studentIdNum = studentId[0];
    PopUp.isFirstInput[PopUp.postionToWrite] = studentId;
    PopUp.postionToWrite += 1;

    const button = document.getElementById(buttonId);
    button.removeAttribute('onmouseleave');

    //--- hid text paragraph ---
    const popUpContainer = document.getElementById(popUpContainerId);
    const paragraphToRemove = document.getElementById(popUpParaId);
    paragraphToRemove.classList.add('pop_up_hidden');

    //--- BUILD INPUT FORM ---

    //--- div container ---
    const inputContainer = document.createElement('div');
    inputContainer.setAttribute('id', 'inputContainer' + '_' + studentId);

    //--- wrapper for input and submit button ---
    const inputForm = document.createElement('form');
    inputForm.classList.add('inputContainer');
    inputForm.setAttribute('id', 'nextLessonForm' + '_' + studentId);

    //--- input field date ---
    const inputInputDate = document.createElement('input');
    inputInputDate.classList.add('addLessonForm');
    inputInputDate.setAttribute('placeholder', 'Enter next lesson date');
    inputInputDate.setAttribute('id', 'inputFieldDate' + '_' + studentId);
    inputInputDate.setAttribute('type', 'date');

    //--- submit button ---
    const inputSubmitBtn = document.createElement('button');
    inputSubmitBtn.classList.add('nextLessonSubmitBtn');
    inputSubmitBtn.textContent = 'Submit';

    //--- APPEND TO THE POP UP CONTAINER ---
    popUpContainer.appendChild(inputContainer).appendChild(inputForm);
    inputForm.appendChild(inputInputDate);
    inputForm.appendChild(inputSubmitBtn);

    //--- SET EVENT LISTENER | set event listener for the form (inputForm) ---
    const formId = 'nextLessonForm' + '_' + studentId;
    const inputDateId = 'inputFieldDate' + '_' + studentId;
    const studentIdDb = studentId[0];
    //console.log('calling setPopUpEventListener from if=true');
    // if (!PopUp.eventListener) {
    setPopUpEventListener(formId, inputDateId, studentId, inputContainer, paragraphToRemove, buttonId);
    //}
  } else if (!isFirstInputNextLesson(studentId)) {
    //--- unhide input container ---
    const inputContainerId = 'inputContainer' + '_' + studentId;
    const inputContainer = document.getElementById(inputContainerId);
    inputContainer.classList.remove('hidden_container');

    //--- remove hiding onmouseleave event ---
    const button = document.getElementById(buttonId);
    button.removeAttribute('onmouseleave');

    //--- hide text paragraph ---
    const paragraphToRemove = document.getElementById(popUpParaId);
    paragraphToRemove.classList.add('pop_up_hidden');

    //--- reset input field text ---
    const inputFieldDateId = 'inputFieldDate' + '_' + studentId;
    const inputFieldDate = document.getElementById(inputFieldDateId).value;
    document.getElementById(inputFieldDateId).value = '';
    console.log('reseted input field');

    //--- SET EVENT LISTENER | set event listener for the form (inputForm) ---
    const formId = 'nextLessonForm' + '_' + studentId;
    const inputDateId = 'inputFieldDate' + '_' + studentId;
    const studentIdDb = studentId[0];
  }


}

function isFirstInputNextLesson(studentId) {
  let isTrue = false;
  for (const i of PopUp.isFirstInput) {
    if (i === studentId) {
      isTrue = false;
    } else {
      isTrue = true;
    }
  }
  return isTrue;
}

function toIso(date) {
  const [y, m, d] = date.split('-');
  const year = y.length === 2 ? 20 + y : y;
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function processNextLessonInput(inputDateId, studentId, inputContainer, paragraphToRemove, buttonId) {
  //--- hid input form ---
  const inputContainerId = 'inputContainer' + '_' + studentId;
  document.getElementById(inputContainerId).classList.add('hidden_container');
  //--- unhid text paragraph ---
  paragraphToRemove.classList.remove('pop_up_hidden');
  //--- add onmouseleave event ---
  document.getElementById(buttonId).setAttribute('onmouseleave', `closePopUp('popUpId_2', '${studentId}')`);

  const nextLessonDate = document.getElementById(inputDateId).value;
  const nextLessonDateIso = toIso(nextLessonDate);
  const studentIdNum = studentId[0];
  addNextLesson(studentIdNum, nextLessonDateIso);

}

async function getLessons(studentId) {
  const lessons = await window.api.getLessonsForStudent(studentId);
  return lessons;
}

async function checkIfLessonDateIsInDB(studentId, nextLessonDate) {
  const lessons = await getLessons(studentId);
  for (const i of lessons) {
    if (i.lesson_date === nextLessonDate) {
      return true;
    }
  }
  return false;
}

async function addNextLesson(studentId, nextLessoDate) {
  if (await checkIfLessonDateIsInDB(studentId, nextLessoDate) === false) {
    await window.api.addLesson({
      student_id: studentId,
      lesson_date: nextLessoDate,
      homework: 'You are lucky, no homework'
    });
  }
}

//--- SEARCH STUDENT BY NAME ---
function searchByName() {
  //--- check if first search ---
  if (Search.isFirstSearch) {
    //--- get the input ---
    const studentToSearch = document.getElementById("search-bar").value;
    const caseInsensitive = studentToSearch.trim().toLowerCase();

    //--- get the list of students for db ---
    getListOfStudents().then((list) => {
      //--- check if input matches a name from db ---
      for (const i of list) {
        //--- split the name by space ---
        const currentName = i.name.split(' ');
        //--- either name or surname matches - build a card. Do it as many times as matches (names might repeat) ---
        if (currentName[0].toLowerCase() === caseInsensitive || currentName[1].toLowerCase() === caseInsensitive) {
          buildCard(i, appendPlace.SEARCH_RESULT, appendPlace.SEARCH_RESULT);
          //--- remember the name to not show it twice ---
          reamemberThisSearch(caseInsensitive, i.name);
        }
      }
    });
    //--- flip isFirstSearch flag ---
    Search.isFirstSearch = false;
  } else {
    //--- get the input ---
    const studentToSearch = document.getElementById("search-bar").value;
    const caseInsensitive = studentToSearch.trim().toLowerCase();


    //--- get the list of students for db ---
    getListOfStudents().then((list) => {
      //--- check if input matches a name from db ---
      for (const i of list) {
        //--- check if there is a card for this one ---
        if (!isThereCard(i.name)) {
          //--- split the name by space ---
          const currentName = i.name.split(' ');
          //--- either name or surname matches - build a card. Do it as many times as matches (names might repeat) ---
          if (currentName[0].toLowerCase() === caseInsensitive || currentName[1].toLowerCase() === caseInsensitive) {
            buildCard(i, appendPlace.SEARCH_RESULT, appendPlace.SEARCH_RESULT);
            //--- remember the name to not show it twice ---
            reamemberThisSearch(caseInsensitive, i.name);
          }
        }
      }
    });
  }
  showSearchResult();
  ++Search.searchCounter;
}

function showSearchResult() {
  //--- make the search box visible ---
  const searchBox = document.getElementById('search-result');
  searchBox.classList.remove('search-box-hidden');
  searchBox.classList.add('search-box');
  Search.isVisible = true;
}

function shrinkSearResult() {
  //--- shrink the search result ---
  const searchBox = document.getElementById('search-result');
  searchBox.classList.remove('expandSearchBox');
  searchBox.classList.add('shrinkSearchBox');
}

function expandSearchResult() {
  //--- enlarge the search result ---
  const searchBox = document.getElementById('search-result');
  searchBox.classList.add('expandSearchBox');
  searchBox.classList.remove('shrinkSearchBox');
}

function isThereCard(name) {
  if (name.toLowerCase() === Search.lastSearch) {
    return true;
  } else {
    return false;
  }
}

function reamemberThisSearch(searchedName, name) {
  //--- check if it's first or second name ---
  const splitedName = name.split(' ');
  if (splitedName[0].toLowerCase() === searchedName) {
    Search.lastSearch = name.toLowerCase();
    Search.lastSearchFName = true;
    Search.lastSearchSName = false;
  } else if (splitedName[1].toLowerCase() === searchedName) {
    Search.lastSearch = name.toLowerCase();
    Search.lastSearchSName = true;
    Search.lastSearchFName = false;
  }
}


//--- CALENDAR ---
//--- call calendar renderer ---
function callRenderCalendar() {
  const year = 0;
  const month = 1;
  const date = currentMonthAndYear();
  renderCalendar(date[year], date[month]);
}

function transitFnt(id) {
  calendarPopUpOn(id);
}

//--- show pop-up in calendar ---
function calendarPopUpOn(id) {
  calendarPopUp(id);
}

//--- get current year and month ---
function currentMonthAndYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() - 1;

  const yearAndMonth = [year, month];

  return yearAndMonth;

}

function renderCalendar(year, month) {
  //--- use querySelector to explicitly query the DOM node ---
  const container = document.querySelector('#calendarContainer');

  //--- guard check: ensure the element was found ---
  if (!container) {
    console.error("Calendar container '#calendar' was not found in the DOM.");
    return;
  }

  //--- clear previous grid ---
  container.innerHTML = '';

  //--- 1. calculate offset (0 = sunday, 1 = monday, etc.) ---
  const firstDayOfWeek = new Date(year, month, daysOfWeek.MONDAY).getDay();

  //--- 2. calculate total days in target month ---
  const totalDays = new Date(year, month - 1, daysOfWeek.SUNDAY).getDate();

  //--- 2.1. current day ---
  const currentDay = new Date();


  //--- 3. render empty padding cells ---
  for (let i = 0; i < firstDayOfWeek; ++i) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day-cell', 'empty-cell');
    container.appendChild(emptyCell);
  }

  let checkDay = new Date().getDate();

  const date = new Date();

  let yyy = date.getFullYear();
  let mm = String(date.getMonth() + 1).padStart(2, 0);
  let dd = String(date.getDate()).padStart(2, 0);

  let fullDateToday = yyy + "-" + mm + "-";

  console.log(fullDateToday + "The full date of today");

  //--- 4. render actual calendar days ---
  for (let day = 1; day <= totalDays; ++day) {
    const dayCell = document.createElement('div');
    const popUpCell = document.createElement('div');
    const popUpCellSpan = document.createElement('span');

    if (day === checkDay) {
      popUpCell.classList.add('popup');
      popUpCellSpan.classList.add('popuptext');

      dayCell.classList.add('current-day-cell');

      dayCell.setAttribute('id', day);
      popUpCellSpan.setAttribute('id', day + 'p');
      dayCell.setAttribute('onclick', `calendarPopUpOn(${day})`);
    } else {
      popUpCell.classList.add('popup');
      popUpCellSpan.classList.add('popuptext');
      popUpCellSpan.setAttribute('id', day + 'p');

      dayCell.classList.add('day-cell');

      dayCell.setAttribute('id', day);
      dayCell.setAttribute('onclick', `calendarPopUpOn(${day})`);
    }

    const popUpContent = processStudentsAndLessons(fullDateToday, day).then((names) => {
      popUpCellSpan.textContent = names.length === 0 ? "Free time" : names.join(", ");
    })
      .catch((err) => console.error(err));
    //popUpCellSpan.textContent = popUpContent;
    dayCell.textContent = day;
    container.appendChild(dayCell).appendChild(popUpCell).appendChild(popUpCellSpan);
  }


}

async function processStudentsAndLessons(date, day) {
  //--- assemble the date ---
  date += String(day).padStart(2, "0");

  //--- array for student's names who has a lesson on the date ---
  let hasLesson = [];

  //--- get list of students ---
  const students = await getListOfStudents();

  for (const student of students) {
    const lessons = await getLessons(student.id);
    if (lessons.some((lesson) => lesson.lesson_date === date)) {
      hasLesson.push(student.name);
    }
  }
  //--- return array with names of students that are schedule to have a lesson the date ---
  return hasLesson;
}

function calendarPopUp(id) {
  if (!Calendar.isPopUpOn) {
    let popup = document.getElementById(id + 'p');
    popup.classList.add("show");
    Calendar.isPopUpOn = true;
  } else {
    let popup = document.getElementById(id + 'p');
    popup.classList.remove("show");
    Calendar.isPopUpOn = false;
  }
}

//--- call execOrder ---
execOrder();