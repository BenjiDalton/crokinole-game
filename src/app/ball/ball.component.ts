import { Component } from '@angular/core';

@Component({
  selector: 'app-ball',
  templateUrl: './ball.component.html',
  styleUrls: ['./ball.component.scss']
})
export class BallComponent {
	constructor() {}
	private _category: string | "striped" | "solid";
	private _number: any;
	
	
	set category(value: string | "striped" | "solid") {
		this._category=value;
	}
	get category(): string {
		return this._category
	}
	
	set number(value: number) {
		if (value >= 1 && value <= 15) {
			this._number=value;
		  } else {
			console.log('ERROR: ', value, 'is an invalid number. Please enter a value between 1 and 15.')
		  }
	}
	get number(): any {
		return this._number
	}
	
}
