document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Handling ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['dashboard', 'students', 'staff', 'calculator'];
    const headerTitle = document.getElementById('header-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(item => {
                item.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
                item.classList.add('text-gray-400', 'hover:bg-slate-800');
            });
            link.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
            link.classList.remove('text-gray-400');

            const key = link.getAttribute('href').substring(1);
            sections.forEach(sec => {
                document.getElementById(sec + '-section').classList.add('hidden');
            });
            document.getElementById(key + '-section').classList.remove('hidden');

            const titles = {
                'dashboard': 'Dashboard',
                'students': 'Students Management',
                'staff': 'Staff Directory',
                'calculator': 'Engineering Calculator, Unit Converter & Grapher'
            };
            headerTitle.textContent = titles[key];
            if (key === 'calculator') drawGraph();
        });
    });

    // --- Engineering Sub-Tabs ---
    window.switchEngTab = function(tabId) {
        document.querySelectorAll('.eng-tab').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        const activeBtn = document.getElementById('tab-' + tabId);
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
        activeBtn.classList.add('bg-blue-600', 'text-white');

        document.querySelectorAll('.eng-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById('panel-' + tabId).classList.remove('hidden');

        if (tabId === 'func-graph') drawGraph();
    };

    // --- LocalStorage Data Management ---
    const studentForm = document.getElementById('student-form');
    const studentTableBody = document.getElementById('student-table-body');
    const totalStudentsEl = document.getElementById('total-students');
    const avgAttendanceEl = document.getElementById('avg-attendance');

    const staffForm = document.getElementById('staff-form');
    const staffTableBody = document.getElementById('staff-table-body');
    const totalStaffEl = document.getElementById('total-staff');

    let students = JSON.parse(localStorage.getItem('iiuc_students')) || [
        { id: 'IIUC-101', name: 'Naimul Islam', dept: 'B.Sc. Civil Eng', feeStatus: 'Paid', attendance: 'Present' },
        { id: 'IIUC-102', name: 'Farhana Yasmin', dept: 'CSE', feeStatus: 'Paid', attendance: 'Present' },
        { id: 'IIUC-103', name: 'Mahmudul Hasan', dept: 'EEE', feeStatus: 'Due', attendance: 'Absent' }
    ];

    let staff = JSON.parse(localStorage.getItem('iiuc_staff')) || [
        { name: 'Dr. Ahmed Shafi', role: 'Professor', dept: 'CSE / AI Lab', email: 'ashafi@iiuc.ac.bd' },
        { name: 'Engr. Nusrat Jahan', role: 'Assistant Professor', dept: 'EEE / Power Lab', email: 'nusrat@iiuc.ac.bd' }
    ];

    function saveAndRefresh() {
        localStorage.setItem('iiuc_students', JSON.stringify(students));
        localStorage.setItem('iiuc_staff', JSON.stringify(staff));
        updateDashboard();
        renderStudents();
        renderStaff();
    }

    window.clearData = function(type) {
        if (confirm(`Clear all ${type} records?`)) {
            if (type === 'students') students = [];
            if (type === 'staff') staff = [];
            saveAndRefresh();
        }
    };

    function updateDashboard() {
        totalStudentsEl.textContent = students.length;
        const presentCount = students.filter(s => s.attendance === 'Present').length;
        const avgAttendance = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : 0;
        avgAttendanceEl.textContent = `${avgAttendance}%`;
        totalStaffEl.textContent = staff.length;
    }

    window.toggleAttendance = function(index) {
        students[index].attendance = students[index].attendance === 'Present' ? 'Absent' : 'Present';
        saveAndRefresh();
    };

    window.deleteStudent = function(index) {
        students.splice(index, 1);
        saveAndRefresh();
    };

    function renderStudents() {
        studentTableBody.innerHTML = '';
        students.forEach((student, index) => {
            const isPresent = student.attendance === 'Present';
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition';
            row.innerHTML = `
                <td class="p-4 font-bold text-gray-900">${student.id}</td>
                <td class="p-4 font-semibold">${student.name}</td>
                <td class="p-4 text-gray-600">${student.dept}</td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${student.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${student.feeStatus}
                    </span>
                </td>
                <td class="p-4">
                    <button onclick="toggleAttendance(${index})" class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${isPresent ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}">
                        <i class="fa-solid ${isPresent ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${student.attendance}
                    </button>
                    </td>
                <td class="p-4 text-center">
                    <button onclick="deleteStudent(${index})" class="text-gray-400 hover:text-red-600 p-1 transition"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            studentTableBody.appendChild(row);
        });
    }

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('student-id').value.trim();
        const name = document.getElementById('student-name').value.trim();
        const dept = document.getElementById('student-dept').value.trim();
        const feeStatus = document.getElementById('fee-status').value;

        if (students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
            alert('Student ID already exists!');
            return;
        }
        students.unshift({ id, name, dept, feeStatus, attendance: 'Present' });
        saveAndRefresh();
        studentForm.reset();
    });

    window.deleteStaff = function(index) {
        staff.splice(index, 1);
        saveAndRefresh();
    };

    function renderStaff() {
        staffTableBody.innerHTML = '';
        staff.forEach((member, index) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition';
            row.innerHTML = `
                <td class="p-4 font-bold text-gray-900">${member.name}</td>
                <td class="p-4 font-semibold text-purple-600">${member.role}</td>
                <td class="p-4 text-gray-600">${member.dept}</td>
                <td class="p-4 text-gray-600">${member.email}</td>
                <td class="p-4 text-center">
                    <button onclick="deleteStaff(${index})" class="text-gray-400 hover:text-red-600 p-1 transition"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            staffTableBody.appendChild(row);
        });
    }

    staffForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('staff-name').value.trim();
        const role = document.getElementById('staff-role').value.trim();
        const dept = document.getElementById('staff-dept').value.trim();
        const email = document.getElementById('staff-email').value.trim();

        staff.unshift({ name, role, dept, email });
        saveAndRefresh();
        staffForm.reset();
    });

    // --- 1. Scientific Calculator Logic ---
    const screen = document.getElementById('calc-screen');
    const historyScreen = document.getElementById('calc-history');
    let isDegree = true;

    window.toggleAngleMode = function() {
        isDegree = !isDegree;
        document.getElementById('angle-mode-btn').textContent = isDegree ? 'MODE: DEG' : 'MODE: RAD';
    };

    window.appendValue = function(val) {
        if (screen.value === '0' && val !== '.' && val !== '**') {
            screen.value = val;
        } else {
            screen.value += val;
        }
    };

    window.backspaceCalc = function() {
        screen.value = screen.value.length > 1 ? screen.value.slice(0, -1) : '0';
    };

    window.clearCalc = function() {
        screen.value = '0';
        historyScreen.textContent = '';
    };

    window.calculateResult = function() {
        try {
            historyScreen.textContent = screen.value + ' =';
            const result = Function('"use strict";return (' + screen.value + ')')();
            screen.value = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
        } catch {
            screen.value = 'Error';
        }
    };

    function factorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    window.calcFunc = function(type) {
        let val = parseFloat(screen.value);
        if (type === 'pi') { appendValue(Math.PI.toFixed(8)); return; }
        if (type === 'e') { appendValue(Math.E.toFixed(8)); return; }

        const rad = isDegree ? (val * Math.PI) / 180 : val;
        let res;
        switch (type) {
            case 'sin': res = Math.sin(rad); break;
            case 'cos': res = Math.cos(rad); break;
            case 'tan': res = Math.tan(rad); break;
            case 'asin': res = isDegree ? (Math.asin(val) * 180) / Math.PI : Math.asin(val); break;
            case 'acos': res = isDegree ? (Math.acos(val) * 180) / Math.PI : Math.acos(val); break;
            case 'atan': res = isDegree ? (Math.atan(val) * 180) / Math.PI : Math.atan(val); break;
            case 'log': res = Math.log10(val); break;
            case 'ln': res = Math.log(val); break;
            case 'sqrt': res = Math.sqrt(val); break;
            case 'sq': res = Math.pow(val, 2); break;
            case 'fact': res = factorial(val); break;
        }
        historyScreen.textContent = `${type}(${val})`;
        screen.value = isNaN(res) ? 'Error' : parseFloat(res.toFixed(8));
    };

    // --- 2. Multi-Domain Engineering Unit Converter ---
    const unitDefinitions = {
        length: {
            base: 'm',
            units: {
                'Meter (m)': 1,
                'Kilometer (km)': 1000,
                'Centimeter (cm)': 0.01,
                'Millimeter (mm)': 0.001,
                'Foot (ft)': 0.3048,
                'Inch (in)': 0.0254,
                'Mile (mi)': 1609.344
            }
        },
        mass: {
            base: 'kg',
            units: {
                'Kilogram (kg)': 1,
                'Gram (g)': 0.001,
                'Milligram (mg)': 1e-6,
                'Pound (lb)': 0.45359237,
                'Ounce (oz)': 0.02834952,
                'Metric Ton (t)': 1000
            }
        },
        pressure: {
            base: 'Pa',
            units: {
                'Pascal (Pa)': 1,
                'Kilopascal (kPa)': 1000,
                'Megapascal (MPa)': 1e6,
                'Bar': 100000,
                'Atmosphere (atm)': 101325,
                'PSI (lbf/in²)': 6894.757
            }
        },
        force: {
            base: 'N',
            units: {
                'Newton (N)': 1,
                'Kilonewton (kN)': 1000,
                'Pound-force (lbf)': 4.4482216,
                'Kilogram-force (kgf)': 9.80665,
                'Dyne (dyn)': 1e-5
            }
        },
        energy: {
            base: 'J',
            units: {
                'Joule (J)': 1,
                'Kilojoule (kJ)': 1000,
                'Megajoule (MJ)': 1e6,
                'Calorie (cal)': 4.184,
                'Kilocalorie (kcal)': 4184,
                'BTU': 1055.056,
                'Kilowatt-hour (kWh)': 3.6e6
            }
        },
        power: {
            base: 'W',
            units: {
                'Watt (W)': 1,
                'Kilowatt (kW)': 1000,
                'Megawatt (MW)': 1e6,
                'Horsepower (hp)': 745.69987,
                'BTU/hour': 0.29307107
            }
        },
        freq: {
            base: 'Hz',
            units: {
                'Hertz (Hz)': 1,
                'Kilohertz (kHz)': 1e3,
                'Megahertz (MHz)': 1e6,
                'Gigahertz (GHz)': 1e9
            }
        },
        data: {
            base: 'B',
            units: {
                'Byte (B)': 1,
                'Kilobyte (KB)': 1024,
                'Megabyte (MB)': 1048576,
                'Gigabyte (GB)': 1073741824,
                'Terabyte (TB)': 1099511627776
            }
        },
        temp: {
            units: { 'Celsius (°C)': 'C', 'Fahrenheit (°F)': 'F', 'Kelvin (K)': 'K' }
        }
    };

    window.populateUnitDropdowns = function() {
        const cat = document.getElementById('conv-category').value;
        const fromSel = document.getElementById('conv-from-unit');
        const toSel = document.getElementById('conv-to-unit');
        const keys = Object.keys(unitDefinitions[cat].units);

        fromSel.innerHTML = keys.map(k => `<option value="${k}">${k}</option>`).join('');
        toSel.innerHTML = keys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
        runConversion();
    };

    window.swapUnits = function() {
        const fromSel = document.getElementById('conv-from-unit');
        const toSel = document.getElementById('conv-to-unit');
        const temp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = temp;
        runConversion();
    };

    window.runConversion = function() {
        const cat = document.getElementById('conv-category').value;
        const val = parseFloat(document.getElementById('conv-from-val').value);
        const fromUnit = document.getElementById('conv-from-unit').value;
        const toUnit = document.getElementById('conv-to-unit').value;
        const outEl = document.getElementById('conv-to-val');

        if (isNaN(val)) { outEl.value = ''; return; }

        if (cat === 'temp') {
            const u = unitDefinitions.temp.units;
            let celsius;
            if (u[fromUnit] === 'C') celsius = val;
            else if (u[fromUnit] === 'F') celsius = (val - 32) * (5 / 9);
            else celsius = val - 273.15;

            let res;
            if (u[toUnit] === 'C') res = celsius;
            else if (u[toUnit] === 'F') res = (celsius * 9 / 5) + 32;
            else res = celsius + 273.15;

            outEl.value = parseFloat(res.toFixed(6));
            return;
        }

        const factorFrom = unitDefinitions[cat].units[fromUnit];
        const factorTo = unitDefinitions[cat].units[toUnit];
        const baseVal = val * factorFrom;
        const result = baseVal / factorTo;
        outEl.value = parseFloat(result.toPrecision(8));
    };

    // --- 3. Interactive 2D Function Grapher ---
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    const traceEl = document.getElementById('graph-trace');

    function compileMathExpr(exprStr) {
        let jsExpr = exprStr
            .replace(/\^/g, '**')
            .replace(/\bsin\b/g, 'Math.sin')
            .replace(/\bcos\b/g, 'Math.cos')
            .replace(/\btan\b/g, 'Math.tan')
            .replace(/\bsqrt\b/g, 'Math.sqrt')
            .replace(/\blog\b/g, 'Math.log10')
            .replace(/\bln\b/g, 'Math.log')
            .replace(/\bexp\b/g, 'Math.exp')
            .replace(/\babs\b/g, 'Math.abs')
            .replace(/\bpi\b/gi, 'Math.PI')
            .replace(/\be\b/g, 'Math.E');
        return new Function('x', `try { return ${jsExpr}; } catch(e) { return NaN; }`);
    }

    window.setPresetGraph = function(expr) {
        document.getElementById('graph-expr').value = expr;
        drawGraph();
    };

    window.zoomGraph = function(factor) {
        const xIn = document.getElementById('graph-x-range');
        const yIn = document.getElementById('graph-y-range');
        xIn.value = Math.max(1, parseFloat((parseFloat(xIn.value) * factor).toFixed(2)));
        yIn.value = Math.max(1, parseFloat((parseFloat(yIn.value) * factor).toFixed(2)));
        drawGraph();
    };

    window.resetGraph = function() {
        document.getElementById('graph-x-range').value = 10;
        document.getElementById('graph-y-range').value = 5;
        drawGraph();
    };

    window.drawGraph = function() {
        const w = canvas.width;
        const h = canvas.height;
        const xMax = Math.abs(parseFloat(document.getElementById('graph-x-range').value)) || 10;
        const yMax = Math.abs(parseFloat(document.getElementById('graph-y-range').value)) || 5;
        const expr = document.getElementById('graph-expr').value;
        const fn = compileMathExpr(expr);

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        const toPxX = x => ((x + xMax) / (2 * xMax)) * w;
        const toPxY = y => h - ((y + yMax) / (2 * yMax)) * h;

        // Gridlines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.font = '11px monospace';
        ctx.fillStyle = '#64748b';

        const xStep = Math.pow(10, Math.floor(Math.log10(xMax))) / 2;
        for (let x = -xMax; x <= xMax; x += xStep) {
            const gx = Math.round(x * 1000) / 1000;
            const px = toPxX(gx);
            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, h);
            ctx.stroke();
            if (gx !== 0) ctx.fillText(gx, px + 3, toPxY(0) - 4);
        }

        const yStep = Math.pow(10, Math.floor(Math.log10(yMax))) / 2;
        for (let y = -yMax; y <= yMax; y += yStep) {
            const gy = Math.round(y * 1000) / 1000;
            const py = toPxY(gy);
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(w, py);
            ctx.stroke();
            if (gy !== 0) ctx.fillText(gy, toPxX(0) + 5, py - 3);
        }

        // Main Axes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, toPxY(0));
        ctx.lineTo(w, toPxY(0));
        ctx.moveTo(toPxX(0), 0);
        ctx.lineTo(toPxX(0), h);
        ctx.stroke();

        // Plot Function Curve
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let penDown = false;

        for (let px = 0; px <= w; px++) {
            const x = ((px / w) * 2 * xMax) - xMax;
            const y = fn(x);
            if (!isFinite(y) || isNaN(y) || Math.abs(y) > yMax * 5) {
                penDown = false;
                continue;
            }
            const py = toPxY(y);
            if (!penDown) {
                ctx.moveTo(px, py);
                penDown = true;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
    };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const px = (e.clientX - rect.left) * scaleX;
        const xMax = Math.abs(parseFloat(document.getElementById('graph-x-range').value)) || 10;
        const x = ((px / canvas.width) * 2 * xMax) - xMax;
        const fn = compileMathExpr(document.getElementById('graph-expr').value);
        const y = fn(x);
        traceEl.textContent = `x = ${x.toFixed(3)}, f(x) = ${isFinite(y) ? y.toFixed(4) : 'undef'}`;
    });

    // Initialize App State
    populateUnitDropdowns();
    saveAndRefresh();
});if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js'); }); }