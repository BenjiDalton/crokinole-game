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
	private _players: PlayerComponent[];
	private world: WorldComponent;
	public fillScoreboard: boolean = false;
	public notifications: { message: string; color: string }[] = [];
	public displayPopUp: boolean = false;
	private gameStateSubscription: Subscription;
	
	constructor(private physicsService: PhysicsService, private gameState: GameStateService) {
	}
	ngAfterViewInit(): void {
		this.physicsService.renderElement = this.gameAreaElement.nativeElement;
		this.world = new WorldComponent(this.physicsService, this.gameState);
		this.world.create();
		// this.openPlayerInput();

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
		modal.style.display = 'none';
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
	public playerBallsRemaining(player: PlayerComponent): any[] {
		let specificPlayer: any | undefined = this._players.find(p => p === player);
		let indexOffset = 1;
		if (specificPlayer.ballType === 'stripes') {
			indexOffset = 8;
		}
		let totalBalls = 8;
		const ballsRemaining = Array(totalBalls)
		.fill(null)
		.map((_, index) => {
			const ballNumber = index + indexOffset;
			return specificPlayer.ballsRemaining.ballNumber.includes(ballNumber) ? ballNumber : null;
		});
		return ballsRemaining
	}
	public playerBallType(player: PlayerComponent): string {
		let specificPlayer: any | undefined = this._players.find(p => p === player);
		return specificPlayer.ballType
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
