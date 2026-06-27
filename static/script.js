const bgMusic = new Audio("/static/bg-music2.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

const clickSound = new Audio("/static/click.mp3");

let isMuted = false; 

    function toggleMute() {
        isMuted = !isMuted; 
        
       
        bgMusic.muted = isMuted;
        clickSound.muted = isMuted;

        const muteBtn = document.getElementById('mute-btn');
        
        
        if (isMuted) {
            muteBtn.innerText = "🔇"; 
        } else {
            muteBtn.innerText = "🔊"; 
            
           
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Audio error: ", e));
            }
        }
    }
    
    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Audio error: ", e));
        clickSound.volume = 0.2;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const buttons = document.querySelectorAll('.btn, .mode-box, .profile-icon, .back-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', playClickSound);
        });
    });

    function startMusic() {
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Audio error: ", e));
        }
    }


    let currentUser = "";
    let currentMode = "";
    let currentLevel = 0;
    let solvedCount = 0;

    // to unlockd lavel
    let unlockedLevels = {
    simple: 0,
    moderate: 0,
    difficult: 0
};

    const gameData = {
       simple: [
            { q: "Count the Apples!", v: "🍎🍎🍎", o: ["2", "3", "4"], a: "3", h: "Count them one by one!" },
            { q: "Which one is BIG?", v: "🐭 🐘", o: ["Mouse", "Elephant"], a: "Elephant", h: "The elephant is very large!" },
            { q: "What color is the Sun?", v: "☀️", o: ["Yellow", "Blue"], a: "Yellow", h: "Look at the bright yellow sun!" },
            { q: "How many legs does a dog have?", v: "🐕", o: ["2", "4", "6"], a: "4", h: "1, 2, 3, 4!" },
            { q: "Which one lives in water?", v: "🐱 🐟", o: ["Cat", "Fish"], a: "Fish", h: "Fish need water to swim!" },
            { q: "Find the Circle!", v: "🔺 🔴 🟦", o: ["Red", "Blue", "Green"], a: "Red", h: "The red one is round!" },
            { q: "One more than 1 is?", v: "☝️", o: ["2", "3"], a: "2", h: "Add one finger!" },
            { q: "Which is a fruit?", v: "🥕 🍎", o: ["Carrot", "Apple"], a: "Apple", h: "Apples grow on trees!" },
            { q: "Match the baby!", v: "🐮 (Cow)", o: ["Calf", "Puppy"], a: "Calf", h: "A baby cow is a calf!" },
            { q: "How many stars?", v: "⭐ ⭐ ⭐ ⭐ ⭐", o: ["4", "5", "6"], a: "5", h: "Count carefully!" }
        ],
        moderate: [
            { q: "2 + 3 = ?", v: "🔢", o: ["4", "5", "6"], a: "5", h: "Use your fingers: 2 then 3 more!" },
            { q: "Which is heavier?", v: "🧱 🎈", o: ["Brick", "Balloon"], a: "Brick", h: "A brick is hard and heavy!" },
            { q: "Spelling: C _ T", v: "🐱", o: ["A", "O", "E"], a: "A", h: "C-A-T spells Cat!" },
            { q: "Which animal is tall?", v: "🐒 🦒", o: ["Monkey", "Giraffe"], a: "Giraffe", h: "Giraffes have long necks!" },
            { q: "What comes next? 2, 4, 6, _", v: "🔢", o: ["7", "8", "10"], a: "8", h: "Skip counting by 2s!" },
            { q: "Find the Triangle!", v: "📐", o: ["3 corners", "4 corners"], a: "3 corners", h: "Triangles have 3 sides!" },
            { q: "Opposite of Cold?", v: "❄️", o: ["Hot", "Soft"], a: "Hot", h: "Ice is cold, Fire is...?" },
            { q: "How many wheels on a car?", v: "🚗", o: ["2", "4", "3"], a: "4", h: "Two in front, two in back!" },
            { q: "Which is a bird?", v: "🦅 🐕", o: ["Eagle", "Dog"], a: "Eagle", h: "Eagles can fly high!" },
            { q: "Half of 4 is?", v: "🍎🍎 | 🍎🍎", o: ["1", "2", "3"], a: "2", h: "Split 4 in two equal groups!" }
        ],
        difficult: [
            { q: "10 - 4 = ?", v: "🔢", o: ["5", "6", "7"], a: "6", h: "Take 4 away from 10!" },
            { q: "Spell the fruit:", v: "🍌", o: ["Banana", "Benana"], a: "Banana", h: "B-A-N-A-N-A!" },
            { q: "Which planet is ours?", v: "🪐 🌍", o: ["Saturn", "Earth"], a: "Earth", h: "We live on the blue and green one!" },
            { q: "3 x 2 = ?", v: "🍎🍎 + 🍎🍎 + 🍎🍎", o: ["5", "6", "8"], a: "6", h: "Three groups of two!" },
            { q: "Capital of India?", v: "🇮🇳", o: ["Delhi", "Mumbai"], a: "Delhi", h: "It starts with D!" },
            { q: "Which is a mammal?", v: "🐍 🐬", o: ["Snake", "Dolphin"], a: "Dolphin", h: "Dolphins breathe air!" },
            { q: "Next in pattern: 🔴🔵🔴🔵_", v: "🎨", o: ["🔴", "🔵"], a: "🔴", h: "The pattern repeats!" },
            { q: "How many minutes in an hour?", v: "⏰", o: ["50", "60"], a: "60", h: "The big hand goes around once!" },
            { q: "Which has 8 legs?", v: "🐜 🕷️", o: ["Ant", "Spider"], a: "Spider", h: "Spiders are not insects!" },
            { q: "Square root of 9?", v: "🔢", o: ["3", "4"], a: "3", h: "What number times itself is 9?" }
        ]
    };

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // new: register function
    async function handleRegister() {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        if(!u || !p) return alert("name and password both are required!");
        
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: u, password: p})
            });
            const data = await res.json();
            
            if(res.ok) {
                alert(data.message); // success message
                showScreen('login'); // Registration ke baad login screen dikhayein
            } else {
                alert("Error: " + data.message);
            }
        } catch (e) {
            alert("Dose not connect to server!");
        }
    }

    // UPDATED: Login Function
    async function handleLogin() {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        if(!u || !p) return alert("Name aur password dono chahiye!");
        
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: u, password: p})
            });
            const data = await res.json();
            console.log(data);
            
            if(res.ok) {
                currentUser = data.username;
                
                // NAYA: Backend se aayi progress yahan save hogi
                solvedCount = data.progress.score;
                unlockedLevels.simple = data.progress.simple;
                unlockedLevels.moderate = data.progress.moderate;
                unlockedLevels.difficult = data.progress.difficult;
                
                showScreen('modes');
            } else {
                alert("Error: " + data.message);
            }
        } catch (e) {
            alert("Server se connect nahi ho paya!");
        }
    }

    function startMode(m) {
    currentMode = m;
    document.getElementById('mode-title').innerText = m.toUpperCase() + " Mode";
    const grid = document.getElementById('level-grid');
    grid.innerHTML = "";
    
    
    for(let i = 0; i < gameData[currentMode].length; i++) {
        if(i <= unlockedLevels[currentMode]) {
          
            grid.innerHTML += `<button class="btn" onclick="loadLevel(${i})">${i + 1}</button>`;
        } else {
            
            grid.innerHTML += `<button class="btn" style="background: #bdc3c7; box-shadow: none; cursor: not-allowed;" disabled>🔒 ${i + 1}</button>`;
        }
    }
    showScreen('levels');
}

    function loadLevel(idx) {
        currentLevel = idx;
        const data = gameData[currentMode][idx];
        document.getElementById('game-question').innerText = data.q;
        document.getElementById('game-visual').innerText = data.v;
        const opts = document.getElementById('game-options');
        opts.innerHTML = "";
        data.o.forEach(opt => {
            opts.innerHTML += `<button class="btn" onclick="checkAnswer('${opt}')">${opt}</button>`;
        });
        showScreen('game');
    }

    function checkAnswer(choice) {
        const data = gameData[currentMode][currentLevel];
        if(choice === data.a) {
            document.getElementById('win-popup').style.display = 'flex';
            
            // NAYA LOGIC: Score tabhi badhega jab NAYA level pass hoga
            let levelChanged = false;
            if(currentLevel === unlockedLevels[currentMode]) {
                unlockedLevels[currentMode]++;
                solvedCount++;
                levelChanged = true;
            }
            
            // Agar naya level khula hai toh Python ko update bhej do
            if(levelChanged) {
                fetch('/api/update_progress', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ mode: currentMode, level: unlockedLevels[currentMode] })
                }).catch(e => console.log(e)); 
            }
            
        } else {
            document.getElementById('wrong-hint').innerText = "💡 Hint: " + data.h;
            document.getElementById('wrong-popup').style.display = 'flex';
        }
    }

    function hideWin() {
        document.getElementById('win-popup').style.display = 'none';
        if(currentLevel < gameData[currentMode].length - 1) loadLevel(currentLevel + 1);
        else showScreen('levels');
    }
    function hideWrong() {
        document.getElementById('wrong-popup').style.display = 'none';
    }    

    function showDashboard() {
        let badge = "";

        if (solvedCount === 0) {
            badge = "🥚 Newbie (Start playing!)";
        } else if (solvedCount <= 10) {
            badge = "🌱 Rookie Explorer";
        } else if (solvedCount <= 20) {
            badge = "🎖️ Junior Genius";
        } else if (solvedCount <= 27) {
            badge = "🚀 Super Scholar";
        } else {
            
            badge = "👑 Wonder World Champion!";
        }

        document.getElementById('user-details').innerHTML = `
            <p>Explorer Name: <b>${currentUser}</b></p>
            <p>Levels Mastered: <b>${solvedCount}</b></p>
            <p>Current Badge: <b>${badge}</b></p>
        `;
        showScreen('dashboard');
    }