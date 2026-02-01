import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface StudentInfo {
  serialNumber: number;
  name: string;
  seatNumber: number;
  grade: string;
  school?: string;
}

interface Subject {
  name: string;
  score: number;
  color: string;
  description: string;
}

interface StudentResult {
  info: StudentInfo;
  subjects: Subject[];
  otherActivities: { [key: string]: string };
  administrators: string[];
  finalResult: string;
}

@Component({
  selector: 'app-excel-reader',
  standalone: true,
  templateUrl: './excel-reader.component.html',
  styleUrls: ['./excel-reader.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class ExcelReaderComponent implements OnInit {
  studentResult: StudentResult | null = null;
  selectedGrade: string = '';
  headers: any[] = [];
  data: any[][] = [];

  // Make Object available in template
  Object = Object;

  // Column mapping for different grades
  // Grades 1-2: Use National ID (column 2) as search key
  // Grades 3-6: Use Seat Number (column 2) as search key
  private columnMapping: { [key: string]: any } = {
    '1': { searchKeyColumn: 2, searchKeyType: 'nationalId', name: 3, grade: 4, school: 1, subjectsStart: 5, subjectColumnCount: 2 },
    '2': { searchKeyColumn: 2, searchKeyType: 'nationalId', name: 3, grade: 4, school: 1, subjectsStart: 5, subjectColumnCount: 2 },
    '3': { searchKeyColumn: 2, searchKeyType: 'seatNumber', name: 4, grade: 3, school: 1, subjectsStart: 5, subjectColumnCount: 3 },
    '4': { searchKeyColumn: 2, searchKeyType: 'seatNumber', name: 1, grade: 3, school: 4, subjectsStart: 5, subjectColumnCount: 3 },
    '5': { searchKeyColumn: 2, searchKeyType: 'seatNumber', name: 4, grade: 3, school: 1, subjectsStart: 5, subjectColumnCount: 3 },
    '6': { searchKeyColumn: 2, searchKeyType: 'seatNumber', name: 4, grade: 3, school: 1, subjectsStart: 5, subjectColumnCount: 3 }
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  find(num: any): void {
    if (!this.selectedGrade) {
      alert('رجاء اختر الصف الدراسي');
      return;
    }

    this.loadExcel(() => {
      const mapping = this.columnMapping[this.selectedGrade];
      const foundRow = this.data.find(row => row && row[mapping.searchKeyColumn] == num);

      if (!foundRow) {
        const searchType = mapping.searchKeyType === 'nationalId' ? 'الرقم القومى' : 'رقم الجلوس';
        alert(`${searchType} غير موجود`);
        this.studentResult = null;
        return;
      }

      this.studentResult = this.parseStudentResult(foundRow);
    });
  }

  private parseStudentResult(row: any[]): StudentResult {
    const mapping = this.columnMapping[this.selectedGrade];

    // Extract student info
    const info: StudentInfo = {
      serialNumber: row[0],
      name: row[mapping.name],
      seatNumber: row[mapping.searchKeyColumn], // This will be National ID for grades 1-2, Seat Number for 3-6
      grade: row[mapping.grade],
      school: mapping.school !== null ? row[mapping.school] : undefined
    };

    // Parse subjects (column count varies by grade)
    const subjects: Subject[] = [];
    const subjectNames = this.getSubjectNames();
    let currentCol = mapping.subjectsStart;
    const colsPerSubject = mapping.subjectColumnCount;

    for (const subjectName of subjectNames) {
      if (currentCol < row.length && row[currentCol] !== undefined) {
        if (colsPerSubject === 2) {
          // Grades 1-2: score, color only
          subjects.push({
            name: subjectName,
            score: row[currentCol],
            color: row[currentCol + 1] || '',
            description: ''
          });
          currentCol += 2;
        } else {
          // Grades 3-6: score, color, description
          subjects.push({
            name: subjectName,
            score: row[currentCol],
            color: row[currentCol + 1] || '',
            description: row[currentCol + 2] || ''
          });
          currentCol += 3;
        }
      } else {
        break;
      }
    }

    // Extract other activities (pass/fail subjects)
    const otherActivities: { [key: string]: string } = {};
    let activityNames: string[] = [];

    // Grade 3 has different activities than grades 4-6
    if (this.selectedGrade === '3') {
      activityNames = ['متعدد التخصصات', 'التربية البدنية', 'التوكاتسو'];
    } else if (this.selectedGrade === '4' || this.selectedGrade === '5' || this.selectedGrade === '6') {
      activityNames = ['مهارات', 'تربية بدنية', 'رسم', 'موسيقى', 'توكاتسو'];
    }

    for (const activity of activityNames) {
      const headerIndex = this.headers.findIndex(h => h && h.includes(activity));
      if (headerIndex !== -1 && row[headerIndex]) {
        otherActivities[activity] = row[headerIndex];
      }
    }

    // Extract final result and administrators
    const resultIndex = this.headers.findIndex(h =>
      h && (h.includes('نتيجة') || h.includes('النتيجة'))
    );
    const finalResult = resultIndex !== -1 ? row[resultIndex] : '';

    const administrators: string[] = [];
    const adminStartIndex = this.headers.findIndex(h =>
      h && (h.includes('المدير') || h.includes('مدير'))
    );

    if (adminStartIndex !== -1) {
      for (let i = adminStartIndex; i < Math.min(adminStartIndex + 3, row.length); i++) {
        if (row[i]) {
          administrators.push(row[i]);
        }
      }
    }

    return {
      info,
      subjects,
      otherActivities,
      administrators,
      finalResult
    };
  }

  private getSubjectNames(): string[] {
    // Different subjects for different grades
    if (this.selectedGrade === '1' || this.selectedGrade === '2') {
      return [
        'اللغة العربية',
        'اللغة الانجليزية',
        'الرياضيات',
        'التربية الدينية',
        'متعدد التخصصات',
        'التربية البدنية',
        'التوكاتسو'
      ];
    } else if (this.selectedGrade === '3') {
      return [
        'اللغة العربية',
        'الرياضيات',
        'اللغة الانجليزية',
        'المجموع الكلى',
        'التربية الدينية'
      ];
    } else {
      // Grades 4, 5, 6
      return [
        'اللغة العربية',
        'الرياضيات',
        'الدراسات',
        'العلـوم',
        'اللغة الانجليزية',
        'المجموع الكلي',
        'التربية الدينية',
        'ICT'
      ];
    }
  }

  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'أزرق': 'blue',
      'أخضر': 'green',
      'أصفر': 'yellow',
      'أحمر': 'red'
    };
    return colorMap[color] || '';
  }

  getSearchPlaceholder(): string {
    if (!this.selectedGrade) {
      return 'اختر الصف أولاً';
    }
    const mapping = this.columnMapping[this.selectedGrade];
    return mapping.searchKeyType === 'nationalId' ? 'الرقم القومى' : 'رقم الجلوس';
  }

  loadExcel(callback?: () => void): void {
    const filePath = `/${this.selectedGrade}.xlsx`;
    const oReq = new XMLHttpRequest();
    oReq.open('GET', filePath, true);
    oReq.responseType = 'arraybuffer';

    oReq.onload = () => {
      const arraybuffer = oReq.response;
      const data = new Uint8Array(arraybuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      this.headers = sheetJson[0] ?? [];
      this.data = sheetJson.slice(1);

      if (callback) callback();
    };

    oReq.send();
  }
}
