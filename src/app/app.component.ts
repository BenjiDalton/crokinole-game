import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BallComponent } from './ball/ball.component';
import { PhysicsService } from './services/physics.service';
import { GameStateService } from './services/game-state.service';
import { PlayerComponent } from './player/player.component';
import { Observable, Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	@ViewChild('gameArea', { read: ElementRef }) gameAreaElement: ElementRef;
	@ViewChild('scoreBoardButton', { read: ElementRef }) scoreBoardButton: ElementRef;
	title = 'poolwithbrooksie';
	private _viewScoreboard: boolean = false;
	private _viewLog: boolean = false;
	private _players: PlayerComponent[];
	public fillScoreboard: boolean = false;
	private scratchSubscription: Subscription;
	private ballRemovedSubscription: Subscription;
	
	constructor(private physicsService: PhysicsService, private gameState: GameStateService) {
	}
	ngAfterViewInit(): void {
		this.physicsService.renderElement = this.gameAreaElement.nativeElement;
		this.gameState.newGame();
		this.openPlayerInput();
		this._players = this.gameState.players;
		this.fillScoreboard = true;
		this.scratchSubscription = this.physicsService.scratchSubject.subscribe(message => {
			console.log('Received scratch notification:', message);
		});
		this.ballRemovedSubscription = this.physicsService.ballRemoved.subscribe(removedBall => {
			if (removedBall.label === 'poolBall 8') {
				const activeBalls = [];
				for (let player of this._players) {
					player.ballsRemaining.ballInfo.forEach((ball: any) => {
						activeBalls.push(ball);
					});
				};
				if (activeBalls.length > 2) {
					console.log('way to go dummy');
					// this.gameState.newGame();
				}
			};
			for (let player of this._players) {
				player.ballsRemaining.ballInfo.forEach((ball: any) => {
					if (ball === removedBall) {
						player.ballsRemaining.ballInfo.pop(ball);
						player.ballsRemaining.ballNumber.splice(player.ballsRemaining.ballNumber.indexOf(ball.label), 1)
						this.updateGameLog(`The ${ball.label} was hit in by ${player.name}`)
					}
				});
			}
			this.updateScoreboard();
		});
	}

	public openPlayerInput(): void {
		let modal = document.getElementById("playerInput") as HTMLElement;
		modal.style.display = "block";
	}
	public closePlayerInput(): void {
		let modal = document.getElementById("playerInput") as HTMLElement;
		modal.style.display = "none";
	}
	public addPlayer(): void {
		const playerInputModal = document.querySelector('.content') as HTMLElement;
		const newInput = document.createElement('input');
		newInput.type = 'text';
		newInput.classList.add('content');
		playerInputModal.appendChild(newInput);
	}
	public displayScoreboard(): void {
		this._viewScoreboard = !this._viewScoreboard;
	}
	public displayLog(): void {
		this._viewLog = !this._viewLog;
	}
	private updateScoreboard(): void {
		/*
		removes the ball number from the scoreboard if it has been sunk
		currently the remaining ball numbers just spread out when a ball is removed
		would rather the row heights stay the same to visually indicate how many balls each player has left to get
		*/
		this.fillScoreboard = false; 
		setTimeout(() => {
			this.fillScoreboard = true;
		}, 0);
	}
	private updateGameLog(message: string): void {
		const gameLogBody = document.querySelector('.game-log-body') as HTMLElement;
		const newMessage = document.createElement('p');
		newMessage.textContent = message;
		gameLogBody.appendChild(newMessage);
		gameLogBody.scrollTop = gameLogBody.scrollHeight;

	}
	public playerBallsRemaining(player: PlayerComponent): any[] {
		let specificPlayer: any | undefined = this._players.find(p => p === player);
		return specificPlayer.ballsRemaining.ballNumber
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
