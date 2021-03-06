/// <reference path="../../ref.ts" />

class ZombiePirate extends SpriteEntity {
	health: number = 100;
	walkspeedDelay: number = 2;
	pathTick: number = 0;

	pathIndex: number = 0;
	path: any[] = [];
	pathSize: number = 0;
	pathFinder: Pathfinder;
	debugimage: any;
	currentGrid: Grid;
	pathTargetGrid: Grid;
	attacking: boolean = false;
	stunned: boolean = false;
	isDead: boolean = false;


	constructor(x: number, y: number) {
        super();

        this.collidable = true;
        this.damageable = true;

		// Set Sprite
		var image : any = new Image();
		image.src = "images/zombie-pirate.png";
		this.boundryBox = [32, 48];
		this.sprite = new Sprite(32, 48, image);
		this.sprite.x = x;
		this.sprite.y = y;
		this.sprite.setGrids();

		// Set AnimationStates for Sprite
		this.sprite.addState(new AnimationState("walkDown", [[1,1],[1,2],[1,3]]));
		this.sprite.addState(new AnimationState("walkLeft", [[2,1],[2,2],[2,3]]));
		this.sprite.addState(new AnimationState("walkRight",[[3,1],[3,2],[3,3]]));
		this.sprite.addState(new AnimationState("walkUp", 	[[4,1],[4,2],[4,3]]));
		this.sprite.addState(new AnimationState("deathSpin", [[1,1], [2,1], [4,1], [3,1], [1,1], [2,1], [4,1], [3,1]]))


		this.sprite.addState(new AnimationState("standDown", [[1,2]]));
		this.sprite.addState(new AnimationState("standLeft", [[2,2]]));
		this.sprite.addState(new AnimationState("standRight",[[3,2]]));
		this.sprite.addState(new AnimationState("standUp",	 [[4,2]]));
		this.sprite.setState("walkDown");
		this.pathFinder = new Pathfinder();
		this.updatePath();
	}

	damage(amount, type) {
		
		this.health -= amount;
		if(/*this.health > 0 &&*/ type == 'impact') {
			this.stun();
		}
		if(this.health <= 0) {
			this.death();
		}
	}

	stun() {
		var self = this;
		this.stunned = true;
		this.walkspeedDelay = this.walkspeedDelay * 2;
		setTimeout(() => {
			self.stunned = false;
			this.walkspeedDelay = this.walkspeedDelay / 2;
		}, 1500);
		
	}

	death() {
		this.isDead = true;
		this.sprite.setState("deathSpin");
	}

	updatePath() {
		var targetGrid: Grid = Game.getGridsFor(Game.getInstance().player.sprite.x, Game.getInstance().player.sprite.y);
		this.currentGrid = Game.getGridsFor(this.sprite.x, this.sprite.y);
		this.pathFinder.getPath(this.currentGrid, targetGrid);
	}

	checkPlayerCollision():boolean {
		var collision = false;

		var targetGrid: Grid = Game.getGridsFor(Game.getInstance().player.sprite.x, Game.getInstance().player.sprite.y);

		if (this.currentGrid.x == targetGrid.x && this.currentGrid.y == targetGrid.y) { collision == true; }
		if (this.currentGrid.x + 1 == targetGrid.x && this.currentGrid.y == targetGrid.y) { collision == true; }
		if (this.currentGrid.x - 1 == targetGrid.x && this.currentGrid.y == targetGrid.y) { collision == true; }
		if (this.currentGrid.x + 1 == targetGrid.x && this.currentGrid.y + 1== targetGrid.y) { collision == true; }
		if (this.currentGrid.x + 1 == targetGrid.x && this.currentGrid.y - 1== targetGrid.y) { collision == true; }
		if (this.currentGrid.x - 1 == targetGrid.x && this.currentGrid.y - 1== targetGrid.y) { collision == true; }
		if (this.currentGrid.x - 1 == targetGrid.x && this.currentGrid.y + 1== targetGrid.y) { collision == true; }
		if (this.currentGrid.x == targetGrid.x && this.currentGrid.y + 1== targetGrid.y) { collision == true; }
		if (this.currentGrid.x == targetGrid.x && this.currentGrid.y - 1== targetGrid.y) { collision == true; }
		return collision;
	}

	update() {
		if (this.sprite.loop == 1) {
			if (this.sprite.currentState.name == "deathSpin") {
				this.destroy();
				return;
			}
		}
		if(this.pathTick%this.walkspeedDelay == 0 && this.pathFinder.pathIndex < this.pathFinder.pathSize && !this.isDead) {
			//this.attacking = this.checkPlayerCollision();
			if(this.attacking) {
				l('attacking');
			}
			if(!this.attacking) {
				if (this.sprite.x < this.pathFinder.getCurrent().x * 32) {
					this.sprite.x += 1;
				}
				if (this.sprite.x > this.pathFinder.getCurrent().x * 32) {
					this.sprite.x -= 1;
				}
				if (this.sprite.y < this.pathFinder.getCurrent().y * 32) {
					this.sprite.y += 1;
				}
				if (this.sprite.y > this.pathFinder.getCurrent().y * 32) {
					this.sprite.y -= 1;
				}
				

				if (this.sprite.x == this.pathFinder.getCurrent().x*32 && this.sprite.y == this.pathFinder.getCurrent().y*32 && this.sprite.x%32 == 0 && this.sprite.y%32 == 0) {
					// New sprite, new state?
					var prevGrid: Grid = this.pathFinder.getCurrent();
					if(this.pathFinder.next()) {
						var nextGrid: Grid = this.pathFinder.getCurrent();
						if (prevGrid.x < nextGrid.x) { this.sprite.setState('walkRight'); }
						else if (prevGrid.x > nextGrid.x) { this.sprite.setState('walkLeft'); }
						else if (prevGrid.y < nextGrid.y) { this.sprite.setState('walkDown'); }
						else if (prevGrid.y > nextGrid.y) { this.sprite.setState('walkUp'); }
					} else {
						this.updatePath();
					}

					this.currentGrid = this.sprite.getGrids();
					//this.pathTargetGrid = new Grid(this.path[this.pathIndex].x, this.path[this.pathIndex].y);
				}
				this.pathTick = 0;
			}

        }
        this.pathTick++;
        super.update();
	}
	render() {
        super.render();
		//this.pathFinder.render();
	}
}