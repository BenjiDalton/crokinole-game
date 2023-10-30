import { AfterViewInit, Component } from '@angular/core';
import { PhysicsService } from '../../services/physics.service';
import { Body, Bodies, IBodyDefinition, Composite } from 'matter-js';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements AfterViewInit {

	private width = 2040;
	private height = 1290;
	private showBoundaries = false;
	private boardColor = '#966F33';
	public playerOneColor = '#335B96';
	public playerTwoColor = '#DF4A26';
	private normalPegState = '#F5CC7C';
	private activePegState = '#F3EC06';
	private boardCenterRadius = 21;
	private boardCenterColor = 'black';
	private boardCenterActiveColor = '#CE3D00'
	private changePlayerSubscription: Subscription;
	private activePiece: any;
	public checkboxStatus = true;
	public p1PlusMinus = true;
	public p2PlusMinus = true;

	constructor(private physicsService: PhysicsService, public gameState: GameStateService) { }

	/*
	Goals: 
	- score container on the left and right side of player1 and 2 respectively
	- switch button for addition and subtraction of scores 
	- button to hide and show the score container
	*/

	ngAfterViewInit(): void {
		this.changePlayerSubscription = this.gameState.activePlayer.subscribe(result => {

			let playerID = result[0];
			let player = result[1]
			/* 
			remove the first body in specific player's pieces
			create a new piece that is then placed on the board for the player to use
			*/
			this.physicsService.removeBody(player.pieces[0])
			player.pieces.splice(0, 1)
			this.physicsService.activePiece = this.createGamePiece(playerID, this.width / 2, this.height / 1.3);
		});
	}

	public toggleScoreCounter(counterID: string): void {
		let scoreCounter = document.getElementById(counterID);
		scoreCounter?.classList.toggle('open');
	}
	public toggleCheckbox(checkboxID: string): void {
		if ( checkboxID.includes('p1') ) {
			this.p1PlusMinus = !this.p1PlusMinus;
		} else if ( checkboxID.includes('p2') ) {
			this.p2PlusMinus = !this.p2PlusMinus;
		}
	}
	public create(): void {
		this.generateGameBorders();
		this.generateBoard();
		this.generateBoardPegs();
		this.generateGamePieceContainers();
		this.assignPlayerPieces();
	}
	private generateBoard(): void {
		const boardOutsideOptions: Matter.IChamferableBodyDefinition = {
			label: 'boardRails',
			isSensor: true,
			isStatic: true,
			render: { 
				fillStyle: 'black' 
			}
		};
		const boardInsideOptions: Matter.IChamferableBodyDefinition = {
			isSensor: true,
			isStatic: true,
			render: { 
				fillStyle: this.boardColor
			}
		};
		const boardCircleOptions: Matter.IChamferableBodyDefinition = {
			isSensor: true,
			isStatic: true,
			render: { 
				fillStyle: 'transparent', 
				strokeStyle: 'black', 
				lineWidth: 5
			}
		};
		const boardOutside = Bodies.polygon(this.width / 2, this.height / 2, 8, 500, boardOutsideOptions);
		const boardInside = Bodies.circle(this.width / 2, this.height / 2, 400, boardInsideOptions);
		const boardCenter = Bodies.circle(this.width / 2, this.height / 2, this.boardCenterRadius, boardInsideOptions);
		const boardInnerCircle = Bodies.circle(this.width / 2, this.height / 2, 130, boardCircleOptions);
		const boardMiddleCircle = Bodies.circle(this.width / 2, this.height / 2, 260, boardCircleOptions);
		const boardOuterCircle = Bodies.circle(this.width / 2, this.height / 2, 380, boardCircleOptions);
		boardCenter.label = 'boardCenter';
		boardCenter.render.fillStyle = this.boardCenterColor;
		boardInnerCircle.label = 'innerCircle';
		boardMiddleCircle.label = 'middleCircle';
		boardOuterCircle.label = 'outerCircle';

		for (let body of [boardOutside, boardInside, boardCenter, boardInnerCircle, boardMiddleCircle, boardOuterCircle]) {
			this.physicsService.addBody(body);
		}
	}
	private generateGameBorders(): void {
		const borderThickness = 200;
		const borderOptions: Matter.IChamferableBodyDefinition = {
			label: 'boundary',
			isStatic: true,
			render: {
				fillStyle: this.showBoundaries === true ? 'white': 'transparent',
			}
		};
		
		const topBorder = Bodies.rectangle(this.width * 0.50, this.height * 0.075, 400, borderThickness, borderOptions);
		const rightBorder = Bodies.rectangle(this.width * 0.77, this.height / 2, borderThickness, 400, borderOptions);
		const bottomBorder = Bodies.rectangle(this.width * 0.50, this.height * 0.925, 400, borderThickness, borderOptions);
		const leftBorder = Bodies.rectangle(this.width * 0.23, this.height / 2, borderThickness, 400, borderOptions);
		const topRightBorder = Bodies.polygon(this.width * 0.825, 0, 8, 500, borderOptions);
		const topLeftBorder = Bodies.polygon(this.width * 0.175, 0, 8, 500, borderOptions);
		const bottomRightBorder = Bodies.polygon(this.width * 0.825, this.height, 8, 500, borderOptions);
		const bottomLeftBorder = Bodies.polygon(this.width * 0.175, this.height, 8, 500, borderOptions);
		const farLeftBorder = Bodies.rectangle(0, this.height / 2, 300, 800, borderOptions);
		const farRightBorder = Bodies.rectangle(this.width, this.height / 2, 300, 800, borderOptions);

		for (let body of [topBorder, bottomBorder, rightBorder, leftBorder, topRightBorder, topLeftBorder, bottomRightBorder, bottomLeftBorder, farLeftBorder, farRightBorder]) {
			this.physicsService.addBody(body);
		}
	}
	private generateBoardPegs(): void {
		const pegOptions: Matter.IChamferableBodyDefinition = {
			label: 'peg',
			isStatic: true,
			render: {
				fillStyle: this.normalPegState
			}	
		};
		/*
		pegs label from 1 to 8, starting from the peg at the 10 o'clock position
		*/
		const peg1 = Bodies.circle(this.width * 0.442, this.height * 0.46, 8, pegOptions);
		const peg2 = Bodies.circle(this.width * 0.47, this.height * 0.41, 8, pegOptions);
		const peg3 = Bodies.circle(this.width * 0.53, this.height * 0.41, 8, pegOptions);
		const peg4 = Bodies.circle(this.width * 0.558, this.height * 0.46, 8, pegOptions);
		const peg5 = Bodies.circle(this.width * 0.442, this.height * 0.54, 8, pegOptions);
		const peg6 = Bodies.circle(this.width * 0.47, this.height * 0.59, 8, pegOptions);
		const peg7 = Bodies.circle(this.width * 0.53, this.height * 0.59, 8, pegOptions);
		const peg8 = Bodies.circle(this.width * 0.558, this.height * 0.54, 8, pegOptions);
		
		for (let body of [peg1, peg2, peg3, peg4, peg5, peg6, peg7, peg8]) {
			this.physicsService.addBody(body);
		}
	}
	private generateGamePieceContainers(): void {
		const pieceContainerOptions: Matter.IChamferableBodyDefinition = {
			label: 'pieceContainer',
			isSensor: true,
			isStatic: true,
			render: { 
				fillStyle:'E1D0A0',
				lineWidth: 40
			},
			restitution: 1
		};
		const playerOneContainer = Bodies.rectangle(this.width * 0.167, this.height / 2, 200, 340, pieceContainerOptions);
		const playerTwoContainer = Bodies.rectangle(this.width * 0.84, this.height / 2, 200, 340, pieceContainerOptions);
		playerOneContainer.label = 'p1_pieceContainer';
		playerTwoContainer.label = 'p2_pieceContainer';
		playerOneContainer.render.strokeStyle = this.playerOneColor;
		playerTwoContainer.render.strokeStyle = this.playerTwoColor;

		for (let body of [playerOneContainer, playerTwoContainer]) {
			this.physicsService.addBody(body);
		}
	}
	public assignPlayerPieces(): void {
		for ( let [playerID, player] of Object.entries(this.gameState.players) ) {
			this.generateGamePieces(playerID, player);
		}
	}
	private generateGamePieces(playerID: string, player: any): void {
		let xStart = 250;
		if ( playerID === 'p2' ) {
			xStart += 1500;
		};
		let yStart = 660;
		for ( let i = 1; i < 6; i++ ) {
			player.pieces.push(this.createGamePiece(playerID, xStart, yStart - 10 * i));
		};
		player.pieces.forEach((body: Body) => {
			this.physicsService.addBody(body);
		});
	}
	private createGamePiece(playerID: string, x: number, y: number): Body {
		const gamePieceOptions: IBodyDefinition = {
			label: `gamePiece_${playerID}`,
			frictionAir: 0.04,
			render: { 
				fillStyle: playerID === 'p1' ? this.playerOneColor : this.playerTwoColor 
			},
			restitution: 0.5,
			density: 1700
		};
		return Bodies.circle(x, y, 20, gamePieceOptions)
	}
	public updateScore(elementID: string, value: any): void {
		const inputElement = document.getElementById(elementID) as HTMLInputElement;
		const currentValue = parseInt(inputElement.value);
		if ( elementID.includes('p1') ) {
			this.p1PlusMinus === true ? inputElement.value = (currentValue + value).toString() : inputElement.value = (currentValue - value).toString(); 
		}
		if ( elementID.includes('p2') ) {
			this.p2PlusMinus === true ? inputElement.value = (currentValue + value).toString() : inputElement.value = (currentValue - value).toString(); 
		}
	}
	public updatePlayerColor(playerID: string, target: any): void {
		if ( playerID === 'p1' ) {
			this.playerOneColor = target.value;
		} else if ( playerID === 'p2' ) {
			this.playerTwoColor = target.value;
		}
		for ( let body of this.physicsService.engine.world.bodies ) {
			if ( body.label.includes(playerID) && !body.label.includes('pieceContainer') ) {
				body.render.fillStyle = target.value;
			}
			if ( body.label.includes(playerID) && body.label.includes('pieceContainer') ) {
				body.render.strokeStyle = target.value;
			}
		}	
	}
}
