import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
	selector: 'app-name-entry',
	templateUrl: './name-entry.component.html',
	styleUrls: ['./name-entry.component.scss']
})
export class NameEntryComponent {
	constructor(public appComponent: AppComponent){}
}
