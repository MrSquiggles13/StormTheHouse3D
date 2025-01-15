import * as THREE from 'three';
import Entity from '../Entity';

export default class Weapon extends Entity {
    constructor(camera, { maxBullets, bulletSpeed, bulletDamage, reloadTime, shootCooldown, fullAuto = false, spread = 0, canZoom = false, zoomFOV = 0 }) {
        super()
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

        const tracer = new Entity();

        tracer.mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            barrelTipWorldPosition,
            barrelTipWorldPosition.clone().add(tracerDirection.multiplyScalar(100)) // Extend tracer length
        ]), new THREE.LineBasicMaterial({ color: 0xffffff }));

        tracer.name = "tracer";

        this.emit('add', tracer);

        // Remove the tracer after a short duration
        setTimeout(() => {
            this.emit('remove', tracer);
        }, 100);
    }

    createImpactEffect(point) {
        const impact = new Entity();
        impact.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8), 
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );

        impact.mesh.name = "impact";
        impact.mesh.position.copy(point);

        this.emit('add', impact);

        // Remove the impact effect after a short time
        setTimeout(() => this.emit('remove', impact), 500);
    }

    createMuzzleFlash() {
        // Create the muzzle flash
        const flash = new Entity();
        flash.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffa500 })
        );

        // Position the flash at the barrel tip
        const barrelTipWorldPosition = new THREE.Vector3();
        this.barrelTip.getWorldPosition(barrelTipWorldPosition);
        flash.mesh.position.copy(barrelTipWorldPosition);

        this.emit('add', flash);

        // Remove the flash after a short time
        setTimeout(() => {
            this.emit('remove', flash);
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
                this.emit('remove', bullet);
                return false;
            }
            return true;
        });
    }
}