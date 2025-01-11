

export default class PhysicsHandler { // movement, gravity, and collisions
    constructor() {
        this.entities = [];
        this.gravity = new THREE.Vector3(0, -9.8, 0);
    }

    update(delta) {
        for (const ent of this.entities) {
            if (!ent.isStatic) {
                ent.velocity.add(this.gravity.clone().multiplyScalar(delta));
                ent.position.add(ent.velocity.clone().multiplyScalar(delta));
            }
        }
    }
}