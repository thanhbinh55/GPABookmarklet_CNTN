# HCMUS GPA & Timetable Bookmarklet (CNTN Edition)

A powerful bookmarklet tool for HCMUS students to calculate GPA, plan timetables, simulate future courses, and export transcripts, optimized for the CNTN program.

## Features

- **GPA Calculator (`pid=211`)**:
  - Calculate cumulative and semester GPA (10-point, 4.0-scale, and letter grades).
  - Simulate future semesters & customize grade targets.
  - Visualize GPA progression with trend charts.
  - Save/Export selected courses list to CSV or print academic transcript to PDF.
  - Automatically persist simulation and edited grades in LocalStorage per semester.
- **Timetable Planner (`pid=327`)**:
  - Plan timetables from the open courses page.
  - Select specific exercise class (BT) or practice class (TH) shifts.
  - Support custom max credits limit and campus selection.
  - Warning for scheduling conflicts (overlapping shifts).
  - Full-grid timetable including Sunday support.
- **Registration Schedule Viewer (`pid=212`)**:
  - Draw timetable directly from registered courses on the "Kết quả ĐKHP" page.

## Guideline

1. **Visit the Hosted Tool Page**: Open **[GPA HCMUS Tool (CNTN)](https://thanhbinh55.github.io/GPABookmarklet_CNTN/)**
2. **Install Bookmarklet**: Drag & drop the **KHTN GPA** button to your browser's Bookmark bar (press `Ctrl+Shift+B` or `Cmd+Shift+B` to show the bar).
3. **Use on Portal**: Navigate to one of the supported pages on Portal HCMUS (e.g., *Tra cứu kết quả học tập*, *Danh sách lớp mở*, *Kết quả ĐKHP*) and click the Bookmarklet button.

## Local Development & Customization

To bundle changes from `gpa.js`, `tkb.js`, and `ketqua_dkhp.js` into `index.html`:

```bash
python3 build_bookmarklet.py
```

## Credits & License

- Forked from [@dtrung98](https://github.com/dtrung98/GPABookmarklet), [@DreamyWanderer](https://github.com/DreamyWanderer/GPABookmarklet_Maintanence), and [@dorayakiiiiz](https://github.com/dorayakiiiiz/GPABookmarklet).
- Developed & maintained by [@thanhbinh55](https://github.com/thanhbinh55).
- License: **GNU GPL v3.0**.
