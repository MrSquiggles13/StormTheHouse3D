import * as THREE from "three";
import Entity from "../objects/Entity";


export default class PhysicsHandler extends Entity { // movement, gravity, and collisions
    constructor(scene) {
        super();
        this.scene = scene;

        this.entities = [];
        this.gravity = new THREE.Vector3(0, -9.8, 0);

        this.on('shot', (raycaster) => this.handleShot(raycaster));
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    handleShot(raycaster) {
        const intersects = raycaster.intersectObjects(this.scene.children, true); // sent up to collisions
        
        if (intersects.length > 0) {

            for (let inter in intersects) {
                if (intersects[inter].object.name !== 'impact' && intersects[inter].object.name !== 'tracer') {
                    this.emit('impact', intersects[inter].point);
                }
                if (intersects[inter].object.name === 'enemy') {
                    this.emit('enemy-hit', intersects[inter].object.enemy);
                }
            }
        }
    }

    checkCollision(entity1, entity2) {
        const e1box = new THREE.Box3().setFromObject(entity1.mesh);
        const e2box = new THREE.Box3().setFromObject(entity2.mesh);

        if (e1box.intersectsBox(e2box)) {
            this.emit('collision', entity1);
        }
    }

    update(delta) {


        // Apply gravity to all entities
        this.entities.forEach(entity => {
            if(entity.velocity){
                entity.velocity.add(this.gravity.clone().multiplyScalar(delta)); // Add gravity to velocity
                entity.mesh.position.add(entity.velocity.clone().multiplyScalar(delta)); // Apply velocity to position
            }
        });

        //check for collisions
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                if (this.entities[i].mesh.position.distanceTo(this.entities[j].mesh.position) < 30) {
                    this.checkCollision(this.entities[i], this.entities[j]);
                }
            }    
        }

    }

}