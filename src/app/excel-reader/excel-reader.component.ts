import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-excel-reader',
  standalone: true,
  templateUrl: './excel-reader.component.html',
  styleUrls: ['./excel-reader.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class ExcelReaderComponent implements OnInit {
  user: any = null;
  selectedGrade: string = '';
  headers: any[] = [];
  // حذف subHeaders لأن الملف لا يحتوي عليها
  tableData: any[][] = [];
  data: any[][] = [];
  mergedHeaders: { title: string; colspan: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  find(num: any): void {
    if (!this.selectedGrade) {
      alert('رجاء اختر الصف الدراسي');
      return;
    }

    this.loadExcel(() => {
      const foundUser = this.data.find(row => row && row[5] == num);
      if (!foundUser) {
        alert('رقم الجلوس غير موجود');
        this.user = null;
        return;
      }
      this.user = foundUser;
    });
  }

  mergeHeaders(): void {
    this.mergedHeaders = [];
    let i = 0;
    while (i < this.headers.length) {
      const title = this.headers[i] || this.headers[i - 1] || '';
      let colspan = 1;
      while (
        i + colspan < this.headers.length &&
        (!this.headers[i + colspan] || this.headers[i + colspan] === title)
      ) {
        colspan++;
      }
      this.mergedHeaders.push({ title, colspan });
      i += colspan;
    }
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
      // حذف التعامل مع subHeaders
      this.tableData = sheetJson.slice(1);
      this.data = sheetJson.slice(1);
      this.mergeHeaders();

      if (callback) callback();
    };

    oReq.send();
  }
}
