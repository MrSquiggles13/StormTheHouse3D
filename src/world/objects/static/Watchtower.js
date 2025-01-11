import * as THREE from 'three';

export default class Watchtower {
    constructor() {
        // Create the tower group
        this.towerGroup = new THREE.Group();

        // Create the platform
        const platformGeometry = new THREE.BoxGeometry(5, 0.5, 5);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 20; // Position the platform at height
        platform.receiveShadow = true;
        this.towerGroup.add(platform);

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
            this.towerGroup.add(leg);
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
            this.towerGroup.add(wall);
            this.walls.push(wall);
        }
        
        // Collision box for the platform
        this.platformBox = new THREE.Box3().setFromObject(platform);
    }

    // Check if the player is on the platform
    checkPlayerCollisionPlatform(player) {
        const playerBox = new THREE.Box3().setFromObject(player.bodyCollider);
    
        if (this.platformBox.intersectsBox(playerBox)) {
            // Check if the player is above the platform and falling onto it
            if (player.velocity.y < 0 && playerBox.min.y >= this.platformBox.max.y) {
                // Snap player to the platform
                player.mesh.position.y = this.platformBox.max.y;
                player.velocity.y = 0;
                return true;
            }
        }
        return false;
    }

    getCollisionNormal(wallBox, playerBox) {
        const normal = new THREE.Vector3();
    
        // Calculate the minimum translation distance to resolve the overlap
        const xOverlap = Math.min(wallBox.max.x - playerBox.min.x, playerBox.max.x - wallBox.min.x);
        const zOverlap = Math.min(wallBox.max.z - playerBox.min.z, playerBox.max.z - wallBox.min.z);
    
        // Determine the primary axis of collision
        if (xOverlap < zOverlap) {
            normal.set(playerBox.min.x < wallBox.min.x ? -1 : 1, 0, 0);
        } else {
            normal.set(0, 0, playerBox.min.z < wallBox.min.z ? -1 : 1);
        }
    
        return normal;
    }

    checkPlayerCollisionWalls(player) {
        const playerBox = new THREE.Box3().setFromObject(player.bodyCollider);
    
        for (const wall of this.walls) {
            const wallBox = new THREE.Box3().setFromObject(wall);
    
            if (wallBox.intersectsBox(playerBox)) {
                // Calculate penetration depth along each axis
                const penetrationDepthX = Math.min(wallBox.max.x - playerBox.min.x, playerBox.max.x - wallBox.min.x);
                const penetrationDepthZ = Math.min(wallBox.max.z - playerBox.min.z, playerBox.max.z - wallBox.min.z);
    
                // Determine which axis to adjust based on the smallest penetration depth
                if (penetrationDepthX < penetrationDepthZ) {
                    // Adjust player position along the X-axis
                    if (player.mesh.position.x > wallBox.getCenter(new THREE.Vector3()).x) {
                        player.mesh.position.x += penetrationDepthX;
                    } else {
                        player.mesh.position.x -= penetrationDepthX;
                    }
                    player.velocity.x = 0;
                } else {
                    // Adjust player position along the Z-axis
                    if (player.mesh.position.z > wallBox.getCenter(new THREE.Vector3()).z) {
                        player.mesh.position.z += penetrationDepthZ;
                    } else {
                        player.mesh.position.z -= penetrationDepthZ;
                    }
                    player.velocity.z = 0;
                }
            }
        }
    }
}
