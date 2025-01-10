import * as THREE from 'three';

class HealthBar {
    constructor(scene, targetObject, health, width = 1, height = 0.1) {
        this.scene = scene;
        this.targetObject = targetObject;

        // Create the background of the health bar
        const barGeometry = new THREE.PlaneGeometry(width, height);
        const barMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide, depthTest: false });
        this.barBackground = new THREE.Mesh(barGeometry, barMaterial);

        // Create the health portion of the health bar
        this.healthGeometry = new THREE.PlaneGeometry(width, height);
        this.healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, depthTest: false });
        this.healthBar = new THREE.Mesh(this.healthGeometry, this.healthMaterial);

        // Position the health bar above the target object
        this.barBackground.position.set(0, 3.5, 0);  // Adjust as needed
        this.healthBar.position.set(0, 3.5, 0);  // Same position as the background

        this.targetObject.add(this.barBackground);
        this.targetObject.add(this.healthBar);

        this.maxHealth = health;
        this.currentHealth = this.maxHealth;
        this.updateHealthBar();
    }

    // Set new health value and update the bar width
    setHealth(newHealth) {
        this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth)); // Clamp between 0 and maxHealth
        this.updateHealthBar();
    }

    // Update the health bar size based on current health
    updateHealthBar() {
        const healthRatio = this.currentHealth / this.maxHealth;
        this.healthBar.scale.x = healthRatio; // Scale the health bar based on health
        // Optionally change the color based on health
        if (healthRatio > 0.5) {
            this.healthMaterial.color.set(0x00ff00); // Green
        } else if (healthRatio > 0.2) {
            this.healthMaterial.color.set(0xffff00); // Yellow
        } else {
            this.healthMaterial.color.set(0xff0000); // Red
        }
    }
}

export { HealthBar };
