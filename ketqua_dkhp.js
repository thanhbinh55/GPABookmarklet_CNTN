javascript: (function ketQuaDkhpModule() {
    window._initKetQuaDkhp = function () {
        const portalReg = /(new-)?portal\d*\.hcmus\.edu\.vn/i;
        if (!window.location.hostname.match(portalReg)) {
            alert("Vui lòng sử dụng Tool trên website HCMUS Portal!");
            return;
        }

        const pidReg = /pid=212/i;
        if (!window.location.href.match(pidReg)) {
            alert("Vui lòng đi tới trang \"Kết quả ĐKHP\" trước");
            return;
        }

        let tabApproved = $("#tbPDTKQ");
        let tabRegistered = $("#tbSVKQ");
        if (!tabApproved.length && !tabRegistered.length) return;

        // Fix layout widths
        $('<style>#page-body{display:flex!important;align-items:stretch!important}#page-body-menu{height:auto!important;min-height:100%!important;flex-shrink:0!important}#page-body-content{flex-grow:1!important;min-width:0!important}#tbPDTKQ, #tbSVKQ{width:100%!important;margin:0!important}.ob_iBOv{display:none!important}</style>').appendTo('head');

        const COURSE_PALETTES = [
            { bg: "#e0f2fe", text: "#0369a1", roomText: "#0284c7" }, // Sky Blue
            { bg: "#fef3c7", text: "#b45309", roomText: "#d97706" }, // Warm Amber
            { bg: "#dcfce7", text: "#15803d", roomText: "#16a34a" }, // Soft Mint
            { bg: "#f3e8ff", text: "#6b21a8", roomText: "#7e22ce" }, // Lavender
            { bg: "#ffe4e6", text: "#be123c", roomText: "#e11d48" }, // Coral Rose
            { bg: "#ccfbf1", text: "#0f766e", roomText: "#0d9488" }, // Teal
            { bg: "#ffedd5", text: "#c2410c", roomText: "#ea580c" }, // Peach / Orange
            { bg: "#e0e7ff", text: "#4338ca", roomText: "#4f46e5" }, // Indigo
            { bg: "#fae8ff", text: "#86198f", roomText: "#a21caf" }, // Orchid
            { bg: "#ecfccb", text: "#4d7c0f", roomText: "#65a30d" }, // Lime
            { bg: "#f1f5f9", text: "#334155", roomText: "#475569" }, // Slate
            { bg: "#fee2e2", text: "#991b1b", roomText: "#dc2626" }  // Light Crimson
        ];

        // Parse schedule string e.g. "T7(3-5)" or "T3(2-5)-P.cs2:NĐH6.7"
        function parseSchedule(str) {
            if (!str) return [];
            let result = [];
            let regex = /T([2-7]|CN)\(([\d\.]+)-([\d\.]+)\)(?:-P\.([^,\;]+))?/gi;
            let match;
            while ((match = regex.exec(str)) !== null) {
                let dayStr = match[1];
                let dayNum = dayStr === "CN" ? 8 : parseInt(dayStr);
                let startPeriod = parseFloat(match[2]);
                let endPeriod = parseFloat(match[3]);
                let room = match[4] ? match[4].trim() : "Chưa có phòng";

                result.push({
                    dayStr: "Thứ " + (dayStr === "CN" ? "CN" : dayStr),
                    dayNum: dayNum,
                    startPeriod: startPeriod,
                    endPeriod: endPeriod,
                    room: room
                });
            }
            return result;
        }

        // Collect all course objects from page tables
        function collectPageCourses() {
            let courses = [];

            // 1. From #tbPDTKQ (Danh sách môn học đã được duyệt)
            if ($('#tbPDTKQ tbody tr').length) {
                $('#tbPDTKQ tbody tr').each(function () {
                    let tds = $(this).find('td');
                    if (tds.length < 5) return;
                    let code = $(tds[0]).text().trim();
                    let courseName = $(tds[1]).text().trim();
                    let className = $(tds[2]).text().trim();
                    let scheduleStr = $(tds[4]).text().trim();

                    if (code && courseName && scheduleStr && scheduleStr !== "Chưa có môn học được duyệt.") {
                        let id = 'approved_' + code + '_' + className;
                        courses.push({
                            id: id,
                            code: code,
                            courseName: courseName,
                            className: className,
                            scheduleStr: scheduleStr,
                            tableType: 'approved'
                        });
                    }
                });
            }

            // 2. From #tbSVKQ (Danh sách môn học đã đăng ký)
            if ($('#tbSVKQ tbody tr').length) {
                $('#tbSVKQ tbody tr').each(function () {
                    let tds = $(this).find('td');
                    if (tds.length < 6) return;
                    let code = $(tds[0]).text().trim();
                    let courseName = $(tds[1]).text().trim();
                    let className = $(tds[2]).text().trim();
                    let scheduleStr = $(tds[5]).text().trim();

                    if (code && courseName && scheduleStr && scheduleStr !== "Sinh viên chưa đăng ký môn học.") {
                        let id = 'registered_' + code + '_' + className;
                        courses.push({
                            id: id,
                            code: code,
                            courseName: courseName,
                            className: className,
                            scheduleStr: scheduleStr,
                            tableType: 'registered'
                        });
                    }
                });
            }

            return courses;
        }

        // Render Weekly Timetable Grid & Summary Panel
        function renderTkbPanel() {
            $('#gpaTkbFieldSet').remove();

            let courses = collectPageCourses();

            // Auto-detect campus from room names in the schedule
            let defaultCampus = 'LT';
            for (let i = 0; i < courses.length; i++) {
                let schedules = parseSchedule(courses[i].scheduleStr);
                let foundNvc = false;
                for (let j = 0; j < schedules.length; j++) {
                    let room = schedules[j].room;
                    if (room) {
                        let upperRoom = room.toUpperCase();
                        if (upperRoom.includes('CS1') || upperRoom.includes('NVC') || upperRoom.includes('NGUYỄN VĂN CỪ')) {
                            defaultCampus = 'NVC';
                            foundNvc = true;
                            break;
                        }
                        if (!upperRoom.includes('CS2') && !upperRoom.includes('NĐH') && /^[A-I]\./.test(room)) {
                            defaultCampus = 'NVC';
                            foundNvc = true;
                            break;
                        }
                    }
                }
                if (foundNvc) break;
            }

            let savedCampus = localStorage.getItem('gpa_tkb_campus') || defaultCampus;

            let panelHtml = `
            <fieldset id="gpaTkbFieldSet" style="margin-top: 15px; margin-bottom: 15px; border: 1px solid #CCCCCC; padding: 10px 15px; background: menu;">
                <legend>Thời khóa biểu</legend>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                    <div id="gpaTkbSummary" style="font-size: 14px; color: #000; font-weight: normal; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>Tổng số: <span id="gpaTkbClassCount" style="font-weight: bold;">${courses.length} môn học</span></span>
                        <span style="border-left: 1px solid #ccc; padding-left: 10px; margin-left: 10px; display: inline-flex; align-items: center; gap: 5px;">
                            Cơ sở:
                            <select id="gpaTkbCampus" style="padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 13px; font-family: inherit; background: #fff; vertical-align: middle;">
                                <option value="LT" ${savedCampus === 'LT' ? 'selected' : ''}>Linh Trung (10 tiết)</option>
                                <option value="NVC" ${savedCampus === 'NVC' ? 'selected' : ''}>Nguyễn Văn Cừ (15 tiết)</option>
                            </select>
                        </span>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table id="gpaTkbGrid" style="width: 100%; table-layout: fixed; border-collapse: collapse; background: #fff; text-align: center; font-size: 14px; border: 1px solid #CCCCCC;">
                        <colgroup>
                            <col style="width: 65px;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                            <col style="width: 13.3%;">
                        </colgroup>
                        <thead>
                            <tr style="background: #f2f2f2; height: 28px; font-weight: normal;">
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Tiết</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 2</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 3</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 4</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 5</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 6</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal;">Thứ 7</th>
                                <th style="border: 1px solid #CCCCCC; font-weight: normal; color: red;">Chủ Nhật</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </fieldset>`;

            if ($('#ketqua-dkhp').length) {
                $(panelHtml).insertBefore('#ketqua-dkhp');
            } else if ($('#ctl00_ContentPlaceHolder1_ctl00_fs_DS_Mon_DaDuyet').length) {
                $(panelHtml).insertBefore('#ctl00_ContentPlaceHolder1_ctl00_fs_DS_Mon_DaDuyet');
            } else {
                $('#page-body-content').prepend(panelHtml);
            }

            // Set up the campus change listener
            $(document).off('change', '#gpaTkbCampus');
            $(document).on('change', '#gpaTkbCampus', function () {
                let val = $(this).val();
                localStorage.setItem('gpa_tkb_campus', val);
                renderTkbPanel();
            });

            let courseColorMap = {};
            let colorIdx = 0;
            courses.forEach(item => {
                let key = item.id || (item.code + '_' + item.className);
                if (!(key in courseColorMap)) {
                    courseColorMap[key] = COURSE_PALETTES[colorIdx % COURSE_PALETTES.length];
                    colorIdx++;
                }
            });

            // Determine max periods
            let maxPeriods = (savedCampus === 'NVC') ? 15 : 10;

            const PERIOD_TIMES = {
                LT: {
                    1: "07:30-08:20",
                    2: "08:20-09:10",
                    3: "09:10-10:00",
                    4: "10:10-11:00",
                    5: "11:00-11:50",
                    6: "12:40-13:30",
                    7: "13:30-14:20",
                    8: "14:20-15:10",
                    9: "15:20-16:10",
                    10: "16:10-17:00"
                },
                NVC: {
                    1: "07:00-07:50",
                    2: "07:50-08:40",
                    3: "08:40-09:30",
                    4: "09:40-10:30",
                    5: "10:30-11:20",
                    6: "11:20-12:10",
                    7: "12:50-13:40",
                    8: "13:40-14:30",
                    9: "14:30-15:20",
                    10: "15:30-16:20",
                    11: "16:20-17:10",
                    12: "17:10-18:00",
                    13: "18:00-18:50",
                    14: "18:50-19:40",
                    15: "19:40-20:30"
                }
            };

            // Build Grid Map (Tiết 1 to maxPeriods x Thứ 2 to 8)
            let gridMap = {};
            let occupied = {};
            for (let d = 2; d <= 8; d++) {
                gridMap[d] = {};
                occupied[d] = {};
                for (let p = 1; p <= maxPeriods; p++) {
                    occupied[d][p] = false;
                }
            }

            courses.forEach(item => {
                let key = item.id || (item.code + '_' + item.className);
                let palette = courseColorMap[key] || COURSE_PALETTES[0];
                let schedules = parseSchedule(item.scheduleStr);

                schedules.forEach(s => {
                    if (s.dayNum >= 2 && s.dayNum <= 8) {
                        let start = Math.max(1, Math.floor(s.startPeriod));
                        let end = Math.min(maxPeriods, Math.floor(s.endPeriod));
                        let span = Math.max(1, end - start + 1);

                        gridMap[s.dayNum][start] = {
                            courseName: item.courseName,
                            className: item.className,
                            room: s.room,
                            span: span,
                            palette: palette
                        };
                    }
                });
            });

            // Build <tbody> HTML
            let tbodyHtml = '';
            for (let p = 1; p <= maxPeriods; p++) {
                let timeStr = (PERIOD_TIMES[savedCampus] && PERIOD_TIMES[savedCampus][p]) ? PERIOD_TIMES[savedCampus][p] : '';
                tbodyHtml += `<tr style="height: 32px;">
                    <td style="border: 1px solid #CCCCCC; font-weight: normal; background: #fafafa; padding: 4px; font-size: 11px; line-height: 1.2;">
                        Tiết ${p}<br><span style="color: #666; font-size: 9px; font-weight: normal;">${timeStr}</span>
                    </td>`;
                for (let d = 2; d <= 8; d++) {
                    if (occupied[d][p]) continue;

                    let cellData = gridMap[d][p];
                    if (cellData) {
                        let span = cellData.span;
                        let palette = cellData.palette;
                        for (let k = p; k < p + span && k <= maxPeriods; k++) {
                            occupied[d][k] = true;
                        }
                        tbodyHtml += `<td rowspan="${span}" style="border: 1px solid #CCCCCC; background: ${palette.bg}; color: ${palette.text}; vertical-align: middle; padding: 4px; font-size: 14px; text-align: center; line-height: 1.35; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                            ${cellData.courseName}<br>(${cellData.className})<br><span style="color: ${palette.roomText}; font-size: 11.5px;">${cellData.room}</span>
                        </td>`;
                    } else {
                        tbodyHtml += `<td style="border: 1px solid #CCCCCC;"></td>`;
                    }
                }
                tbodyHtml += `</tr>`;
            }

            $('#gpaTkbGrid tbody').html(tbodyHtml);
        }

        renderTkbPanel();
    };
})();
