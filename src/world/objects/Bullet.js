import * as THREE from "three";

export default class Bullet {
    constructor(position) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffff00 })
        );
        this.mesh.position.copy(position);
        this.speed = 10;
    }

    update(delta) {
        this.mesh.position.z -= this.speed * delta;
    }
}
