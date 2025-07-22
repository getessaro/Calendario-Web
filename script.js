document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYear = document.getElementById('currentMonthYear');
    const calendarDays = document.getElementById('calendarDays');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    const noteModal = document.getElementById('noteModal');
    const closeButton = document.querySelector('.close-button');
    const noteDateDisplay = document.getElementById('noteDateDisplay');
    const noteInput = document.getElementById('noteInput');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const existingNotesDisplay = document.getElementById('existingNotesDisplay');

    let currentDate = new Date();
    let selectedDateDiv = null;
    let currentSelectedDate = null;

    let notes = JSON.parse(localStorage.getItem('calendarNotes')) || {};

    function getEasterSunday(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        return new Date(year, month - 1, day);
    }

    function generateHolidaysForYear(year) {
        const yearHolidays = {};

        yearHolidays[`${year}-01-01`] = 'Ano Novo';
        yearHolidays[`${year}-04-21`] = 'Tiradentes';
        yearHolidays[`${year}-05-01`] = 'Dia do Trabalho';
        yearHolidays[`${year}-09-07`] = 'Independência do Brasil';
        yearHolidays[`${year}-10-12`] = 'Nossa Senhora Aparecida';
        yearHolidays[`${year}-11-02`] = 'Finados';
        yearHolidays[`${year}-11-15`] = 'Proclamação da República';
        yearHolidays[`${year}-12-25`] = 'Natal';

        const easterSunday = getEasterSunday(year);

        const carnival = new Date(easterSunday);
        carnival.setDate(easterSunday.getDate() - 47);
        yearHolidays[`${carnival.getFullYear()}-${(carnival.getMonth() + 1).toString().padStart(2, '0')}-${carnival.getDate().toString().padStart(2, '0')}`] = 'Carnaval';

        const goodFriday = new Date(easterSunday);
        goodFriday.setDate(easterSunday.getDate() - 2);
        yearHolidays[`${goodFriday.getFullYear()}-${(goodFriday.getMonth() + 1).toString().padStart(2, '0')}-${goodFriday.getDate().toString().padStart(2, '0')}`] = 'Sexta-feira Santa';

        const corpusChristi = new Date(easterSunday);
        corpusChristi.setDate(easterSunday.getDate() + 60);
        yearHolidays[`${corpusChristi.getFullYear()}-${(corpusChristi.getMonth() + 1).toString().padStart(2, '0')}-${corpusChristi.getDate().toString().padStart(2, '0')}`] = 'Corpus Christi';

        return yearHolidays;
    }

    const allHolidays = {};
    for (let y = 2024; y <= 2030; y++) {
        Object.assign(allHolidays, generateHolidaysForYear(y));
    }

    function renderCalendar() {
        calendarDays.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYear.textContent = new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty');
            calendarDays.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;

            const formattedMonth = (month + 1).toString().padStart(2, '0');
            const formattedDay = day.toString().padStart(2, '0');
            const fullDate = `${year}-${formattedMonth}-${formattedDay}`;
            dayDiv.setAttribute('data-date', fullDate);

            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            const dayOfWeek = new Date(year, month, day).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayDiv.classList.add('weekend');
            }

            if (allHolidays[fullDate]) {
                dayDiv.classList.add('holiday');
                dayDiv.title = allHolidays[fullDate];
            }

            if (notes[fullDate]) {
                dayDiv.classList.add('has-note');
            }

            dayDiv.addEventListener('click', () => openNoteModal(dayDiv, fullDate));

            calendarDays.appendChild(dayDiv);
        }
    }

    function openNoteModal(dayElement, dateString) {
        selectedDateDiv = dayElement;
        currentSelectedDate = dateString;

        noteDateDisplay.textContent = new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        noteInput.value = notes[dateString] || '';

        if (notes[dateString]) {
            existingNotesDisplay.innerHTML = `<h4>Anotação Existente:</h4><p>${notes[dateString]}</p>`;
            deleteNoteBtn.style.display = 'block';
        } else {
            existingNotesDisplay.innerHTML = '';
            deleteNoteBtn.style.display = 'none';
        }

        noteModal.style.display = 'flex';
    }

    function closeModal() {
        noteModal.style.display = 'none';
        selectedDateDiv = null;
        currentSelectedDate = null;
    }

    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === noteModal) {
            closeModal();
        }
    });

    saveNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();

        if (currentSelectedDate) {
            if (noteText) {
                notes[currentSelectedDate] = noteText;
            } else {
                delete notes[currentSelectedDate];
            }
            localStorage.setItem('calendarNotes', JSON.stringify(notes));
            closeModal();
            renderCalendar();
        }
    });

    deleteNoteBtn.addEventListener('click', () => {
        if (currentSelectedDate && notes[currentSelectedDate]) {
            delete notes[currentSelectedDate];
            localStorage.setItem('calendarNotes', JSON.stringify(notes));
            closeModal();
            renderCalendar();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});
