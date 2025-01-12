import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import Weapon from "./Weapon.js"

export default class Rifle extends Weapon {

    constructor(scene, camera) {
        super(scene, camera, {maxBullets: 8, bulletSpeed: 5, bulletDamage: 4, reloadTime: 2, shootCooldown: 1, canZoom: true, zoomFOV: 40})

        // Rifle components
        const stock = new THREE.BoxGeometry(0.3, 0.1, 0.05);
        const barrel = new THREE.CylinderGeometry(0.02, 0.02, 1);
        const handle = new THREE.BoxGeometry(0.1, 0.2, 0.05);

        // Materials
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });

        // Create meshes
        this.stockMesh = new THREE.Mesh(stock, material);
        this.barrelMesh = new THREE.Mesh(barrel, material);
        this.handleMesh = new THREE.Mesh(handle, material);

        // Position components
        this.stockMesh.position.set(0, -0.25, 0.1);
        this.stockMesh.rotation.y = Math.PI / 2;
        this.barrelMesh.position.set(0, -0.2, -0.5);
        this.barrelMesh.rotation.x = Math.PI / 2;
        this.handleMesh.position.set(0, -0.3, -0.1);
        this.handleMesh.rotation.y = Math.PI / 2;


        // Add a barrel tip (small sphere for reference)
        this.barrelTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Visible for debugging
        ); // Use this name to access it later
        this.barrelTip.position.set(0, -0.5, 0); // Position at the end of the barrel
        // barrelTip.rotation.x = Math.PI / 2;
        this.barrelMesh.add(this.barrelTip);

        // Group rifle parts together
        this.mesh = new THREE.Group();
        this.mesh.add(this.stockMesh);
        this.mesh.add(this.barrelMesh);
        this.mesh.add(this.handleMesh);

        this.cameraOffset = { x: 0.3, y: 0.1, z: -0.4 }

    }

    reloadAnimation() {
        const originalPosition = this.mesh.position.clone();
        const originalRotation = this.mesh.rotation.clone();

        // Create the reload animation sequence
        const bringInTween = new TWEEN.Tween(this.mesh.position)
            .to({ y: originalPosition.y - 0.1, x: originalPosition.x - 0.2, z: originalPosition.z + 0.2 }, 400) // Bob down slightly
            .easing(TWEEN.Easing.Quadratic.Out)

        const tiltUpTween = new TWEEN.Tween(this.mesh.rotation)
            .to({ x: originalRotation.y + 0.5 }, 400) // Tilt rifle upward
            .easing(TWEEN.Easing.Quadratic.Out)

        const tiltDownTween = new TWEEN.Tween(this.mesh.rotation)
            .delay(1200)
            .to({ x: originalRotation.y }, 300) // Return to original rotation
            .easing(TWEEN.Easing.Quadratic.In)

        const bringOutTween = new TWEEN.Tween(this.mesh.position)
            .delay(800)
            .to({ y: originalPosition.y, x: originalPosition.x, z: originalPosition.z }, 300)
            .easing(TWEEN.Easing.Quadratic.In)

        const joltInTween = new TWEEN.Tween(this.mesh.position)
            .delay(100) // Delay the jolt until the rifle has moved down a little bit
            .to({ y: originalPosition.y }, 150)
            .easing(TWEEN.Easing.Quadratic.In)

        const joltOutTween = new TWEEN.Tween(this.mesh.position)
            .to({ y: originalPosition.y - 0.1 }, 150) // Use the jolted position instead of the original
            .easing(TWEEN.Easing.Quadratic.Out)

        // Chain the animations for a smooth reload sequence
        tiltUpTween.chain(tiltDownTween)
        bringInTween.chain(joltInTween)
        joltInTween.chain(joltOutTween)
        joltOutTween.chain(bringOutTween)

        // Start the animations
        tiltUpTween.start();
        bringInTween.start();
    }

}