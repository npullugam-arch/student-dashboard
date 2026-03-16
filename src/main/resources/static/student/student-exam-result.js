console.log("✅ student-exam-result.js loaded");

const examSelect =
document.getElementById("stuExamSelect");

const tbody =
document.getElementById("stuResultBody");

const emptyBox =
document.getElementById("emptyBox");

const studentId =
sessionStorage.getItem("studentId");


async function apiGet(url){

const res = await fetch(url);

if(!res.ok)
throw new Error("Failed to load");

return res.json();

}


function getGradeClass(percent){

if(percent>=75) return "good";
if(percent>=40) return "avg";
return "bad";

}


async function loadExams(){

try{

const exams =
await apiGet("/student/api/exams");

examSelect.innerHTML=
`<option value="">Select Exam</option>`;

exams.forEach(e=>{

examSelect.innerHTML+=
`<option value="${e.id}">
${e.examName}
</option>`;

});

}catch(e){

examSelect.innerHTML=
`<option>Error loading exams</option>`;

}

}


async function loadResults(){

const examId =
examSelect.value;

if(!examId){

tbody.innerHTML="";
emptyBox.style.display="block";
return;

}

try{

const rows =
await apiGet(
`/student/api/exam-results/${examId}/${studentId}`
);

tbody.innerHTML="";

if(!rows.length){

emptyBox.style.display="block";
return;

}

emptyBox.style.display="none";


rows.forEach(r=>{

const percent =
((r.marksObtained/r.totalMarks)*100)
.toFixed(1);

const tr=document.createElement("tr");

tr.innerHTML=
`
<td>${r.subjectName}</td>

<td>${r.marksObtained}</td>

<td>${r.totalMarks}</td>

<td class="${getGradeClass(percent)}">
${percent}%
</td>
`;

tbody.appendChild(tr);

});

}catch(e){

tbody.innerHTML="";
emptyBox.style.display="block";

}

}


examSelect.onchange=loadResults;


loadExams();
