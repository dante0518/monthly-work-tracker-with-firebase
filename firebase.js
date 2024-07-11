import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD3MbJLV6kjv6tDANQfkIG1K--oSJ7tOTQ",
    authDomain: "schedule-tracker-50e8e.firebaseapp.com",
    projectId: "schedule-tracker-50e8e",
    storageBucket: "schedule-tracker-50e8e.appspot.com",
    messagingSenderId: "503540990642",
    appId: "1:503540990642:web:b3df4116771e233fecffab",
    databaseURL: "https://schedule-tracker-50e8e-default-rtdb.europe-west1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let shifts = {};
let totalWage = 0;

// Populate month select dropdown


// Function to populate month select dropdown
function populateMonthSelect() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Months are zero-indexed, so add 1

    const monthSelect = document.getElementById('month');
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i.toString(); // Two-digit format
        option.textContent = getMonthName(i);
        if (i === currentMonth) {
            option.selected = true; // Select the current month
        }
        monthSelect.appendChild(option);
    }
}

// Function to get month name
function getMonthName(month) {
    const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
    return months[month - 1];
}

// Load shifts from Firestore after page load
window.onload = function() {
    loadShiftsFromFirestore();
}

// Event listeners for buttons and select dropdown
document.getElementById('addShiftButton').addEventListener('click', addShift);
document.getElementById('removeShiftButton').addEventListener('click', removeShift);
document.getElementById('saveToFirebaseButton').addEventListener('click', saveShiftsToFirestore);
document.getElementById('calculateMonthStats').addEventListener('click', calculateMonthlyStats);
document.getElementById('month').addEventListener('change', updateShiftList);

// Function to add shift
function addShift() {
    const date = document.getElementById('date').value;
    const shiftHours = parseFloat(document.getElementById('shift').value);

    if (shifts[date]) {
        shifts[date] += shiftHours;
    } else {
        shifts[date] = shiftHours;
    }

    totalWage += shiftHours * 2500; // 2500 Ft per hour

    updateShiftList();
    saveShiftsToFirestore();
    window.alert('shifts added')
}

// Function to remove shift
function removeShift() {
    const date = document.getElementById('date').value;
    const selectedShiftHours = parseFloat(document.getElementById('shift').value);

    if (shifts[date]) {
        totalWage -= selectedShiftHours * 2500;
        shifts[date] -= selectedShiftHours;

        if (shifts[date] <= 0) {
            delete shifts[date];
            update(ref(db), { ['/shifts/' + date]: null }).then(() => {
                console.log('Shift successfully deleted!');
                window.alert('Shift deleted')
            }).catch(error => {
                console.error('Error deleting shift:', error);
            });
        } else {
            updateShiftList();
            saveShiftsToFirestore();
        }
    }
}


// Function to update shift list in UI
function updateShiftList() {
    const shiftListBody = document.getElementById('shiftListBody');
    shiftListBody.innerHTML = '';

    const selectedMonth = document.getElementById('month').value;
    let monthlyTotalHours = 0;
    let monthlyTotalWage = 0;

    for (let date in shifts) {
        const month = date.split('-')[1];
        if (month === selectedMonth) {
            const shiftRow = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = date;
            shiftRow.appendChild(dateCell);

            const shiftHoursCell = document.createElement('td');
            shiftHoursCell.textContent = shifts[date];
            shiftRow.appendChild(shiftHoursCell);

            const wageCell = document.createElement('td');
            wageCell.textContent = shifts[date] * 2500;
            shiftRow.appendChild(wageCell);

            shiftListBody.appendChild(shiftRow);

            monthlyTotalHours += shifts[date];
            monthlyTotalWage += shifts[date] * 2500;
        }
    }

    document.getElementById('totalHours').textContent = `Összes munkaidő: ${monthlyTotalHours.toFixed(2)} óra`;
    document.getElementById('totalWage').textContent = `Összeg: ${monthlyTotalWage} Ft`;
}

