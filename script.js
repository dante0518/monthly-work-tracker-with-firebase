let shifts = {};
let totalWage = 0;

// Betöltésnél ellenőrizzük, hogy van-e mentett adat, és ha van, betöltjük
window.onload = function() {
    fetch('mentés.json')
    .then(response => response.json())
    .then(data => {
        for (let date in data) {
            shifts[date] = data[date].shiftHours;
            totalWage += data[date].shiftHours * 2500;
        }
        updateShiftList();
    })
    .catch(error => console.error('Hiba történt a fájl beolvasása közben:', error));
}

document.getElementById('addShiftButton').addEventListener('click', addShift);
document.getElementById('removeShiftButton').addEventListener('click', removeShift);
document.getElementById('save').addEventListener('click', saveShiftsToFile);
document.getElementById('month').addEventListener('change', updateShiftList);

function addShift() {
    const date = document.getElementById('date').value;
    const shiftHours = parseFloat(document.getElementById('shift').value);
    
    if (shifts[date]) {
        shifts[date] += shiftHours;
    } else {
        shifts[date] = shiftHours;
    }
    
    totalWage += shiftHours * 2500; // 2500 Ft per óra
    
    updateShiftList();
    saveShiftsToLocalStorage();
}

function removeShift() {
    const date = document.getElementById('date').value;
    const selectedShiftHours = parseFloat(document.getElementById('shift').value);
    
    if (shifts[date]) {
        totalWage -= selectedShiftHours * 2500;
        shifts[date] -= selectedShiftHours;
        
        if (shifts[date] <= 0) {
            delete shifts[date];
        }
        
        updateShiftList();
        saveShiftsToLocalStorage();
    }
}

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

function calculateTotalHours() {
    let totalHours = 0;
    for (let date in shifts) {
        totalHours += shifts[date];
    }
    return totalHours.toFixed(2);
}

function saveShiftsToFile() {
    const data = {};
    for (let date in shifts) {
        data[date] = {
            shiftHours: shifts[date],
            totalAmount: shifts[date] * 2500,
            totalHoursInMonth: shifts[date],
            totalWageInMonth: shifts[date]
        };
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mentés.json';
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('calculateMonthStats').addEventListener('click', calculateMonthlyStats);

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

// Az aktuális dátum lekérése
const today = new Date();
const currentMonth = today.getMonth() + 1; // Hónapok 0-tól számolódnak, ezért +1

// Legördülő lista elemeinek beállítása
const monthSelect = document.getElementById('month');
for (let i = 1; i <= 12; i++) {
  const option = document.createElement('option');
  option.value = i < 10 ? '0' + i : i.toString(); // Hónap kétjegyű formátumban
  option.textContent = getMonthName(i);
  if (i === currentMonth) {
    option.selected = true; // Az aktuális hónap kiválasztása
  }
  monthSelect.appendChild(option);
}

// Hónap nevének lekérése
function getMonthName(month) {
  const months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  return months[month - 1];
}

function saveShiftsToLocalStorage() {
    localStorage.setItem('shifts', JSON.stringify(shifts));
    localStorage.setItem('totalWage', totalWage);
}


// // LOGIN

// document.querySelector('#loginButton').addEventListener('click', function(){
//     document.querySelector('.login-popup').classList.add('active');
//     document.querySelector('.container').classList.add('blur');
//     document.querySelector('#shiftList').classList.add('blur');

//     if(document.querySelector('.login-popup').classList.contains('active')){
//         disableScroll();
//     }
// })

// document.querySelector('.close-btn').addEventListener('click', function(){
//     document.querySelector('.login-popup').classList.remove('active')
//     document.querySelector('.container').classList.remove('blur');
//     document.querySelector('#shiftList').classList.remove('blur');
//     enableScroll();
// })

// function disableScroll(){
//     document.body.style.overflow = "hidden";
// }
// function enableScroll(){
//     document.body.style.overflow = "";
// }