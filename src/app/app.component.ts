import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PhysicsService } from './services/physics.service';
import { GameStateService } from './services/game-state.service';
import { PlayerComponent } from './player/player.component';
import { WorldComponent } from './world/world.component';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	@ViewChild('gameArea', { read: ElementRef }) gameAreaElement: ElementRef;
	@ViewChild('scoreBoardButton', { read: ElementRef }) scoreBoardButton: ElementRef;
	title = 'Crokinole';
	private _viewScoreboard: boolean = false;
	private _viewLog: boolean = false;
	public _players: PlayerComponent[];
	public world: WorldComponent;
	public fillScoreboard: boolean = false;
	public notifications: { message: string; color: string }[] = [];
	public displayPopUp: boolean = false;
	private gameStateSubscription: Subscription;
	
	constructor(private physicsService: PhysicsService, public gameState: GameStateService) {
	}
	ngAfterViewInit(): void {
		this.physicsService.renderElement = this.gameAreaElement.nativeElement;
		this.world = new WorldComponent(this.physicsService, this.gameState);
		this.world.create();
		this.openPlayerInput();

		this.gameStateSubscription = this.gameState.gameStateMessage.subscribe(result => {
			let message = result[0];
			let notificationColor = result[1]
			this.updatePlayerNotification(message, notificationColor);
		});
	}
	public openPlayerInput(): void {
		let modal = document.getElementById('playerInput') as HTMLElement;
		modal.style.display = 'block';
	}
	public closePlayerInput(): void {
		let modal = document.getElementById('playerInput') as HTMLElement;
		const playerNameEntry1 = document.querySelector('input[name="playerNameEntry1"]') as HTMLInputElement;
		const playerNameEntry2 = document.querySelector('input[name="playerNameEntry2"]') as HTMLInputElement;
		
		// Access the PlayerComponent instances from the _players dictionary and set the names
		if ( playerNameEntry1?.value ) {
			this.gameState.players.p1.name = playerNameEntry1?.value;
		} else {
			this.gameState.players.p1.name = 'Player 1';
		}
		if ( playerNameEntry2?.value ) {
			this.gameState.players.p2.name = playerNameEntry2?.value;
		} else {
			this.gameState.players.p2.name = 'Player 2';
		}
		modal.style.display = 'none';
		this.gameState.newGame();
		this._players = this.gameState.players;
	}
	public addPlayer(): void {
		const playerInputModal = document.querySelector('.content') as HTMLElement;
		const newInput = document.createElement('input');
		newInput.type = 'text';
		newInput.classList.add('content');
		playerInputModal.appendChild(newInput);
	}
	public newGame(): void {
		this.gameState.newGame();
		this._players = this.gameState.players;
		setTimeout(() => {
			this.fillScoreboard = true;
		});
	}
	public displayScoreboard(): void {
		this._viewScoreboard = !this._viewScoreboard;
	}
	public displayLog(): void {
		this._viewLog = !this._viewLog;
	}
	private updatePlayerNotification(message: string, notificationColor: any): void {
		this.notifications.push({ message, color: notificationColor });
		this.displayPopUp = true;
	}
	public updateScore(elementID: string, value: any): void {
		const inputElement = document.getElementById(elementID) as HTMLInputElement;
		const currentValue = parseInt(inputElement.value);
		inputElement.value = currentValue + value;
	}
	public get players() {
		return this._players
	}
	public get viewScoreboard() {
		return this._viewScoreboard
	}
	public get viewLog() {
		return this._viewLog
	}
}
