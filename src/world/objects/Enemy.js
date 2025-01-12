import * as THREE from 'three';
import HealthBar from '../components/Healthbar.js';
import Entity from './Entity.js';

export default class Enemy extends Entity {
    constructor(position) {
        super();
        // Create a basic enemy mesh (capsule shape)
        const geometry = new THREE.CapsuleGeometry(0.5, 3, 8, 16);
        this.originalMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.damageMaterial = new THREE.MeshStandardMaterial({ color: 0xfefefe }); // Color for damage feedback
        this.material = this.originalMaterial; // Start with original material
        this.mesh = new THREE.Mesh(geometry, this.material);

        this.mesh.name = "enemy";

        this.mesh.enemy = this;

        // Start position for the enemy
        this.mesh.position.set(
            position.x, position.y, position.z
        );

        // Movement speed
        this.speed = 0.08;
        this.direction = new THREE.Vector3(0, 0, 1).normalize();

        // Timer for damage
        this.lastDamageTime = 0;  // Time of last damage
        this.damageCooldown = 1;  // Cooldown time (in seconds) before the enemy can deal damage

        this.hasReachedWall = false;

        this.health = 5;
        this.healthBar = new HealthBar(this.mesh, this.health, 2, 0.5);
    }

    // Method to move toward the target (the wall)
    move() {
        if (this.hasReachedWall) return;
        this.mesh.position.addScaledVector(this.direction, this.speed);
    }

    // Helper to check if the enemy has collided with the wall
    hasCollidedWithWall(wall) {
        const enemyBox = new THREE.Box3().setFromObject(this.mesh);
        return enemyBox.intersectsBox(wall.getBoundingBox());
    }

    dealDamageToWall(wall, currentTime) {
        if (currentTime - this.lastDamageTime >= this.damageCooldown) {
            // Deal damage to the wall
            wall.takeDamage(1); // 1 damage per cooldown
            this.lastDamageTime = currentTime;  // Reset the timer
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        this.healthBar.setHealth(this.health);

        // Change material color briefly to show damage
        this.mesh.material = this.damageMaterial;

        // After 200ms, revert to the original color
        setTimeout(() => {
            this.mesh.material = this.originalMaterial;
        }, 200);

        if (this.health <= 0) {
            this.health = 0;
            this.emit('enemy-died');
        }
    }

    stopAtWall(wall) {
        if (this.hasCollidedWithWall(wall)) {
            this.hasReachedWall = true;  // Mark as reached wall
        }
    }
}
