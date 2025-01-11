

class PhysicsHandler {
    constructor() {
        this.objects = [];
        this.gravity = new THREE.Vector3(0, -9.8, 0);
    }

    update(delta) {
        for (const obj of this.objects) {
            if (!obj.isStatic) {
                obj.velocity.add(this.gravity.clone().multiplyScalar(delta));
                obj.position.add(obj.velocity.clone().multiplyScalar(delta));
            }
        }
    }
}