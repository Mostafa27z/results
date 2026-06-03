import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface StudentInfo {
  serialNumber: number;
  name: string;
  seatNumber: string;
  nationalId?: string;
  grade: string;
  school?: string;
}

interface Subject {
  name: string;
  score: string | number;
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
  allRows: any[][] = [];

  // Make Object available in template
  Object = Object;

  // Column indices for each grade (0-indexed)
  private columnMapping: { [key: string]: any } = {
    '1': {
      searchKeyColumn: 1, // الرقم القومى
      searchKeyType: 'nationalId',
      serialNumber: 0,   // م
      name: 2,           // اسم الطالب
      grade: 3,          // الصف
      school: 4,         // المدرسة
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: -1 },
        { name: 'اللغة الانجليزية', scoreCol: 7, colorCol: 8, descCol: -1 },
        { name: 'الرياضيات', scoreCol: 9, colorCol: 10, descCol: -1 },
        { name: 'التربية الدينية', scoreCol: 11, colorCol: 12, descCol: -1 },
        { name: 'متعدد التخصصات', scoreCol: 13, colorCol: 14, descCol: -1 },
        { name: 'التربية البدنية', scoreCol: 15, colorCol: 16, descCol: -1 },
        { name: 'التوكاتسو', scoreCol: 17, colorCol: 18, descCol: -1 }
      ],
      resultCol: 19,     // نتيجة الطالب
      adminCol: 20       // مدير المدرسة
    },
    '2': {
      searchKeyColumn: 1, // الرقم القومى
      searchKeyType: 'nationalId',
      serialNumber: 0,   // م
      name: 2,           // اسم الطالب
      grade: 3,          // الصف
      school: 4,         // المدرسة
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: -1 },
        { name: 'اللغة الانجليزية', scoreCol: 7, colorCol: 8, descCol: -1 },
        { name: 'الرياضيات', scoreCol: 9, colorCol: 10, descCol: -1 },
        { name: 'التربية الدينية', scoreCol: 11, colorCol: 12, descCol: -1 },
        { name: 'متعدد التخصصات', scoreCol: 13, colorCol: 14, descCol: -1 },
        { name: 'التربية البدنية', scoreCol: 15, colorCol: 16, descCol: -1 },
        { name: 'التوكاتسو', scoreCol: 17, colorCol: 18, descCol: -1 }
      ],
      resultCol: 19,     // نتيجة الطالب
      adminCol: 20       // مدير المدرسة
    },
    '3': {
      searchKeyColumn: 1, // رقم الجلوس
      searchKeyType: 'seatNumber',
      serialNumber: 0,
      name: 2,           // اسم الطالب
      grade: 3,          // الصف
      school: 4,         // المدرسة
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: 7 },
        { name: 'الرياضيات', scoreCol: 8, colorCol: 9, descCol: 10 },
        { name: 'اللغة الانجليزية', scoreCol: 11, colorCol: 12, descCol: 13 },
        { name: 'المجموع الكلى', scoreCol: 14, colorCol: 15, descCol: 16 },
        { name: 'التربية الدينية', scoreCol: 17, colorCol: 18, descCol: 19 }
      ],
      resultCol: 20,
      adminCol: 21
    },
    '4': {
      searchKeyColumn: 1, // رقم الجلوس
      searchKeyType: 'seatNumber',
      serialNumber: 0,
      name: 2,           // اسم الطالب
      grade: 3,          // الصف
      school: 4,         // المدرسة
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: 7 },
        { name: 'الرياضيات', scoreCol: 8, colorCol: 9, descCol: 10 },
        { name: 'الدراسات', scoreCol: 11, colorCol: 12, descCol: 13 },
        { name: 'العلـوم', scoreCol: 14, colorCol: 15, descCol: 16 },
        { name: 'اللغة الانجليزية', scoreCol: 17, colorCol: 18, descCol: 19 },
        { name: 'المجموع الكلي', scoreCol: 20, colorCol: 21, descCol: 22 },
        { name: 'التربية الدينية', scoreCol: 23, colorCol: 24, descCol: 25 },
        { name: 'ICT', scoreCol: 26, colorCol: 27, descCol: 28 }
      ],
      activities: [
        { name: 'المهارات المهنية', col: 29 },
        { name: 'التربية البدنية', col: 30 },
        { name: 'التربية الفنية', col: 31 },
        { name: 'التربية الموسيقية', col: 32 },
        { name: 'التوكاتسو', col: 33 }
      ],
      resultCol: 34,
      adminCol: 35
    },
    '5': {
      searchKeyColumn: 1,
      searchKeyType: 'seatNumber',
      serialNumber: 0,
      name: 2,
      grade: 3,
      school: 4,
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: 7 },
        { name: 'الرياضيات', scoreCol: 8, colorCol: 9, descCol: 10 },
        { name: 'الدراسات', scoreCol: 11, colorCol: 12, descCol: 13 },
        { name: 'العلـوم', scoreCol: 14, colorCol: 15, descCol: 16 },
        { name: 'اللغة الانجليزية', scoreCol: 17, colorCol: 18, descCol: 19 },
        { name: 'المجموع الكلي', scoreCol: 20, colorCol: 21, descCol: 22 },
        { name: 'التربية الدينية', scoreCol: 23, colorCol: 24, descCol: 25 },
        { name: 'ICT', scoreCol: 26, colorCol: 27, descCol: 28 }
      ],
      activities: [
        { name: 'المهارات المهنية', col: 29 },
        { name: 'التربية البدنية', col: 30 },
        { name: 'التربية الفنية', col: 31 },
        { name: 'التربية الموسيقية', col: 32 },
        { name: 'التوكاتسو', col: 33 }
      ],
      resultCol: 34,
      adminCol: 35
    },
    '6': {
      searchKeyColumn: 1,
      searchKeyType: 'seatNumber',
      serialNumber: 0,
      name: 2,
      grade: 3,
      school: 4,
      subjects: [
        { name: 'اللغة العربية', scoreCol: 5, colorCol: 6, descCol: 7 },
        { name: 'الرياضيات', scoreCol: 8, colorCol: 9, descCol: 10 },
        { name: 'الدراسات', scoreCol: 11, colorCol: 12, descCol: 13 },
        { name: 'العلـوم', scoreCol: 14, colorCol: 15, descCol: 16 },
        { name: 'اللغة الانجليزية', scoreCol: 17, colorCol: 18, descCol: 19 },
        { name: 'المجموع الكلي', scoreCol: 20, colorCol: 21, descCol: 22 },
        { name: 'التربية الدينية', scoreCol: 23, colorCol: 24, descCol: 25 },
        { name: 'ICT', scoreCol: 26, colorCol: 27, descCol: 28 }
      ],
      activities: [
        { name: 'المهارات المهنية', col: 29 },
        { name: 'التربية البدنية', col: 30 },
        { name: 'التربية الفنية', col: 31 },
        { name: 'التربية الموسيقية', col: 32 },
        { name: 'التوكاتسو', col: 33 }
      ],
      resultCol: 34,
      adminCol: 35
    }
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
      const searchCol = mapping.searchKeyColumn;
      
      // Find the row where the search column matches the input
      const foundRow = this.allRows.find(row => {
        if (!row || row.length <= searchCol) return false;
        const cellValue = String(row[searchCol] || '').trim();
        return cellValue === String(num).trim();
      });

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
      serialNumber: row[mapping.serialNumber] || 0,
      name: row[mapping.name] || '',
      seatNumber: row[mapping.searchKeyColumn] || '',
      grade: row[mapping.grade] || '',
      school: row[mapping.school] || undefined
    };

    if (mapping.searchKeyType === 'nationalId') {
      info.nationalId = row[mapping.searchKeyColumn];
    }

    // Parse subjects based on mapping
    const subjects: Subject[] = [];
    for (const subjectConfig of mapping.subjects) {
      const score = row[subjectConfig.scoreCol] || '';
      const color = row[subjectConfig.colorCol] || '';
      const description = subjectConfig.descCol >= 0 ? row[subjectConfig.descCol] || '' : '';

      subjects.push({
        name: subjectConfig.name,
        score: score,
        color: color,
        description: description
      });
    }

    // Extract other activities (for grades 4-6)
    const otherActivities: { [key: string]: string } = {};
    if (mapping.activities) {
      for (const activity of mapping.activities) {
        const value = row[activity.col] || '';
        if (value) {
          otherActivities[activity.name] = value;
        }
      }
    }

    // Extract final result
    const finalResult = row[mapping.resultCol] || '';

    // Extract administrators
    const administrators: string[] = [];
    const adminIndex = mapping.adminCol;
    if (row[adminIndex]) {
      administrators.push(row[adminIndex]);
    }

    return {
      info,
      subjects,
      otherActivities,
      administrators,
      finalResult
    };
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

      // Skip the first 3 rows (header rows) and take only data rows
      this.allRows = sheetJson.slice(3).filter(row => {
        // Filter out empty rows
        return row && row.some(cell => cell !== null && cell !== undefined);
      });

      if (callback) callback();
    };

    oReq.send();
  }
}