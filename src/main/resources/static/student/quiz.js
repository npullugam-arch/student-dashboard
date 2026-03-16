// Educational Quiz Questions Database
const quizDatabase = {
    math: [{
            question: "What is the value of π (pi) approximately?",
            options: ["3.14159", "2.71828", "1.61803", "4.66920"],
            correct: 0,
            explanation: "π (pi) is approximately 3.14159, the ratio of a circle's circumference to its diameter."
        },
        {
            question: "If x + 5 = 12, what is the value of x?",
            options: ["5", "7", "17", "12"],
            correct: 1,
            explanation: "x = 12 - 5 = 7"
        },
        {
            question: "What is 25% of 200?",
            options: ["25", "50", "75", "100"],
            correct: 1,
            explanation: "25% of 200 = (25/100) × 200 = 50"
        },
        {
            question: "What is the square root of 144?",
            options: ["10", "11", "12", "13"],
            correct: 2,
            explanation: "√144 = 12, because 12 × 12 = 144"
        },
        {
            question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
            options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"],
            correct: 2,
            explanation: "Area = length × width = 8 × 5 = 40 cm²"
        },
        {
            question: "What is 7 × 8?",
            options: ["54", "56", "63", "64"],
            correct: 1,
            explanation: "7 × 8 = 56"
        },
        {
            question: "What is the next prime number after 7?",
            options: ["8", "9", "10", "11"],
            correct: 3,
            explanation: "11 is the next prime number after 7 (only divisible by 1 and itself)"
        },
        {
            question: "If a triangle has angles 60°, 60°, and 60°, what type of triangle is it?",
            options: ["Scalene", "Isosceles", "Equilateral", "Right-angled"],
            correct: 2,
            explanation: "A triangle with all angles equal (60°) is an equilateral triangle"
        },
        {
            question: "What is 3/4 + 1/4?",
            options: ["4/8", "4/4", "1/2", "2/4"],
            correct: 1,
            explanation: "3/4 + 1/4 = 4/4 = 1"
        },
        {
            question: "What is 15² (15 squared)?",
            options: ["30", "125", "225", "250"],
            correct: 2,
            explanation: "15² = 15 × 15 = 225"
        }
    ],
    science: [{
            question: "What is the chemical symbol for water?",
            options: ["H2O", "CO2", "O2", "H2SO4"],
            correct: 0,
            explanation: "Water is H2O - two hydrogen atoms and one oxygen atom"
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correct: 1,
            explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface"
        },
        {
            question: "What is the process by which plants make their food?",
            options: ["Respiration", "Digestion", "Photosynthesis", "Transpiration"],
            correct: 2,
            explanation: "Photosynthesis is the process where plants use sunlight to make food from CO2 and water"
        },
        {
            question: "How many bones are in the adult human body?",
            options: ["186", "206", "226", "246"],
            correct: 1,
            explanation: "An adult human body has 206 bones"
        },
        {
            question: "What gas do plants absorb from the atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
            correct: 2,
            explanation: "Plants absorb carbon dioxide (CO2) during photosynthesis"
        },
        {
            question: "What is the smallest unit of life?",
            options: ["Atom", "Molecule", "Cell", "Organ"],
            correct: 2,
            explanation: "The cell is the smallest unit of life"
        },
        {
            question: "What is the speed of light?",
            options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
            correct: 0,
            explanation: "Light travels at approximately 300,000 kilometers per second"
        },
        {
            question: "Which organ pumps blood throughout the body?",
            options: ["Brain", "Lungs", "Heart", "Liver"],
            correct: 2,
            explanation: "The heart pumps blood throughout the body"
        },
        {
            question: "What is the main gas in Earth's atmosphere?",
            options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            correct: 2,
            explanation: "Nitrogen makes up about 78% of Earth's atmosphere"
        },
        {
            question: "What force keeps us on the ground?",
            options: ["Magnetism", "Gravity", "Friction", "Pressure"],
            correct: 1,
            explanation: "Gravity is the force that keeps us on the ground"
        }
    ],
    history: [{
            question: "Who was the first President of the United States?",
            options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
            correct: 1,
            explanation: "George Washington was the first President (1789-1797)"
        },
        {
            question: "In which year did World War II end?",
            options: ["1943", "1944", "1945", "1946"],
            correct: 2,
            explanation: "World War II ended in 1945"
        },
        {
            question: "Who discovered America in 1492?",
            options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "Marco Polo"],
            correct: 1,
            explanation: "Christopher Columbus reached the Americas in 1492"
        },
        {
            question: "The Great Wall of China was built primarily to protect against which group?",
            options: ["Mongols", "Romans", "Persians", "Vikings"],
            correct: 0,
            explanation: "The Great Wall was built mainly to protect against Mongol invasions"
        },
        {
            question: "Who was known as the 'Iron Lady'?",
            options: ["Indira Gandhi", "Margaret Thatcher", "Golda Meir", "Angela Merkel"],
            correct: 1,
            explanation: "Margaret Thatcher, British Prime Minister, was called the Iron Lady"
        },
        {
            question: "In which year did India gain independence?",
            options: ["1945", "1946", "1947", "1948"],
            correct: 2,
            explanation: "India gained independence from British rule on August 15, 1947"
        },
        {
            question: "Who wrote the Declaration of Independence?",
            options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"],
            correct: 2,
            explanation: "Thomas Jefferson was the primary author of the Declaration of Independence"
        },
        {
            question: "Which ancient civilization built the pyramids?",
            options: ["Romans", "Greeks", "Egyptians", "Mayans"],
            correct: 2,
            explanation: "The ancient Egyptians built the pyramids, including the Great Pyramid of Giza"
        },
        {
            question: "Who was the first man to walk on the moon?",
            options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"],
            correct: 1,
            explanation: "Neil Armstrong was the first person to walk on the moon in 1969"
        },
        {
            question: "The Renaissance began in which country?",
            options: ["France", "England", "Italy", "Spain"],
            correct: 2,
            explanation: "The Renaissance began in Italy in the 14th century"
        }
    ],
    geography: [{
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correct: 2,
            explanation: "Paris is the capital and largest city of France"
        },
        {
            question: "Which is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            correct: 3,
            explanation: "The Pacific Ocean is the largest and deepest ocean"
        },
        {
            question: "Which is the longest river in the world?",
            options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
            correct: 1,
            explanation: "The Nile River in Africa is considered the longest river at 6,650 km"
        },
        {
            question: "Mount Everest is located in which mountain range?",
            options: ["Alps", "Andes", "Himalayas", "Rockies"],
            correct: 2,
            explanation: "Mount Everest, the world's highest peak, is in the Himalayas"
        },
        {
            question: "What is the smallest continent?",
            options: ["Europe", "Australia", "Antarctica", "South America"],
            correct: 1,
            explanation: "Australia is the smallest continent"
        },
        {
            question: "Which desert is the largest in the world?",
            options: ["Sahara", "Arabian", "Gobi", "Antarctic"],
            correct: 3,
            explanation: "Antarctica is technically the largest desert (a cold desert)"
        },
        {
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            correct: 2,
            explanation: "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, South America"
        },
        {
            question: "Which country has the largest population?",
            options: ["India", "USA", "China", "Indonesia"],
            correct: 0,
            explanation: "As of 2023, India has surpassed China as the most populous country"
        },
        {
            question: "What is the capital of Japan?",
            options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
            correct: 2,
            explanation: "Tokyo is the capital of Japan"
        },
        {
            question: "The Amazon Rainforest is primarily located in which country?",
            options: ["Peru", "Colombia", "Brazil", "Venezuela"],
            correct: 2,
            explanation: "About 60% of the Amazon Rainforest is in Brazil"
        }
    ],
    english: [{
            question: "What is the plural of 'child'?",
            options: ["Childs", "Children", "Childes", "Childrens"],
            correct: 1,
            explanation: "The correct plural form of 'child' is 'children'"
        },
        {
            question: "Which word is a synonym for 'happy'?",
            options: ["Sad", "Joyful", "Angry", "Tired"],
            correct: 1,
            explanation: "'Joyful' is a synonym (similar meaning) for 'happy'"
        },
        {
            question: "What is the past tense of 'run'?",
            options: ["Runned", "Run", "Ran", "Running"],
            correct: 2,
            explanation: "The past tense of 'run' is 'ran'"
        },
        {
            question: "Which is the correct spelling?",
            options: ["Recieve", "Receive", "Recive", "Receeve"],
            correct: 1,
            explanation: "The correct spelling is 'receive' (i before e except after c)"
        },
        {
            question: "What type of word is 'quickly'?",
            options: ["Noun", "Verb", "Adjective", "Adverb"],
            correct: 3,
            explanation: "'Quickly' is an adverb, describing how an action is performed"
        },
        {
            question: "What is the opposite of 'difficult'?",
            options: ["Hard", "Easy", "Complex", "Tough"],
            correct: 1,
            explanation: "'Easy' is the antonym (opposite) of 'difficult'"
        },
        {
            question: "Which sentence is grammatically correct?",
            options: ["She don't like pizza", "She doesn't likes pizza", "She doesn't like pizza", "She don't likes pizza"],
            correct: 2,
            explanation: "'She doesn't like pizza' is grammatically correct"
        },
        {
            question: "What is a group of words that contains a subject and predicate called?",
            options: ["Phrase", "Clause", "Paragraph", "Word"],
            correct: 1,
            explanation: "A clause contains both a subject and a predicate"
        },
        {
            question: "Which punctuation mark shows possession?",
            options: ["Period (.)", "Comma (,)", "Apostrophe (')", "Semicolon (;)"],
            correct: 2,
            explanation: "An apostrophe (') shows possession, as in 'John's book'"
        },
        {
            question: "What do you call a word that sounds like what it means?",
            options: ["Metaphor", "Simile", "Onomatopoeia", "Alliteration"],
            correct: 2,
            explanation: "Onomatopoeia is when a word sounds like its meaning (e.g., 'buzz', 'crash')"
        }
    ],
    gk: [{
            question: "How many colors are in a rainbow?",
            options: ["5", "6", "7", "8"],
            correct: 2,
            explanation: "A rainbow has 7 colors: Red, Orange, Yellow, Green, Blue, Indigo, Violet"
        },
        {
            question: "What is the national animal of India?",
            options: ["Lion", "Tiger", "Elephant", "Peacock"],
            correct: 1,
            explanation: "The Bengal Tiger is the national animal of India"
        },
        {
            question: "How many days are there in a leap year?",
            options: ["364", "365", "366", "367"],
            correct: 2,
            explanation: "A leap year has 366 days (February has 29 days)"
        },
        {
            question: "Who invented the telephone?",
            options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Benjamin Franklin"],
            correct: 1,
            explanation: "Alexander Graham Bell invented the telephone in 1876"
        },
        {
            question: "What is the largest mammal in the world?",
            options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
            correct: 1,
            explanation: "The Blue Whale is the largest mammal, growing up to 100 feet long"
        },
        {
            question: "How many sides does a hexagon have?",
            options: ["5", "6", "7", "8"],
            correct: 1,
            explanation: "A hexagon has 6 sides"
        },
        {
            question: "What is the capital of Australia?",
            options: ["Sydney", "Melbourne", "Canberra", "Perth"],
            correct: 2,
            explanation: "Canberra is the capital of Australia (not Sydney!)"
        },
        {
            question: "Which vitamin is produced when skin is exposed to sunlight?",
            options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
            correct: 2,
            explanation: "Vitamin D is produced when skin is exposed to sunlight"
        },
        {
            question: "What is the currency of Japan?",
            options: ["Yuan", "Won", "Yen", "Dollar"],
            correct: 2,
            explanation: "The Yen is the currency of Japan"
        },
        {
            question: "Which planet is closest to the Sun?",
            options: ["Venus", "Earth", "Mercury", "Mars"],
            correct: 2,
            explanation: "Mercury is the closest planet to the Sun"
        }
    ],
    physics: [{
            question: "What is the SI unit of force?",
            options: ["Joule", "Newton", "Watt", "Pascal"],
            correct: 1,
            explanation: "The Newton (N) is the SI unit of force"
        },
        {
            question: "What is the acceleration due to gravity on Earth?",
            options: ["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"],
            correct: 1,
            explanation: "The acceleration due to gravity on Earth is approximately 9.8 m/s²"
        },
        {
            question: "What type of energy does a moving object have?",
            options: ["Potential Energy", "Kinetic Energy", "Chemical Energy", "Nuclear Energy"],
            correct: 1,
            explanation: "A moving object has kinetic energy"
        },
        {
            question: "What is the formula for calculating speed?",
            options: ["Distance ÷ Time", "Time ÷ Distance", "Distance × Time", "Force × Distance"],
            correct: 0,
            explanation: "Speed = Distance ÷ Time"
        },
        {
            question: "What does Newton's First Law state?",
            options: ["F = ma", "Every action has an equal reaction", "An object at rest stays at rest", "Energy cannot be created"],
            correct: 2,
            explanation: "Newton's First Law: An object at rest stays at rest unless acted upon by a force"
        },
        {
            question: "What is the unit of electric current?",
            options: ["Volt", "Ampere", "Ohm", "Watt"],
            correct: 1,
            explanation: "The Ampere (A) is the unit of electric current"
        },
        {
            question: "What travels faster than anything else in the universe?",
            options: ["Sound", "Light", "Radio waves", "Electricity"],
            correct: 1,
            explanation: "Light travels faster than anything else in the universe"
        },
        {
            question: "What is the principle behind a lever?",
            options: ["Conservation of energy", "Mechanical advantage", "Electromagnetic induction", "Gravitational force"],
            correct: 1,
            explanation: "Levers work on the principle of mechanical advantage"
        },
        {
            question: "What type of energy is stored in a stretched spring?",
            options: ["Kinetic", "Potential", "Thermal", "Chemical"],
            correct: 1,
            explanation: "A stretched spring stores elastic potential energy"
        },
        {
            question: "What is the unit of power?",
            options: ["Joule", "Newton", "Watt", "Pascal"],
            correct: 2,
            explanation: "The Watt (W) is the unit of power"
        }
    ],
    chemistry: [{
            question: "What is the chemical symbol for gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            correct: 2,
            explanation: "Au is the chemical symbol for gold (from Latin 'Aurum')"
        },
        {
            question: "What is the pH value of pure water?",
            options: ["6", "7", "8", "9"],
            correct: 1,
            explanation: "Pure water has a pH of 7, which is neutral"
        },
        {
            question: "What is the most abundant element in the universe?",
            options: ["Oxygen", "Carbon", "Hydrogen", "Nitrogen"],
            correct: 2,
            explanation: "Hydrogen is the most abundant element in the universe"
        },
        {
            question: "What is the molecular formula of table salt?",
            options: ["NaCl", "KCl", "CaCO3", "NaOH"],
            correct: 0,
            explanation: "Table salt is Sodium Chloride (NaCl)"
        },
        {
            question: "Which gas is released when acids react with metals?",
            options: ["Oxygen", "Nitrogen", "Hydrogen", "Carbon dioxide"],
            correct: 2,
            explanation: "Hydrogen gas is released when acids react with metals"
        },
        {
            question: "What is the atomic number of carbon?",
            options: ["4", "6", "8", "12"],
            correct: 1,
            explanation: "Carbon has an atomic number of 6"
        },
        {
            question: "What type of bond forms when electrons are shared?",
            options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
            correct: 1,
            explanation: "A covalent bond forms when atoms share electrons"
        },
        {
            question: "What is the common name for H2SO4?",
            options: ["Hydrochloric acid", "Nitric acid", "Sulfuric acid", "Acetic acid"],
            correct: 2,
            explanation: "H2SO4 is Sulfuric acid"
        },
        {
            question: "Which noble gas is used in light bulbs?",
            options: ["Helium", "Neon", "Argon", "Krypton"],
            correct: 2,
            explanation: "Argon is commonly used to fill incandescent light bulbs"
        },
        {
            question: "What is the process of a solid turning directly into gas called?",
            options: ["Melting", "Evaporation", "Sublimation", "Condensation"],
            correct: 2,
            explanation: "Sublimation is when a solid turns directly into gas (like dry ice)"
        }
    ],
    computer: [{
            question: "What does CPU stand for?",
            options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"],
            correct: 0,
            explanation: "CPU stands for Central Processing Unit, the brain of the computer"
        },
        {
            question: "What does 'WWW' stand for?",
            options: ["World Wide Web", "World Web Wide", "Web World Wide", "Wide World Web"],
            correct: 0,
            explanation: "WWW stands for World Wide Web"
        },
        {
            question: "Which programming language is known as the 'language of the web'?",
            options: ["Python", "Java", "JavaScript", "C++"],
            correct: 2,
            explanation: "JavaScript is known as the language of the web"
        },
        {
            question: "What is the binary equivalent of decimal 8?",
            options: ["1000", "1001", "1010", "1100"],
            correct: 0,
            explanation: "The binary representation of 8 is 1000"
        },
        {
            question: "What does RAM stand for?",
            options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"],
            correct: 1,
            explanation: "RAM stands for Random Access Memory"
        },
        {
            question: "Which company developed the Windows operating system?",
            options: ["Apple", "IBM", "Microsoft", "Google"],
            correct: 2,
            explanation: "Microsoft developed the Windows operating system"
        },
        {
            question: "What is the main function of an operating system?",
            options: ["Browse the internet", "Manage computer hardware", "Create documents", "Play games"],
            correct: 1,
            explanation: "An operating system manages computer hardware and software resources"
        },
        {
            question: "What does HTML stand for?",
            options: ["Hyperlinks and Text Markup Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks Text Making Language"],
            correct: 1,
            explanation: "HTML stands for HyperText Markup Language"
        },
        {
            question: "Which of these is an input device?",
            options: ["Monitor", "Printer", "Keyboard", "Speaker"],
            correct: 2,
            explanation: "A keyboard is an input device used to enter data"
        },
        {
            question: "What is 1024 megabytes equal to?",
            options: ["1 Kilobyte", "1 Gigabyte", "1 Terabyte", "1 Petabyte"],
            correct: 1,
            explanation: "1024 megabytes = 1 Gigabyte (GB)"
        }
    ],
    // NEW SPORTS QUIZ
    sports: [{
            question: "How many players are on a soccer/football team?",
            options: ["9", "10", "11", "12"],
            correct: 2,
            explanation: "A soccer team has 11 players on the field"
        },
        {
            question: "In which sport would you perform a slam dunk?",
            options: ["Football", "Basketball", "Tennis", "Baseball"],
            correct: 1,
            explanation: "A slam dunk is performed in basketball"
        },
        {
            question: "How many rings are in the Olympic symbol?",
            options: ["4", "5", "6", "7"],
            correct: 1,
            explanation: "The Olympic symbol has 5 interlocking rings"
        },
        {
            question: "What is the maximum score in a single frame of bowling?",
            options: ["10", "20", "30", "100"],
            correct: 2,
            explanation: "The maximum score in one frame of bowling is 30 (strike followed by two more strikes)"
        },
        {
            question: "In tennis, what is a score of zero called?",
            options: ["Nil", "Nothing", "Love", "Zero"],
            correct: 2,
            explanation: "In tennis, a score of zero is called 'love'"
        },
        {
            question: "How many bases are there on a baseball field?",
            options: ["2", "3", "4", "5"],
            correct: 2,
            explanation: "There are 4 bases in baseball: 1st, 2nd, 3rd, and home plate"
        },
        {
            question: "Which country hosted the 2016 Summer Olympics?",
            options: ["China", "UK", "Brazil", "Japan"],
            correct: 2,
            explanation: "Brazil (Rio de Janeiro) hosted the 2016 Summer Olympics"
        },
        {
            question: "What sport is played at Wimbledon?",
            options: ["Cricket", "Soccer", "Tennis", "Golf"],
            correct: 2,
            explanation: "Wimbledon is a prestigious tennis tournament"
        },
        {
            question: "How many points is a touchdown worth in American football?",
            options: ["3", "6", "7", "8"],
            correct: 1,
            explanation: "A touchdown is worth 6 points (extra point makes it 7)"
        },
        {
            question: "What color card does a referee show for a serious foul in soccer?",
            options: ["Yellow", "Red", "Green", "Blue"],
            correct: 1,
            explanation: "A red card is shown for serious fouls and results in ejection"
        }
    ]
};

