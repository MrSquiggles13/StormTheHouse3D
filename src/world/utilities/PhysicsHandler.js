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


}