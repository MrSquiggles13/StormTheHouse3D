import * as THREE from 'three';
import "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js";
import Weapon from "../../components/Weapon.js"


export default class SubMachinegun extends Weapon {
    constructor(scene, camera) {
        super(scene, camera, { maxBullets: 32, bulletSpeed: 7, bulletDamage: 1, reloadTime: 1.5, shootCooldown: 0.05, fullAuto: true, spread: 0.03 })

        // SMG components (basic mesh for now)
        const body = new THREE.BoxGeometry(0.1, 0.1, 0.3);
        const barrel = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
        const handle = new THREE.BoxGeometry(0.05, 0.2, 0.05);

        const material = new THREE.MeshStandardMaterial({ color: 0x555555 });

        this.bodyMesh = new THREE.Mesh(body, material);
        this.barrelMesh = new THREE.Mesh(barrel, material);
        this.frontHandleMesh = new THREE.Mesh(handle, material);
        this.backHandleMesh = new THREE.Mesh(handle, material);

        // Position components
        this.bodyMesh.position.set(0, -0.25, -0.1);
        this.barrelMesh.position.set(0, -0.25, -0.3);
        this.barrelMesh.rotation.x = Math.PI / 2;
        this.frontHandleMesh.position.set(0, -0.35, -0.15);
        this.backHandleMesh.position.set(0, -0.35, 0);

        // Add a barrel tip (small sphere for reference)
        this.barrelTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Visible for debugging
        ); // Use this name to access it later
        this.barrelTip.position.set(0, -0.2, 0); // Position at the end of the barrel
        // barrelTip.rotation.x = Math.PI / 2;
        this.barrelMesh.add(this.barrelTip);

        // Group the SMG parts together
        this.mesh = new THREE.Group();
        this.mesh.add(this.bodyMesh, this.barrelMesh, this.frontHandleMesh, this.backHandleMesh);

        // Offset for positioning relative to the camera
        this.cameraOffset = { x: 0.3, y: 0.1, z: -0.4 };
    }

    reloadAnimation() {

        const originalPosition = this.mesh.position.clone();
        const originalRotation = this.mesh.rotation.clone();

    }
}