document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILITY UNTUK SEMUA HALAMAN ---
    const getElement = (id) => document.getElementById(id);
    const getQuerySelector = (selector) => document.querySelector(selector);
    const getAllQuerySelectors = (selector) => document.querySelectorAll(selector);

    // ----------------------------------------------------------------------
    // 1. Logika QR Code Generator
    // ----------------------------------------------------------------------
    if (getElement('generateQRBtn')) {
        const generateQRBtn = getElement('generateQRBtn');
        const inputText = getElement('inputText');
        const qrWrap = getElement('qrWrap');
        const loadingIndicator = getElement('loadingIndicator');
        const copyQRBtn = getElement('copyQRBtn');
        const downloadQRBtn = getElement('downloadQRBtn');

        const generateQR = (data) => {
            qrWrap.innerHTML = '';
            loadingIndicator.textContent = 'Membuat QR Code...';
            loadingIndicator.classList.remove('hidden');
            
            copyQRBtn.disabled = true;
            downloadQRBtn.disabled = true;

            setTimeout(() => {
                // QRCode di-load via CDN di HTML
                new QRCode(qrWrap, {
                    text: data,
                    width: 256,
                    height: 256,
                });
                
                // Beri sedikit jeda agar gambar QR sempat ter-render
                setTimeout(() => {
                    loadingIndicator.classList.add('hidden');
                    copyQRBtn.disabled = false;
                    downloadQRBtn.disabled = false;
                }, 100); 

            }, 50);
        };

        generateQRBtn.addEventListener('click', () => {
            const payload = inputText.value.trim();
            if (!payload) return alert('Masukkan teks atau URL.');
            generateQR(payload);
        });

        // DOWNLOAD QR
        downloadQRBtn.addEventListener('click', () => {
            const qrImage = qrWrap.querySelector('img') || qrWrap.querySelector('canvas'); 
            if (!qrImage) return alert('QR belum dibuat.');

            let dataURL;
            if (qrImage.tagName === 'IMG') {
                dataURL = qrImage.src;
            } else if (qrImage.tagName === 'CANVAS') {
                dataURL = qrImage.toDataURL("image/png");
            }

            if (dataURL) {
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = 'qrcode.png';
                a.click();
            }
        });

        // COPY QR IMAGE (DATA URL)
        copyQRBtn.addEventListener('click', async () => {
            const qrImage = qrWrap.querySelector('img') || qrWrap.querySelector('canvas');
            if (!qrImage) return alert('Buat QR dulu.');
            
            let imgURL;
            if (qrImage.tagName === 'IMG') {
                imgURL = qrImage.src;
            } else if (qrImage.tagName === 'CANVAS') {
                imgURL = qrImage.toDataURL("image/png");
            }

            try {
                await navigator.clipboard.writeText(imgURL);
                alert('QR (Data URL) telah disalin ke clipboard.');
            } catch (err) {
                console.error('Gagal menyalin:', err);
                alert('Gagal menyalin. Silakan coba cara manual.');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 2. Logika Kalkulator (BMI dan Biasa)
    // ----------------------------------------------------------------------
    if (getQuerySelector('.tabs')) {
        const tabs = getAllQuerySelectors('.tab-btn');
        const sections = getAllQuerySelectors('.tool-section');
        
        // --- Tab Switching ---
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                sections.forEach(sec => {
                    sec.classList.add('hidden');
                    if (sec.id === targetTab) {
                        sec.classList.remove('hidden');
                    }
                });
            });
        });

        // --- Kalkulator BMI ---
        const hitungBmiBtn = getElement('hitungBmiBtn');
        const beratInput = getElement('berat');
        const tinggiInput = getElement('tinggi');
        const bmiResult = getElement('bmiResult');

        hitungBmiBtn?.addEventListener('click', () => {
            const berat = parseFloat(beratInput.value);
            const tinggiCm = parseFloat(tinggiInput.value);

            if (isNaN(berat) || isNaN(tinggiCm) || berat <= 0 || tinggiCm <= 0) {
                bmiResult.innerHTML = '<p style="color: red;">Masukkan nilai berat dan tinggi yang valid.</p>';
                return;
            }

            const tinggiM = tinggiCm / 100;
            const bmi = berat / (tinggiM * tinggiM);
            const bmiFormatted = bmi.toFixed(2);

            let kategori = '';
            let warna = '';

            if (bmi < 18.5) {
                kategori = 'Kekurangan Berat Badan';
                warna = 'blue';
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                kategori = 'Berat Badan Normal';
                warna = 'green';
            } else if (bmi >= 25 && bmi <= 29.9) {
                kategori = 'Kelebihan Berat Badan';
                warna = 'orange';
            } else {
                kategori = 'Obesitas';
                warna = 'red';
            }

            bmiResult.innerHTML = `
                <p>BMI Anda adalah: <strong>${bmiFormatted}</strong></p>
                <p style="color: ${warna};">Kategori: <strong>${kategori}</strong></p>
            `;
        });

        // --- Kalkulator Biasa ---
        const display = getElement('calculatorDisplay');
        const buttons = getAllQuerySelectors('.calc-btn');
        let currentInput = '';
        let operator = null;
        let previousValue = 0;

        const updateDisplay = (value) => {
            display.textContent = value;
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.getAttribute('data-value');
                const action = button.getAttribute('data-action');

                if (value) {
                    if (currentInput === '0' && value !== '.') {
                        currentInput = value;
                    } else {
                        currentInput += value;
                    }
                    updateDisplay(currentInput);
                } else if (action === 'decimal') {
                    if (!currentInput.includes('.')) {
                        currentInput += '.';
                    }
                    updateDisplay(currentInput);
                } else if (action === 'clear') {
                    currentInput = '';
                    operator = null;
                    previousValue = 0;
                    updateDisplay('0');
                } else if (action === 'calculate') {
                    if (operator && currentInput) {
                        currentInput = String(calculate(previousValue, currentInput, operator));
                        previousValue = 0;
                        operator = null;
                        updateDisplay(currentInput);
                    }
                } else if (action) { // Operator (+, -, *, /)
                    if (currentInput) {
                        if (previousValue !== 0 && operator) {
                            previousValue = calculate(previousValue, currentInput, operator);
                            currentInput = '';
                            operator = action;
                            updateDisplay(previousValue);
                        } else {
                            previousValue = parseFloat(currentInput);
                            currentInput = '';
                            operator = action;
                        }
                    }
                }
            });
        });

        const calculate = (num1, num2, op) => {
            const n1 = parseFloat(num1);
            const n2 = parseFloat(num2);
            if (op === 'add') return n1 + n2;
            if (op === 'subtract') return n1 - n2;
            if (op === 'multiply') return n1 * n2;
            if (op === 'divide') return n2 !== 0 ? n1 / n2 : 'Error';
            return n2;
        };
    }

    // ----------------------------------------------------------------------
    // 3. Logika Daftar Tugas (To-Do List)
    // ----------------------------------------------------------------------
    if (getElement('taskList')) {
        const taskInput = getElement('taskInput');
        const prioritySelect = getElement('prioritySelect');
        const addTaskBtn = getElement('addTaskBtn');
        const taskList = getElement('taskList');
        const sortPriorityBtn = getElement('sortPriorityBtn');
        const sortDateBtn = getElement('sortDateBtn');

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        const saveTasks = () => {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        };

        const renderTasks = (currentTasks) => {
            taskList.innerHTML = '';
            currentTasks.forEach((task, index) => {
                const listItem = document.createElement('li');
                listItem.className = `priority-${task.priority}`;
                listItem.setAttribute('data-index', index);

                const taskText = document.createElement('span');
                taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
                taskText.textContent = `${task.text} (${task.priority.toUpperCase()})`;
                taskText.addEventListener('click', () => toggleTask(task.id));

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', () => deleteTask(task.id));

                listItem.appendChild(taskText);
                listItem.appendChild(deleteBtn);
                taskList.appendChild(listItem);
            });
        };

        const addTask = () => {
            const text = taskInput.value.trim();
            const priority = prioritySelect.value;
            if (text === '') return;

            const newTask = {
                id: Date.now(),
                text: text,
                priority: priority,
                completed: false,
                date: new Date().getTime()
            };

            tasks.push(newTask);
            saveTasks();
            taskInput.value = '';
            renderTasks(tasks);
        };

        const toggleTask = (id) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks(tasks);
            }
        };

        const deleteTask = (id) => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks(tasks);
        };

        const sortTasks = (type) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            let sortedTasks = [...tasks];

            if (type === 'priority') {
                sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            } else if (type === 'date') {
                sortedTasks.sort((a, b) => b.date - a.date);
            }

            renderTasks(sortedTasks);
        };

        addTaskBtn?.addEventListener('click', addTask);
        sortPriorityBtn?.addEventListener('click', () => sortTasks('priority'));
        sortDateBtn?.addEventListener('click', () => sortTasks('date'));

        renderTasks(tasks);
    }

    // ----------------------------------------------------------------------
    // 4. Logika Generator Palet Warna
    // ----------------------------------------------------------------------
    if (getElement('colorPalette')) {
        const colorPaletteContainer = getElement('colorPalette');
        const generateColorBtn = getElement('generateColorBtn');

        const getRandomColor = () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        const generatePalette = () => {
            colorPaletteContainer.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const color = getRandomColor();
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                
                const hexCode = document.createElement('span');
                hexCode.textContent = color;
                
                swatch.appendChild(hexCode);
                colorPaletteContainer.appendChild(swatch);

                swatch.addEventListener('click', () => {
                    navigator.clipboard.writeText(color);
                    alert(`Kode warna ${color} berhasil disalin!`);
                });
            }
        };

        generateColorBtn?.addEventListener('click', generatePalette);
        generatePalette(); // Generate saat halaman dimuat
    }

    // ----------------------------------------------------------------------
    // 5. Logika Aplikasi Cuaca
    // ----------------------------------------------------------------------
    if (getElement('weatherResult')) {
        // GANTI DENGAN KUNCI API ANDA SENDIRI
        const API_KEY = '54ccd0f11d8505810ed5edf41cb84ace'; 
        const getWeatherBtn = getElement('getWeatherBtn');
        const cityInput = getElement('cityInput');
        const weatherResult = getElement('weatherResult');
        const weatherError = getElement('weatherError');
        
        const cityNameEl = getElement('cityName');
        const tempEl = getElement('temp');
        const descriptionEl = getElement('description');
        const humidityEl = getElement('humidity');
        const weatherIconEl = getElement('weatherIcon');

        const fetchWeather = async (city) => {
           

            weatherResult.classList.add('hidden');
            weatherError.classList.add('hidden');

            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=id`;
            
            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.cod !== 200) {
                    weatherError.textContent = `Kota tidak ditemukan. (${data.message})`;
                    weatherError.classList.remove('hidden');
                    return;
                }

                cityNameEl.textContent = data.name;
                tempEl.textContent = `${Math.round(data.main.temp)}°C`;
                descriptionEl.textContent = data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
                humidityEl.textContent = `Kelembaban: ${data.main.humidity}%`;
                weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

                weatherResult.classList.remove('hidden');

            } catch (error) {
                weatherError.textContent = 'Gagal mengambil data cuaca.';
                weatherError.classList.remove('hidden');
                console.error('Fetch error:', error);
            }
        };

        getWeatherBtn?.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            } else {
                weatherError.textContent = 'Masukkan nama kota.';
                weatherError.classList.remove('hidden');
            }
        });
    }
});