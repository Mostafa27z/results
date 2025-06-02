import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExcelReaderComponent } from './excel-reader/excel-reader.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet , ExcelReaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'result';
}

