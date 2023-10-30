import { AfterViewInit, Injectable } from '@angular/core';
import { PhysicsService } from './physics.service';
import { PlayerComponent } from '../components/player/player.component';
import { Bodies, Body, Composite, Composites, IBodyDefinition } from 'matter-js';
import { Subject, Subscription, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/* 
Goals:
1. Scoreboard keeps track of balls each player has remaining
	1a. Little box that keeps the list of remaining balls for each player and if you hover the ball in the list, it gets highlighted on the table?
2. Balls highlight if they are the player's specific type?
3. Button to re-rack the balls after the game ends
*/

export class GameStateService {
	private player1 = new PlayerComponent;
	private player2 = new PlayerComponent;
	private _players: { [key: string]: PlayerComponent } = {
		'p1': this.player1, 
		'p2': this.player2
	};
	private switchPlayersSubscription: Subscription;
	private ballRemovedSubscription: Subscription;
	private playerChangeSubscription: Subscription;
	private currentPlayer = new PlayerComponent;
	private playerChange = new Subject<PlayerComponent>();
	private _gameStateMessage = new Subject<any>();
	public gameStateMessage = this._gameStateMessage.asObservable();
	private _activePlayer = new Subject<any>();
	public activePlayer = this._activePlayer.asObservable();
	private notificationColors = {
		'red': 'rgba(255, 37, 0)',
		'green': 'rgba(37, 195, 16)',
		'gold': 'rgba(232, 219, 21)',
		'grey': 'rgba(199, 203, 208)'
	}
	
	constructor(private physicsService: PhysicsService) {
		// this.Brooks.name = 'Brooks';
		// this.Ben.name = 'Ben';
		this.playerChangeSubscription = this.playerChange.subscribe((currentPlayer: any) => {
			for ( const [playerID, player] of Object.entries(this._players) ) {
				if ( player === this.currentPlayer ) {
					this.sendCurrentPlayer(playerID, player);
				}
			}
			this.sendGameStateMessage(`It is now ${currentPlayer.name}'s turn`, this.notificationColors.grey);
		});

		this.switchPlayersSubscription = this.physicsService.playerTurnOver
			.pipe(debounceTime(5000))
			.subscribe(() => {
				this.switchCurrentPlayer();
			});
	}
	public newGame(): void {
		const playerNames = Object.keys(this._players);
		const randomIndex = Math.floor(Math.random() * playerNames.length);
		const randomPlayerName = playerNames[randomIndex];
		this.currentPlayer = this._players[randomPlayerName];

		this.currentPlayer.turn = !this.currentPlayer.turn;
		this.playerChange.next(this.currentPlayer);
	}
	private switchCurrentPlayer(): void {
		for ( const [playerID, player] of Object.entries(this._players) ) {
			player.turn = !player.turn
			if ( player.turn ) {
				this.currentPlayer = player;
				this.playerChange.next(this.currentPlayer);
			};
		};
	}
	private sendGameStateMessage(message: string, notificationColor: any): void {
		this._gameStateMessage.next([message, notificationColor]);
	}
	private sendCurrentPlayer(playerID: string, player: PlayerComponent): void {
		this._activePlayer.next([playerID, player]);
	}
	public get players(): any {
		return this._players;
	}
	// public get currentScore(): string {
	// 	if (this.ballCount === 0) {
	// 		return 'Please start a new game';
	// 	}
	// 	let brooksString = `Brooks has ${this.Brooks.ballsRemaining.length} ${this.Brooks.ballType} remaining`;
	// 	let benString = `Ben has ${this.Ben.ballsRemaining.length} ${this.Ben.ballType} remaining`;
	// 	return `${brooksString}\n${benString}`;
	// }
}
