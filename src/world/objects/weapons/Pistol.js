import * as THREE from 'three';
import "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js";
import Weapon from "../../components/Weapon.js"

class Pistol extends Weapon {
    constructor(scene, camera) {
        super(scene, camera, {maxBullets: 17, bulletSpeed: 4, bulletDamage: 2, reloadTime: 1, shootCooldown:0.1})

        // Pistol components
        const barrel = new THREE.BoxGeometry(0.05, 0.10, 0.3);
        const handle = new THREE.BoxGeometry(0.05, 0.1, 0.05);
        const magazine = new THREE.BoxGeometry(0.04, 0.08, 0.02);

        const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const magMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

        // Create meshes
        this.barrelMesh = new THREE.Mesh(barrel, material);
        this.handleMesh = new THREE.Mesh(handle, material);
        this.magMesh = new THREE.Mesh(magazine, magMaterial);

        // Position components
        this.barrelMesh.position.set(0, 0, -0.15);
        this.handleMesh.position.set(0, -0.1,  -0.025);
        this.magMesh.position.set(0, 0, -0.03);

        // Add a barrel tip for effects
        this.barrelTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.barrelTip.position.set(0, 0, -0.15);
        this.barrelMesh.add(this.barrelTip);

        // Group pistol parts
        this.mesh = new THREE.Group();
        this.mesh.add(this.barrelMesh, this.handleMesh, this.magMesh);

        // Offset for positioning relative to the camera
        this.cameraOffset = { x: 0.25, y: -0.15, z: -0.35 };
    }

    reloadAnimation() {
        const originalPosition = this.mesh.position.clone();
        const originalRotation = this.mesh.rotation.clone();
        const originalMagPosition = this.magMesh.position.clone();
    
        // Gun tilt and lift
        const tiltUp = new TWEEN.Tween(this.mesh.rotation)
            .to({ z: originalRotation.y - 0.3 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out);
    
        const liftUp = new TWEEN.Tween(this.mesh.position)
            .to({ x: originalPosition.x + 0.1, y: originalPosition.y + 0.1 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out);
    
        // Magazine drop and return
        const magDrop = new TWEEN.Tween(this.magMesh.position)
            .delay(300)
            .to({ y: originalMagPosition.y - 0.3 }, 200)
            .easing(TWEEN.Easing.Quadratic.Out);
    
        const magInsert = new TWEEN.Tween(this.magMesh.position)
            .to(originalMagPosition, 200)
            .easing(TWEEN.Easing.Quadratic.In);
    
        // Return gun to original position
        const tiltDown = new TWEEN.Tween(this.mesh.rotation)
            .delay(400)
            .to(originalRotation, 300)
            .easing(TWEEN.Easing.Quadratic.In);
    
        const liftDown = new TWEEN.Tween(this.mesh.position)
            .delay(400)
            .to(originalPosition, 300)
            .easing(TWEEN.Easing.Quadratic.In);
    
        // Chain the animations
        tiltUp.chain(tiltDown);
        liftUp.chain(liftDown);
        magDrop.chain(magInsert);
    
        // Start the animations
        tiltUp.start();
        liftUp.start();
        magDrop.start();
    }
}

export { Pistol };