let currentSubject = '';
let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;

function openQuiz(subject) {
    currentSubject = subject;
    currentQuestionIndex = 0;
    score = 0;
    questionAnswered = false;

    const subjectNames = {
        math: 'Mathematics Quiz',
        science: 'Science Quiz',
        history: 'History Quiz',
        geography: 'Geography Quiz',
        english: 'English Quiz',
        gk: 'General Knowledge Quiz',
        physics: 'Physics Quiz',
        chemistry: 'Chemistry Quiz',
        computer: 'Computer Science Quiz',
        sports: 'Sports Quiz' // NEW
    };

    document.getElementById('quizTitle').textContent = subjectNames[subject];
    document.getElementById('educationalQuizModal').style.display = 'flex';
    loadQuestion();
}

function loadQuestion() {
    const questions = quizDatabase[currentSubject];
    const question = questions[currentQuestionIndex];
    questionAnswered = false;

    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('currentScore').textContent = score;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    document.getElementById('eduQuizQuestion').textContent = question.question;

    const optionsContainer = document.getElementById('eduQuizOptions');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(optionDiv);
    });
}

function checkAnswer(selectedIndex) {
    if (questionAnswered) return;

    questionAnswered = true;
    const questions = quizDatabase[currentSubject];
    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach(option => option.classList.add('disabled'));

    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        score += 10;
        document.getElementById('currentScore').textContent = score;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[question.correct].classList.add('correct');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

function showResults() {
    closeModal('educationalQuizModal');

    const totalQuestions = quizDatabase[currentSubject].length;
    const percentage = (score / (totalQuestions * 10)) * 100;

    let emoji, message;

    if (percentage >= 90) {
        emoji = '🏆';
        message = 'Outstanding! You are a genius!';
    } else if (percentage >= 70) {
        emoji = '🌟';
        message = 'Excellent work! Keep it up!';
    } else if (percentage >= 50) {
        emoji = '👍';
        message = 'Good job! Practice makes perfect!';
    } else {
        emoji = '📚';
        message = 'Keep studying! You will improve!';
    }

    document.getElementById('resultEmoji').textContent = emoji;
    document.getElementById('finalScore').textContent = `Score: ${score}/${totalQuestions * 10}`;
    document.getElementById('resultMessage').textContent = message;
    document.getElementById('resultModal').style.display = 'flex';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';

    if (modalId === 'memoryModal') {
        initMemoryGame();
    } else if (modalId === 'wordScrambleModal') {
        initWordScramble();
    } else if (modalId === 'numberPuzzleModal') {
        initNumberPuzzle();
    } else if (modalId === 'simonSaysModal') {
        // Simon Says will start when user clicks "Start Game"
    } else if (modalId === 'diaryModal') {
        loadDiaryEntries();
    } else if (modalId === 'jokeModal') {
        getNewJoke();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Memory Game
const emojis = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺'];
let memoryCards = [];
let flippedCards = [];
let moves = 0;
let matches = 0;

function initMemoryGame() {
    memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    moves = 0;
    matches = 0;
    flippedCards = [];

    document.getElementById('moves').textContent = moves;
    document.getElementById('matches').textContent = matches;

    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.innerHTML = '❓';
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        card.innerHTML = card.dataset.emoji;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('moves').textContent = moves;
            setTimeout(checkMatch, 500);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        matches++;
        document.getElementById('matches').textContent = matches;
        flippedCards = [];

        if (matches === emojis.length) {
            setTimeout(() => {
                alert(`🎊 Congratulations! You won in ${moves} moves!`);
            }, 300);
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.innerHTML = '❓';
        card2.innerHTML = '❓';
        flippedCards = [];
    }
}

function resetMemoryGame() {
    initMemoryGame();
}

// Word Scramble Game
const wordList = [{
        word: 'ELEPHANT',
        hint: 'Large animal with trunk'
    },
    {
        word: 'RAINBOW',
        hint: 'Colorful arc in the sky'
    },
    {
        word: 'COMPUTER',
        hint: 'Electronic device'
    },
    {
        word: 'MOUNTAIN',
        hint: 'Very high hill'
    },
    {
        word: 'BUTTERFLY',
        hint: 'Insect with colorful wings'
    },
    {
        word: 'PIZZA',
        hint: 'Italian food'
    },
    {
        word: 'CHOCOLATE',
        hint: 'Sweet brown treat'
    },
    {
        word: 'DINOSAUR',
        hint: 'Extinct reptile'
    },
    {
        word: 'GUITAR',
        hint: 'Musical instrument with strings'
    },
    {
        word: 'VOLCANO',
        hint: 'Mountain that erupts'
    }
];

let currentWord = {};
let scrambleScore = 0;
let scrambleLevel = 1;

function initWordScramble() {
    scrambleScore = 0;
    scrambleLevel = 1;
    nextWord();
}

function nextWord() {
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    const scrambled = currentWord.word.split('').sort(() => Math.random() - 0.5).join('');

    document.getElementById('scrambledWord').textContent = scrambled;
    document.getElementById('wordHint').textContent = currentWord.hint;
    document.getElementById('wordAnswer').value = '';
    document.getElementById('scrambleScore').textContent = scrambleScore;
    document.getElementById('scrambleLevel').textContent = scrambleLevel;
}

function checkWord() {
    const answer = document.getElementById('wordAnswer').value.toUpperCase();

    if (answer === currentWord.word) {
        alert('🎉 Correct!');
        scrambleScore += 10;
        scrambleLevel++;
        nextWord();
    } else {
        alert('❌ Try again!');
    }
}

function skipWord() {
    nextWord();
}

// Number Puzzle Game
let puzzleTiles = [];
let puzzleMoves = 0;

function initNumberPuzzle() {
    puzzleTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    shufflePuzzle();
    renderPuzzle();
    puzzleMoves = 0;
    document.getElementById('puzzleMoves').textContent = puzzleMoves;
}

function shufflePuzzle() {
    for (let i = 0; i < 100; i++) {
        const emptyIndex = puzzleTiles.indexOf(0);
        const validMoves = getValidMoves(emptyIndex);
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        [puzzleTiles[emptyIndex], puzzleTiles[randomMove]] = [puzzleTiles[randomMove], puzzleTiles[emptyIndex]];
    }
}

function getValidMoves(emptyIndex) {
    const moves = [];
    if (emptyIndex % 3 !== 0) moves.push(emptyIndex - 1); // Left
    if (emptyIndex % 3 !== 2) moves.push(emptyIndex + 1); // Right
    if (emptyIndex >= 3) moves.push(emptyIndex - 3); // Up
    if (emptyIndex < 6) moves.push(emptyIndex + 3); // Down
    return moves;
}

function renderPuzzle() {
    const grid = document.getElementById('numberPuzzleGrid');
    grid.innerHTML = '';

    puzzleTiles.forEach((num, index) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile' + (num === 0 ? ' empty' : '');
        tile.textContent = num === 0 ? '' : num;
        tile.onclick = () => moveTile(index);
        grid.appendChild(tile);
    });
}

function moveTile(index) {
    const emptyIndex = puzzleTiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
        [puzzleTiles[emptyIndex], puzzleTiles[index]] = [puzzleTiles[index], puzzleTiles[emptyIndex]];
        puzzleMoves++;
        document.getElementById('puzzleMoves').textContent = puzzleMoves;
        renderPuzzle();

        if (checkWin()) {
            setTimeout(() => {
                alert(`🎊 Puzzle solved in ${puzzleMoves} moves!`);
            }, 300);
        }
    }
}

function checkWin() {
    return puzzleTiles.join('') === '123456780';
}

function resetNumberPuzzle() {
    initNumberPuzzle();
}

// Simon Says Game
let simonSequence = [];
let playerSequence = [];
let simonLevel = 1;
let simonScore = 0;
let simonPlaying = false;

const colors = ['red', 'blue', 'green', 'yellow'];

function startSimonGame() {
    simonSequence = [];
    playerSequence = [];
    simonLevel = 1;
    simonScore = 0;
    simonPlaying = true;

    document.getElementById('simonLevel').textContent = simonLevel;
    document.getElementById('simonScore').textContent = simonScore;

    nextSimonRound();
}

function nextSimonRound() {
    playerSequence = [];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    simonSequence.push(randomColor);
    playSimonSequence();
}

function playSimonSequence() {
    simonPlaying = true;
    let i = 0;

    const interval = setInterval(() => {
        if (i < simonSequence.length) {
            flashSimonButton(simonSequence[i]);
            i++;
        } else {
            clearInterval(interval);
            simonPlaying = false;
            enableSimonButtons();
        }
    }, 800);
}

function flashSimonButton(color) {
    const btn = document.querySelector(`.simon-${color}`);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
}

function enableSimonButtons() {
    const buttons = document.querySelectorAll('.simon-btn');
    buttons.forEach(btn => {
        btn.onclick = () => handleSimonClick(btn.dataset.color);
    });
}

function handleSimonClick(color) {
    if (simonPlaying) return;

    flashSimonButton(color);
    playerSequence.push(color);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== simonSequence[currentIndex]) {
        alert('❌ Wrong! Game Over. Your score: ' + simonScore);
        simonPlaying = true;
        return;
    }

    if (playerSequence.length === simonSequence.length) {
        simonScore += 10;
        simonLevel++;
        document.getElementById('simonLevel').textContent = simonLevel;
        document.getElementById('simonScore').textContent = simonScore;

        setTimeout(() => {
            nextSimonRound();
        }, 1000);
    }
}

