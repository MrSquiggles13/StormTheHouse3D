import * as THREE from 'three';
import Entity from '../Entity';
import Wall from './Wall';

export default class Ground extends Entity {
    constructor() {
        super();
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(25, 1, 200),
            new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        this.mesh.position.set(0, 0, 0);
        this.mesh.length = 200

        this.on('collision', (entity) => {
            if (entity == this) return;
            if (entity instanceof Wall) return;

            console.log("Collision with ground");

            console.log(entity)

            if(entity.bodyCollider) this.checkCollisionPlatform(entity);
        });
    }

    checkCollisionPlatform(entity) {
        const entityBox = new THREE.Box3().setFromObject(entity.bodyCollider);
        const platformBox = new THREE.Box3().setFromObject(this.mesh);

        if (platformBox.intersectsBox(entityBox)) {
            console.log("Collision with platform");
            // Check if the entity is above the platform and falling onto it

            const penetrationDepthY = Math.min(platformBox.max.y - entityBox.min.y, entityBox.max.y - platformBox.min.y);

            if (entity.mesh.position.y > platformBox.getCenter(new THREE.Vector3()).y) {
                console.log("Stay on top")
                // Snap entity to the platform
                entity.mesh.position.y += penetrationDepthY;
                entity.velocity.y = 0;
            } else {
                console.log("Prevent jumping through")
                entity.mesh.position.y = platformBox.min.y;
                entity.velocity.y = -entity.velocity.y;
            }
        }
    }
}