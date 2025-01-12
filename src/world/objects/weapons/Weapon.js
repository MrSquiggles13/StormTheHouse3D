import * as THREE from 'three';
import Entity from '../Entity';

export default class Weapon extends Entity {
    constructor(scene, camera, { maxBullets, bulletSpeed, bulletDamage, reloadTime, shootCooldown, fullAuto = false, spread = 0, canZoom = false, zoomFOV = 0 }) {
        super()
        this.scene = scene
        this.camera = camera;

        // Shooting variables
        this.bullets = [];
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.shootCooldown = shootCooldown; // Seconds between shots
        this.lastShotTime = 0;

        this.maxBullets = maxBullets;  // Max bullets per reload
        this.bulletCount = this.maxBullets; // Start with max bullets
        this.reloading = false;
        this.reloadTime = reloadTime; // Time to reload in seconds

        this.fullAuto = fullAuto;
        this.spread = spread;

        this.bullet_ui = document.getElementById("bullet-count")
        this.bullet_ui.innerText = `Bullets: ${this.bulletCount} / ${this.maxBullets}`

        this.canZoom = canZoom
        this.zoomFOV = zoomFOV

        this.on('impact', (point) => this.createImpactEffect(point));

    }

    shoot() {
        const currentTime = performance.now() / 1000;
        if (currentTime - this.lastShotTime < this.shootCooldown || this.reloading) return null;

        if (this.bulletCount <= 0) {
            this.reload();
            return null;
        }

        // Raycasting
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);


        // // Apply random spread
        const spreadDirection = new THREE.Vector3(
            raycaster.ray.direction.x + (Math.random() - 0.5) * this.spread,
            raycaster.ray.direction.y + (Math.random() - 0.5) * this.spread,
            raycaster.ray.direction.z
        ).normalize();

        raycaster.ray.direction.copy(spreadDirection);
        
        this.emit('shot', raycaster);

        this.createMuzzleFlash();
        this.createBulletTracer(spreadDirection);

        this.bulletCount--;
        this.bullet_ui.innerText = `Bullets: ${this.bulletCount} / ${this.maxBullets}`; // ui handler
        this.lastShotTime = currentTime;
    }



    createBulletTracer(direction) {

        const barrelTipWorldPosition = new THREE.Vector3();
        this.barrelTip.getWorldPosition(barrelTipWorldPosition);

        // Create a ray from the camera through the center of the screen
        const raycaster = new THREE.Raycaster();
        const centerNDC = new THREE.Vector2(0, 0); // Reticule at center
        raycaster.setFromCamera(centerNDC, this.camera);

        // Get the tracer direction
        const tracerDirection = new THREE.Vector3();
        tracerDirection.copy(direction).normalize();

        // Create a tracer mesh (a small white line)
        const tracerGeometry = new THREE.BufferGeometry().setFromPoints([
            barrelTipWorldPosition,
            barrelTipWorldPosition.clone().add(tracerDirection.multiplyScalar(100)) // Extend tracer length
        ]);

        const tracerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const tracer = new THREE.Line(tracerGeometry, tracerMaterial);
        tracer.name = "tracer";

        // Add the tracer to the scene
        this.scene.add(tracer);

        // Remove the tracer after a short duration
        setTimeout(() => {
            this.scene.remove(tracer);
        }, 100);
    }

    createImpactEffect(point) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const impact = new THREE.Mesh(geometry, material);

        impact.name = "impact";

        impact.position.copy(point);
        this.scene.add(impact);

        // Remove the impact effect after a short time
        setTimeout(() => this.scene.remove(impact), 500);
    }

    createMuzzleFlash() {
        // Create the muzzle flash
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffa500 })
        );

        // Position the flash at the barrel tip
        const barrelTipWorldPosition = new THREE.Vector3();
        this.barrelTip.getWorldPosition(barrelTipWorldPosition);
        flash.position.copy(barrelTipWorldPosition);

        this.scene.add(flash);

        // Remove the flash after a short time
        setTimeout(() => {
            this.scene.remove(flash);
        }, 20); // Muzzle flash duration
    }

    updateUI() {
        this.bullet_ui.innerText = `Bullets: ${this.bulletCount} / ${this.maxBullets}`
    }

    // Reload method
    reload() {
        if (this.reloading) return;
        if (this.bulletCount == this.maxBullets) return;

        this.reloading = true;
        this.reloadAnimation()
        setTimeout(() => {
            this.bulletCount = this.maxBullets; // Reset bullet count after reloading
            this.reloading = false;
            this.updateUI();
        }, this.reloadTime * 1000); // Time to reload
    }


    reloadAnimation() {

    }

    update() {
        if (!this.reloading) {
            this.mesh.position.set(this.cameraOffset.x, this.cameraOffset.y, this.cameraOffset.z);
            this.mesh.rotation.copy(this.camera.rotation);
        }

        for (const bullet of this.bullets) {
            bullet.tracer.translateZ(-this.bulletSpeed * delta);
        }

        // Remove bullets that are too far away
        this.bullets = this.bullets.filter(bullet => {
            if (bullet.tracer.position.length() > 100) {
                this.scene.remove(bullet);
                return false;
            }
            return true;
        });
    }
}