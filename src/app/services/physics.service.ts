import { Injectable } from '@angular/core';
import { Bodies, Body, Composite, Constraint, Engine, Events, Mouse, MouseConstraint, Render, Runner, Vector, Common, Vertices, Collision, IBodyDefinition, Composites } from 'matter-js';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
	private engine = Engine.create({
		velocityIterations: 16,
		positionIterations: 24
	});
    private renderer: Render;
    private runner = Runner.create({
		delta: 144
	});
	private mouse: Mouse;
	private width = 2040;
	private height = 1290;
	private boardColor = '#966F33';
	private normalPegState = '#F5CC7C';
	private activePegState = '#F3EC06';
	private boardCenterRadius = 21;
	private boardCenterColor = 'black';
	private boardCenterActiveColor = '#CE3D00'
	private _renderElement: HTMLCanvasElement;
	private mouseConstraint: any;

	private _scratchSubject = new Subject<string>();
	public scratchSubject = this._scratchSubject.asObservable();


	public set renderElement(element: HTMLCanvasElement) {
		this._renderElement = element;
		this.renderer = Render.create({
			engine: this.engine,
			canvas: element,
			options: {
				height: this.height,
				width: this.width,
				wireframes: false,
				// showPerformance: true
			}
		});
		this.mouse = Mouse.create(element);
		this.setupMouseConstraint();
		this.renderer.mouse = this.mouse;
		this.addStuff();
		this.setupEngine();
		this.collisionDetect();
	}
	public get renderElement(): HTMLCanvasElement {
		return this._renderElement;
	}

  	constructor() { }

	private setupEngine(): void {
		this.engine.gravity.y = 0;
		Render.run(this.renderer);
		Runner.run(this.runner, this.engine);
	}
	public addStuff(): void {
		this.generateGameBorders();
		this.generateBoard();
		this.generateBoardPegs();
		this.generateGamePieces();
	}
	
	private setupMouseConstraint(): void {
		this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
		
		Composite.add(this.engine.world, this.mouseConstraint);
	}
	private generateBoard(): void {
		const boardOutsideOptions: Matter.IChamferableBodyDefinition = {
			label: 'boardRails',
			isSensor: true,
			isStatic: true,
			render: { fillStyle: 'black' }
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

		Composite.add(
			this.engine.world, [
				boardOutside, 
				boardInside, 
				boardCenter, 
				boardInnerCircle, 
				boardMiddleCircle,
				boardOuterCircle
			]
		);
	}
	private generateGameBorders(): void {
		const borderThickness = 200;
		const borderOptions: Matter.IChamferableBodyDefinition = {
			label: 'boundary',
			isStatic: true,
			render: { fillStyle: 'transparent' },
			restitution: 1
		};
		
		const topBorder = Bodies.rectangle(this.width * 0.50, this.height * 0.075, 400, borderThickness, borderOptions);
		const rightBorder = Bodies.rectangle(this.width * 0.77, this.height / 2, borderThickness, 350, borderOptions);
		const bottomBorder = Bodies.rectangle(this.width * 0.50, this.height * 0.925, 400, borderThickness, borderOptions);
		const leftBorder = Bodies.rectangle(this.width * 0.23, this.height / 2, borderThickness, 350, borderOptions);
		const topRightBorder = Bodies.polygon(this.width * 0.825, 0, 8, 500, borderOptions);
		const topLeftBorder = Bodies.polygon(this.width * 0.175, 0, 8, 500, borderOptions);
		const bottomRightBorder = Bodies.polygon(this.width * 0.825, this.height, 8, 500, borderOptions);
		const bottomLeftBorder = Bodies.polygon(this.width * 0.175, this.height, 8, 500, borderOptions);

		Composite.add(
			this.engine.world, [
				topBorder, 
				bottomBorder, 
				rightBorder, 
				leftBorder, 
				topRightBorder, 
				topLeftBorder, 
				bottomRightBorder, 
				bottomLeftBorder
			]
		);
	}
	private generateBoardPegs(): void {
		const pegOptions: Matter.IChamferableBodyDefinition = {
			label: 'peg',
			isStatic: true,
			render: {fillStyle: this.normalPegState}	
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
		Composite.add(this.engine.world, [peg1, peg2, peg3, peg4, peg5, peg6, peg7, peg8]);
	}
	private generateGamePieces(): void {
		const xStart = 750;
		const yStart = 645;
		const pieceArr: Composite[] = [];
		for (let i = 1; i < 6; i++) {
			pieceArr.push(Composites.stack(xStart - 30 * i, yStart - 15 * i, 1, 1, 1, 0, this.getNextPiece));
		};
		pieceArr.forEach(pieceComposite => {
			this.addComposite(pieceComposite);
		});
	}
	private getNextPiece = (x: number, y: number): Body => {
		const generatedValue = this.createGamePiece('p1', x, y);
		// this.physicsService.addTrail(generatedValue);
		return generatedValue;
	}
	private createGamePiece(player: any, x: number, y: number): Body {
		const gamePieceOptions: IBodyDefinition = {
			label: 'gamePiece',
			frictionAir: 0.04,
			render: { fillStyle: '#335B96' },
			restitution: 0.5,
			density: 1700
		};
		return Bodies.circle(x, y, 20, gamePieceOptions)
	}

	public addBody(body: Body): void {
		Composite.add(this.engine.world, body);
	}
	public addComposite(composite: Composite): void {
		Composite.add(this.engine.world, composite);
	}
	private activatePeg(peg: Body): void {
		peg.render.fillStyle = this.activePegState;
		peg.circleRadius = 12;
		setTimeout(() => {
			peg.render.fillStyle = this.normalPegState;
			peg.circleRadius = 8;
		  }, 
		  100
		);
	}
	private activateCenter(center: Body): void {
		center.render.fillStyle = this.boardCenterActiveColor;
		center.circleRadius = 25;
		setTimeout(() => {
			center.render.fillStyle = this.boardCenterColor;
			center.circleRadius = this.boardCenterRadius;
		  }, 
		  500
		);
	}
	private collisionDetect(): void {
		Events.on(this.engine, 'collisionStart', event =>  {
			let pairs = event.pairs;
			for (let i = 0, j = pairs.length; i != j; ++i) {
				let pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
					switch (pair.bodyA.label) {
						case 'boundary':
							pair.bodyB.frictionAir = 1;
							break;
						case 'peg': 
							this.activatePeg(pair.bodyA);
							break;
					};
				};
			};
		});
		Events.on(this.engine, 'collisionActive', (event) => {
			let pairs = event.pairs;
			for (let i = 0, j = pairs.length; i != j; ++i) {
				let pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
					switch (pair.bodyA.label) {
						case 'boardCenter':
							if (pair.bodyB.speed < 0.2 && Math.abs(pair.bodyB.position.x - pair.bodyA.position.x) < 1) {
								this.activateCenter(pair.bodyA);
							}
							break;
						case 'innerCircle':
							if (pair.bodyB.speed < 0.2) {
								console.log('add 15')
							}
							break;	
						case 'middleCircle':
							break;
						case 'outerCircle':
							break;	
					};
				};
			};
		});
		Events.on(this.engine, 'collisionEnd', event =>  {
			let pairs = event.pairs;
			for (let i = 0, j = pairs.length; i != j; ++i) {
				const pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
					switch (pair.bodyA.label) {
						case 'boundary': 
							pair.bodyB.frictionAir = 0.04;
							break;
					};
				};
			};
		});
	}
	public sendScratch(): void {
		this._scratchSubject.next('ooooof ya scratched');
	}
}
