import * as THREE from 'three';
import Entity from '../Entity';

export default class Watchtower extends Entity {
    constructor() {
        super()
        // Create the tower group
        this.mesh = new THREE.Group();

        // Create the platform
        const platformGeometry = new THREE.BoxGeometry(5, 0.5, 5);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        this.platform = new THREE.Mesh(platformGeometry, platformMaterial);
        this.platform.set.y = 20; // Position the platform at height
        this.platform.receiveShadow = true;
        this.mesh.add(this.platform);

        // Create the legs
        const legGeometry = new THREE.BoxGeometry(0.2, 20, 0.2);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

        const leg_positions = [
            [-2.4, 10, -2.4],
            [2.4, 10, -2.4],
            [-2.4, 10, 2.4],
            [2.4, 10, 2.4],
        ];

        this.legs = [];

        for (const [x, y, z] of leg_positions) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            this.legs.push(leg);
            this.mesh.add(leg);
        }

        // Add walls (simple boxes for now)
        const wallGeometry = new THREE.BoxGeometry(5.2, 1, 0.2);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

        const wall_positions = [
            [0, 20.5, -2.5],
            [0, 20.5, 2.5],
            [-2.5, 20.5, 0],
            [2.5, 20.5, 0],
        ];

        this.walls = [];

        for (const [x, y, z] of wall_positions) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, y, z);
            if (z === 0) wall.rotation.y = Math.PI / 2;
            wall.castShadow = true;
            this.mesh.add(wall);
            this.walls.push(wall);
        }

        this.on('collision', (entity) => {
            if (entity == this) return
            if (entity.bodyCollider){
                this.checkCollisionWalls(entity);
                this.checkCollisionPlatform(entity);
                this.checkCollisionLegs(entity);
            }

        })
    }

    // Check if the entity is on the platform
    checkCollisionPlatform(entity) {
        const entityBox = new THREE.Box3().setFromObject(entity.bodyCollider);
        const platformBox = new THREE.Box3().setFromObject(this.platform);
    
        if (platformBox.intersectsBox(entityBox)) {

            const penetrationDepthY = Math.min(platformBox.max.y - entityBox.min.y, entityBox.max.y - platformBox.min.y);
            
            if (entity.mesh.position.y > platformBox.getCenter(new THREE.Vector3()).y) {
                // Snap entity to the platform
                entity.mesh.position.y += penetrationDepthY;
                entity.velocity.y = 0;
            } else {
                entity.mesh.position.y -= penetrationDepthY;
            }
        }
    }

    checkCollisionWalls(entity) {
        const entityBox = new THREE.Box3().setFromObject(entity.bodyCollider);
    
        for (const wall of this.walls) {
            const wallBox = new THREE.Box3().setFromObject(wall);
    
            if (wallBox.intersectsBox(entityBox)) {
                // Calculate penetration depth along each axis
                const penetrationDepthX = Math.min(wallBox.max.x - entityBox.min.x, entityBox.max.x - wallBox.min.x);
                const penetrationDepthZ = Math.min(wallBox.max.z - entityBox.min.z, entityBox.max.z - wallBox.min.z);
    
                // Determine which axis to adjust based on the smallest penetration depth
                if (penetrationDepthX < penetrationDepthZ) {
                    // Adjust entity position along the X-axis
                    if (entity.mesh.position.x > wallBox.getCenter(new THREE.Vector3()).x) {
                        entity.mesh.position.x += penetrationDepthX;
                    } else {
                        entity.mesh.position.x -= penetrationDepthX;
                    }
                    entity.velocity.x = 0;
                } else {
                    // Adjust entity position along the Z-axis
                    if (entity.mesh.position.z > wallBox.getCenter(new THREE.Vector3()).z) {
                        entity.mesh.position.z += penetrationDepthZ;
                    } else {
                        entity.mesh.position.z -= penetrationDepthZ;
                    }
                    entity.velocity.z = 0;
                }
            }
        }
    }

    checkCollisionLegs(entity) {
        const entityBox = new THREE.Box3().setFromObject(entity.bodyCollider);
    
        for (const leg of this.legs) {
            const legBox = new THREE.Box3().setFromObject(leg);
    
            if (legBox.intersectsBox(entityBox)) {
                // Calculate penetration depth along each axis
                const penetrationDepthX = Math.min(legBox.max.x - entityBox.min.x, entityBox.max.x - legBox.min.x);
                const penetrationDepthZ = Math.min(legBox.max.z - entityBox.min.z, entityBox.max.z - legBox.min.z);
    
                // Determine which axis to adjust based on the smallest penetration depth
                if (penetrationDepthX < penetrationDepthZ) {
                    // Adjust entity position along the X-axis
                    if (entity.mesh.position.x > legBox.getCenter(new THREE.Vector3()).x) {
                        entity.mesh.position.x += penetrationDepthX;
                    } else {
                        entity.mesh.position.x -= penetrationDepthX;
                    }
                    entity.velocity.x = 0;
                } else {
                    // Adjust entity position along the Z-axis
                    if (entity.mesh.position.z > legBox.getCenter(new THREE.Vector3()).z) {
                        entity.mesh.position.z += penetrationDepthZ;
                    } else {
                        entity.mesh.position.z -= penetrationDepthZ;
                    }
                    entity.velocity.z = 0;
                }
            }
        }
    }
}
