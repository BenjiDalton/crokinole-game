import { Injectable } from '@angular/core';
import { Bodies, Body, Composite, Constraint, Engine, Events, Mouse, MouseConstraint, Render, Runner, Vector, Common, Vertices, Collision } from 'matter-js';
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
	private borderWidth = 300;
	private _renderElement: HTMLCanvasElement;
	private mouseConstraint: any;

	private _scratchSubject = new Subject<string>();
	public scratchSubject = this._scratchSubject.asObservable();
	private _ballRemoved = new Subject<any>();
	public ballRemoved = this._ballRemoved.asObservable();

	public set renderElement(element: HTMLCanvasElement) {
		this._renderElement = element;
		this.renderer = Render.create({
			engine: this.engine,
			canvas: element,
			options: {
				height: this.height,
				width: this.width,
				wireframes: false,
				showPerformance: true
			}
		});
		this.mouse = Mouse.create(element);
		this.setupMouseConstraint();
		// this.handlePoolStick();
		this.renderer.mouse = this.mouse;
		this.addStuff();
		this.setupEngine();
		this.checkRemainingBalls();
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
		this.generatePockets();
		this,this.generatepoolStick();
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
	private handlePoolStick(): void {
		Events.on(this.runner, 'tick', event => { 
			if (this.mouseConstraint.body) {
				
				if (this.mouseConstraint.body.label === 'poolBall') {
					/* 
					- tried making it so you could't move the balls
						-- doesn't work FOR NOW
					*/
					console.log("Hey!! Don't touch that!")
					return
				}
				if (this.mouseConstraint.body.label === 'poolStick') {

					// this.mouseConstraint.body.isStatic = true;
					const anchor = this.mouseConstraint.body.position;
					// console.log("anchor: ", anchor)
					/* 
					- tried setting the anchor as pointA in Constraints.create()
						-- spring just moves with the center of the pool stick as you move it around 
					- hard set the spring location so that it is at least near the middle of pool stick, but doesn't move now
						-- the spring stretches with the pool stick, but doesn't rebound once you stop clicking the pool stick
							--- just hangs out all stretched like
					*/
					const stickSpring = Constraint.create({
						pointA: { x: 1000, y: 750 },
						bodyB: this.mouseConstraint.body,
						length: 300,
						damping: 0.01,
						stiffness: 0.02
					});
					Composite.add(this.engine.world, [stickSpring]);
				};
		  	};
		});
	}
	private generateGameBorders(): void {
		const borderOptions: Matter.IChamferableBodyDefinition = {
			isStatic: true,
			render: { fillStyle: 'transparent' },
			restitution: 1
		};
		
		var topBorder = Bodies.rectangle(this.width / 2, this.borderWidth / 2, this.width, this.borderWidth, borderOptions);
		var rightBorder = Bodies.rectangle(this.width - (this.borderWidth / 2), this.height / 2, this.borderWidth, this.height, borderOptions);
		var bottomBorder = Bodies.rectangle(this.width / 2, this.height - (this.borderWidth / 2), this.width, this.borderWidth, borderOptions);
		var leftBorder = Bodies.rectangle(this.borderWidth / 2, this.height / 2, this.borderWidth, this.height, borderOptions);

		Composite.add(this.engine.world, [topBorder, rightBorder, bottomBorder, leftBorder]);
	}
	private generatepoolStick(): void {
		const poolStickShaftOptions: Matter.IChamferableBodyDefinition = {
			isSensor: true, /* pool shaft wont be collided with */
			label: 'poolStick',
			render: {fillStyle: 'rgb(202, 182, 143)'},
			density: 1000
		};
		const poolStickTipOptions: Matter.IChamferableBodyDefinition = {
			render: {fillStyle: 'rgb(0, 0, 0)'},
			chamfer: { radius: [5, 0, 0, 5] },
			density: 1000
		};
		var poolStickShaft = Bodies.rectangle(this.width / 2, 750, 600, 15, poolStickShaftOptions);
		var poolStickTip = Bodies.rectangle(this.width / 2.85 , 750, 10, 15, poolStickTipOptions);
		var poolStick = Body.create({
			parts: [poolStickShaft, poolStickTip]
		});
		Composite.add(this.engine.world, poolStick);
	}
	private generatePockets(): void {
		/*
		hit detection needs to be fine-tuned
		*/
		const pocketOptions: Matter.IChamferableBodyDefinition = {
			label: 'pocket',
			isSensor: true,
			isStatic: true,
			render: {fillStyle: 'transparent'}
		};
		var topLeftPocket = Bodies.rectangle(this.width * 0.15, this.height * 0.23, 25, 18, pocketOptions);
		var topMiddlePocket = Bodies.rectangle(this.width * 0.489, this.height * 0.227, 25, 18, pocketOptions);
		var topRightPocket = Bodies.rectangle(this.width * 0.85, this.height * 0.23, 25, 18, pocketOptions);
		var bottomLeftPocket = Bodies.rectangle(this.width * 0.15, this.height * 0.77, 25, 18,  pocketOptions);
		var bottomMiddlePocket = Bodies.rectangle(this.width * 0.489, this.height * 0.773, 25, 18, pocketOptions);
		var bottomRightPocket = Bodies.rectangle(this.width * 0.85, this.height * 0.77, 25, 18, pocketOptions);
		Composite.add(this.engine.world, [topLeftPocket, topMiddlePocket, topRightPocket, bottomLeftPocket, bottomMiddlePocket, bottomRightPocket]);
	}
	public addTrail(body: Body): void {
		const trail: any = [];
		
		Events.on(this.renderer, 'afterRender', () => {
			if (body.speed < 0.02) {
				return
			}
			trail.unshift({
				position: Vector.clone(body.position),
				speed: body.speed
			});
			this.renderer.context.globalAlpha = 0.7;

			for (var i = 0; i < trail.length; i += 1) {
				var point = trail[i].position,
					speed = trail[i].speed;
				
				let speedCoeff = 10; /* higher number -> closer to red hue // lower number -> closer to blue hue */
				let colorRangeCoeff = 250; /* higher number -> greater range of colors from fastest to slowest speed */
				var hue = 0 + Math.round((1 - Math.min(1, speed / speedCoeff)) * colorRangeCoeff);
				this.renderer.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
				this.renderer.context.fillRect(point.x, point.y, 4, 4);
			}
			this.renderer.context.globalAlpha = 1;
			let maxTailLengthCoeff = 5; /* higher number -> longer maximal tail length */
			if (trail.length > body.speed * maxTailLengthCoeff) {
				trail.pop();
			}
		});
	}
	public addBody(body: Body): void {
		Composite.add(this.engine.world, body);
	}
	public addComposite(composite: Composite): void {
		Composite.add(this.engine.world, composite);
	}
	public checkRemainingBalls(): void {
		/*
		balls are removed from play if they "hit" a pocket
		- currently if the cue ball isnt set to static after changing its position, it disappears
			-- i think its like yeeting off the screen cause it is calculating a huge change in position and then setting the speed of the ball?
		*/
		Events.on(this.engine, 'collisionStart', event =>  {
			var pairs = event.pairs;
			for (var i = 0, j = pairs.length; i != j; ++i) {
				var pair = pairs[i];

				if (pair.bodyA.label === 'pocket' && pair.bodyB.circleRadius === 15) {
					if (pair.bodyB.label === 'cue') {
						pair.bodyB.position.x = 1400;
						pair.bodyB.position.y = 645;
						pair.bodyB.isStatic = true;
						this.sendScratch();
					}
					this.engine.world.composites.forEach((composite: any) => {
						if (composite.bodies.includes(pair.bodyB)) {
							this.sendRemovedBall(pair.bodyB)
							Composite.remove(composite, pair.bodyB)
						}
					});
				} 
				if (pair.bodyA.circleRadius === 15 && pair.bodyB.label === 'poolStick') {
					/* 
					should maybe create a collision filter when defining the pool stick options 
					if the ball hits the stick (rather than vise versa), the collision isn't registered
					*/
				};
			}
			
		});
	}
	public sendScratch(): void {
		this._scratchSubject.next('ooooof ya scratched');
	}
	public sendRemovedBall(ball: any): void {
		this._ballRemoved.next(ball)
	}
}