// Function to save shifts, totalWage, and totalHours to Firestore
function saveShiftsToFirestore() {
    const updates = {};
    let totalHoursInMonth = 0;
    let totalWage = 0;
  
    for (let date in shifts) {
      updates['/shifts/' + date ] = { 
        shiftHours: shifts[date], 
        totalHoursInMonth: totalHoursInMonth += shifts[date], 
        totalWage: totalWage += shifts[date] * 2500 
      };
    }
  
    update(ref(db), updates).then(() => {
      console.log('Shifts, totalWage, and totalHours successfully saved to Firestore!');
      alert('Shifts, totalWage, and totalHours successfully saved.')
    }).catch(error => {
      console.error('Error saving data:', error);
    });
  }

// Function to load shifts from Firestore
function loadShiftsFromFirestore() {
    get(ref(db, 'shifts')).then(snapshot => {
        snapshot.forEach(childSnapshot => {
            const date = childSnapshot.key;
            const data = childSnapshot.val();
            shifts[date] = data.shiftHours;
            totalWage += data.shiftHours * 2500;
            console.log('shifts loaded')
        });
        updateShiftList();
    }).catch(error => {
        console.error('Error loading shifts:', error);
    });
}

// Function to calculate monthly statistics
function calculateMonthlyStats() {
    const selectedMonth = document.getElementById('month').value;
    let totalHoursInMonth = 0;
    let totalWageInMonth = 0;

    for (let date in shifts) {
        const month = date.split('-')[1];
        if (month === selectedMonth) {
            totalHoursInMonth += shifts[date];
            totalWageInMonth += shifts[date] * 2500;
        }
    }

    document.getElementById('monthlyHours').textContent = `Ledolgozott munkaórák a hónapban: ${totalHoursInMonth.toFixed(2)} óra`;
    document.getElementById('monthlyWage').textContent = `Keresett összeg a hónapban: ${totalWageInMonth} Ft`;
}


// // REGISTER

// window.register = function() {
//     // get all our inputs
//     const email = document.getElementById('emailInput').value;
//     const password = document.getElementById('passwordInput').value;

//     // validate input
//     if(!validateEmail(email) || !validatePassword(password)){
//         alert('Your credentials do not match');
//         return;
//     };

//       // Create user with email and password
//   createUserWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Get the signed-in user
//     const user = userCredential.user;

//     // Add to database
//     const databaseRef = ref(db, 'users/' + user.uid);
//     // Create user data
//     const userData = {
//       email: email,
//       password: password,
//       last_login: Date.now(),
//     };

//     set(databaseRef, userData)
//       .then(() => {
//           // Check if .login-popup has the 'active' class and remove it
//           const loginPopup = document.querySelector('.login-popup');
//           if (loginPopup.classList.contains('active')) {
//               loginPopup.classList.remove('active');
//           }
//           alert('User created, you can now login!');
//         //hide popup
//       })
//       .catch((error) => {
//           console.error('Error saving user data:', error);
//       });
//   })
//   .catch((error) => {
//     console.error('Error creating user:', error);
//     alert('Error creating user: ' + error.message);
//   });
// };

// // Attach the login function to the window object
// window.login = function() {
//     // Get all our inputs
//     const email = document.getElementById('emailInput').value;
//     const password = document.getElementById('passwordInput').value;
  
//     // Validate input fields
//     if (!validateEmail(email) || !validatePassword(password)) {
//       alert('Your credentials do not match.');
//       return;
//     }
  
//     // Authenticate the user
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         // Get the signed-in user
//         const user = userCredential.user;
  
//         // Create user data
//         const userData = {
//           last_login: Date.now(),
//         };
  
//         // Add to database
//         const databaseRef = ref(db, 'users/' + user.uid);
//         update(databaseRef, userData)
//           .then(() => {
//             alert('User logged in successfully!');

//           })
//           .catch((error) => {
//             console.error('Error updating user data:', error);
//           });
//       })
//       .catch((error) => {
//         console.error('Error signing in user:', error);
//         alert('Error signing in user: ' + error.message);
//       });
// };

// // VALIDATION

// function validateEmail(email) {
//     const expression = /^[^@]+@\w+(\.\w+)+\w$/;
//     return expression.test(email);
//   }
  
//   function validatePassword(password) {
//     return password.length >= 6;
//   }
  
//   function validateField(field) {
//     return field != null && field.length > 0;
//   }
  
  
  