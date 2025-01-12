import * as THREE from 'three';
import HealthBar from '../../components/Healthbar.js';

export default class Wall {
    constructor() {
        // Create a simple wall
        const geometry = new THREE.BoxGeometry(25, 3, 0.5);
        this.originalMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        this.damageMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color for damage feedback
        this.material = this.originalMaterial; // Start with the original material
        this.mesh = new THREE.Mesh(geometry, this.material);

        // Wall properties
        this.health = 200;
        this.max_health = this.health
        this.health_ui = document.getElementById("health-bar")
        this.health_ui.style.width = `${(this.health/this.max_health) * 100}%`
        this.healthBar = new HealthBar(this.mesh, this.health, 20, 1)
    }

    // Method to reduce wall health
    takeDamage(amount) {
        this.health -= amount;

        this.healthBar.setHealth(this.health)
        this.health_ui.style.width = `${(this.health/this.max_health) * 100}%`

        // Change material color briefly to show damage
        this.mesh.material = this.damageMaterial;

        // After 200ms, revert to the original color
        setTimeout(() => {
            this.mesh.material = this.originalMaterial;
        }, 200);

        if (this.health <= 0) {
            this.health = 0;
        }
    }

    // Helper to get the wall's bounding box
    getBoundingBox() {
        return new THREE.Box3().setFromObject(this.mesh);
    }
}