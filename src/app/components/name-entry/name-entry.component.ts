import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-name-entry',
  templateUrl: './name-entry.component.html',
  styleUrls: ['./name-entry.component.scss']
})
export class NameEntryComponent implements OnInit {

  constructor(public appComponent: AppComponent) { }

  ngOnInit() {
  }

}
