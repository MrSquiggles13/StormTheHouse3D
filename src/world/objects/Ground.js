import * as THREE from 'three';

class Ground {
    constructor() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(25, 1, 200),
            new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        this.mesh.position.set(0, 0, 0);

        this.mesh.length = 200
    }
}

export { Ground };