// Diary Functions
function saveDiaryEntry() {
    const title = document.getElementById('diaryTitle').value;
    const text = document.getElementById('diaryText').value;

    if (!title || !text) {
        alert('Please write both a title and your thoughts!');
        return;
    }

    const entry = {
        title: title,
        text: text,
        date: new Date().toLocaleDateString()
    };

    let entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    entries.unshift(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));

    document.getElementById('diaryTitle').value = '';
    document.getElementById('diaryText').value = '';

    loadDiaryEntries();
    alert('✅ Entry saved successfully!');
}

function loadDiaryEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    const container = document.getElementById('savedEntries');

    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No entries yet. Start writing!</p>';
        return;
    }

    container.innerHTML = '<h3 style="color: #667eea; margin-bottom: 20px;">📚 My Memories</h3>';
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        entryDiv.innerHTML = `
            <div class="entry-date">${entry.date}</div>
            <h4 style="color: #667eea; margin-bottom: 10px;">${entry.title}</h4>
            <p style="color: #666;">${entry.text}</p>
        `;
        container.appendChild(entryDiv);
    });
}

// Drawing Canvas
let canvas, ctx;
let isDrawing = false;
let currentColor = '#667eea';

function initCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function changeColor(color) {
    currentColor = color;
    ctx.strokeStyle = color;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveDrawing() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = dataURL;
    link.click();
    alert('🎨 Drawing saved!');
}

// Jokes
const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! 😄",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the bicycle fall over? Because it was two-tired! 🚲",
    "What do you call a sleeping bull? A bulldozer! 🐂",
    "Why can't you give Elsa a balloon? Because she'll let it go! ❄️",
    "What did the ocean say to the beach? Nothing, it just waved! 🌊",
    "Why did the math book look sad? Because it had too many problems! 📚",
    "What do you call a dinosaur with an extensive vocabulary? A thesaurus! 🦕"
];

function getNewJoke() {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    document.getElementById('jokeText').innerHTML = randomJoke;
}

// Initialize
window.onload = () => {
    initCanvas();
};

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};