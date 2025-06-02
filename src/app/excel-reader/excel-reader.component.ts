import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-excel-reader',
  imports: [CommonModule,HttpClientModule,FormsModule],
  templateUrl: './excel-reader.component.html',
  styleUrl: './excel-reader.component.scss'
})
export class ExcelReaderComponent implements OnInit {
  user:any = false;
selectedGrade: any = '';
// find(num: any) {
//   this.loadExcel()
//   if(Number(num) +2 > this.data.length){
//     alert("رقم الجلوس عير موجود")
//   }
// this.user= this.data[Number(num)+1];

// }
 data: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // this.loadExcel();
  }

  // loadExcel() {
  //   this.http.get(this.selectedGrade+ '.xlsx', { responseType: 'arraybuffer' }).subscribe((res: ArrayBuffer) => {
  //     const data = new Uint8Array(res);
  //     const workbook = XLSX.read(data, { type: 'array' });

  //     const firstSheet = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[firstSheet];

  //     this.data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // header: 1 => array of arrays
  //     console.log(this.data);
  //   });
  // }
 find(num: any) {
  if (this.selectedGrade === 'null' || this.selectedGrade === '') {
    alert('رجاء اختر الصف الدراسي');
    return;
  }

  this.loadExcel(() => {
    // ابحث عن الصف الذي يحتوي على الطالب برقم الجلوس المحدد
    const foundUser = this.data.find(row => row && row[2] == num);

    if (!foundUser) {
      alert("رقم الجلوس غير موجود");
      this.user = null;
      return;
    }

    this.user = foundUser;
  });
}


loadExcel(callback: Function) {
  this.http.get(`${this.selectedGrade}.xlsx`, { responseType: 'arraybuffer' }).subscribe((res: ArrayBuffer) => {
    const data = new Uint8Array(res);
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    this.data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    callback(); // ✅ شغّل الكود بعد تحميل البيانات
  });
}

  getStudentResult(data: any[][], seatNumber: number): string | null {
  // دور على الصف اللي فيه رؤوس الأعمدة
  const headerIndex = data.findIndex(row => row.includes("رقم الجلوس") || row.includes("رقم\r\n الجلوس"));

  if (headerIndex === -1) {
    console.error("لم يتم العثور على رؤوس الأعمدة.");
    return null;
  }

  const headers = data[headerIndex];
  const seatColIndex = headers.findIndex(cell => (cell || "").toString().includes("رقم الجلوس"));
  const resultColIndex = headers.findIndex(cell => (cell || "").toString().includes("النتيجة"));

  if (seatColIndex === -1 || resultColIndex === -1) {
    console.error("لم يتم العثور على عمود رقم الجلوس أو النتيجة.");
    return null;
  }

  // نبدأ من الصف اللي بعد رؤوس الأعمدة
  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (row[seatColIndex] === seatNumber) {
      return row[resultColIndex] || "لا توجد نتيجة";
    }
  }

  return "رقم الجلوس غير موجود";
}


}
