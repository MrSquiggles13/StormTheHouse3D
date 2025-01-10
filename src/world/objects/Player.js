import * as THREE from 'three';
import { Rifle } from './weapons/Rifle.js';
import { Pistol } from './weapons/Pistol.js';
import SubMachinegun from './weapons/SubMachinegun.js';

class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.money = 0;
        this.money_ui = document.getElementById("money")
        this.money_ui.innerText = `Money: ${this.money}`

        // Capsule geometry for the player
        this.geometry = new THREE.CapsuleGeometry(0.5, 3, 4, 8);
        this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Movement speed and camera control sensitivity
        this.speed = 5;
        this.mouseSensitivity = 0.002;
        this.velocity = new THREE.Vector3();
        this.moveDirection = new THREE.Vector3();

        // Camera controls
        this.yawObject = new THREE.Object3D();  // Rotate left/right (yaw)
        this.pitchObject = new THREE.Object3D();  // Rotate up/down (pitch)

        this.pitchObject.add(this.camera);  // Camera attached to pitchObject
        this.yawObject.add(this.pitchObject);  // pitchObject attached to yawObject
        this.mesh.add(this.yawObject);  // Add yawObject to the scene (root of the player's head)
        this.yawObject.position.set(0, 1.2, 0);  // Position the yawObject in front of the player

        // Movement control state
        this.isMovingForward = false;
        this.isMovingBackward = false;
        this.isMovingLeft = false;
        this.isMovingRight = false;

        this.weapons = { rifle: new Rifle(this.scene, this.camera), pistol: new Pistol(this.scene, this.camera), smg: new SubMachinegun(this.scene, this.camera) };
        this.equippedWeapon = this.weapons["smg"]
        this.isShooting = false

        this.camera.add(this.equippedWeapon.mesh)

        this.zoomedInFOV = this.equippedWeapon.zoomFOV;  // Zoomed-in field of view
        this.defaultFOV = 75;    // Default field of view
        this.currentFOV = this.defaultFOV // To lerp zoom
        this.isAiming = false;   // To track whether the player is aiming or not

    }

    handleKeydown(event) {
        switch (event.code) {
            case 'KeyW': this.isMovingForward = true; break;
            case 'KeyS': this.isMovingBackward = true; break;
            case 'KeyA': this.isMovingLeft = true; break;
            case 'KeyD': this.isMovingRight = true; break;

            case 'KeyR': this.equippedWeapon.reload(); break;

            case 'Digit1': this.equipWeapon(this.weapons["pistol"]); break;
            case 'Digit2': this.equipWeapon(this.weapons["rifle"]); break;
            case 'Digit3': this.equipWeapon(this.weapons["smg"]); break;
        }
    }

    handleKeyup(event) {
        switch (event.code) {
            case 'KeyW': this.isMovingForward = false; break;
            case 'KeyS': this.isMovingBackward = false; break;
            case 'KeyA': this.isMovingLeft = false; break;
            case 'KeyD': this.isMovingRight = false; break;
        }
    }

    handleMouseDown(event) {
        if (event.button === 0) {
            this.startShooting();
        }

        if (event.button === 2) {
            this.handleAiming();
        }
    }

    handleMouseUp(event) {
        if (event.button === 0) {
            this.stopShooting();
        }

        if (event.button === 2) {
            this.handleStopAiming();
        }
    }

    onMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;

            this.yawObject.rotation.y -= movementX * this.mouseSensitivity;
            this.pitchObject.rotation.x -= movementY * this.mouseSensitivity;

            // Limit vertical camera rotation
            this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        }
    }

    equipWeapon(weapon) {
        if (this.equippedWeapon.reloading) return;
        this.camera.remove(this.equippedWeapon.mesh)
        this.equippedWeapon = weapon
        this.equippedWeapon.updateUI()
        this.camera.add(this.equippedWeapon.mesh)
        this.zoomedInFOV = this.equippedWeapon.zoomFOV;
    }

    // Update function for handling the aiming mechanic
    handleAiming() {
        if(!this.equippedWeapon.canZoom) return

        this.isAiming = true
        this.currentFOV = this.zoomedInFOV
    }

    // For mouse release
    handleStopAiming() {
        if(!this.equippedWeapon.canZoom) return

        this.isAiming = false
    }

    // scroll wheel zooming
    smoothZoom(dY) {
        if(!this.equippedWeapon.canZoom) return
        if(!this.isAiming) return
        // Adjust the FOV based on scroll direction
        const zoomSpeed = 2;

        if (dY < 0) {
            this.currentFOV = Math.max(this.zoomedInFOV - 15, this.currentFOV - zoomSpeed)
        } else {
            this.currentFOV = Math.min(this.zoomedInFOV + 15, this.currentFOV + zoomSpeed)
        }

    }

    startShooting() {
        this.isShooting = true
        this.shoot()
    }

    stopShooting() {
        this.isShooting = false
    }

    shoot() {
        if (!this.isShooting) return;
        const hit = this.equippedWeapon.shoot();

        // Check if the hit object is an enemy
        if (hit && hit.object.name === 'enemy') {
            hit.object.enemy.takeDamage(this.equippedWeapon.bulletDamage);

            if (hit.object.enemy.health <= 0) {
                this.money += 10;
                this.money_ui.innerText = `Money: ${this.money}`;
            }

        }

        if (this.equippedWeapon.fullAuto) {
            setTimeout(() => {
                this.shoot();
            }, this.equippedWeapon.shootCooldown * 1000);
        }

    }

    reload() {
        this.equippedWeapon.reload()
    }

    update(delta, watchtower) {
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.yawObject.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyEuler(this.yawObject.rotation);

        // Reset the movement direction vector to 0 each frame
        this.moveDirection.set(0, 0, 0);

        // Add movement based on key input
        if (this.isMovingForward) this.moveDirection.add(forward);
        if (this.isMovingBackward) this.moveDirection.add(forward.negate()); // Move backward (reverse direction)
        if (this.isMovingLeft) this.moveDirection.add(right.negate()); // Move left (reverse right direction)
        if (this.isMovingRight) this.moveDirection.add(right);

        // Normalize the direction to keep movement speed consistent in all directions
        if (this.moveDirection.lengthSq() > 0) {
            this.moveDirection.normalize();
        }

        // Apply speed and delta time to calculate the final velocity
        const moveSpeed = this.speed * delta;
        this.velocity.copy(this.moveDirection).multiplyScalar(moveSpeed);

        // Apply velocity to the player mesh's position
        this.mesh.position.add(this.velocity);

        // Check for collisions with the watchtower walls
        watchtower.checkPlayerCollisionWalls(this);
        watchtower.checkPlayerCollisionPlatform(this);

        this.equippedWeapon.update()

        const scopeOverlay = document.getElementById('scope-overlay');

        if (this.isAiming) {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.currentFOV, 0.1);
            scopeOverlay.style.display = 'flex';
            setTimeout(() => {
                scopeOverlay.style.opacity = 1;
            }, 10);
        } else {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.defaultFOV, 0.1);
            scopeOverlay.style.opacity = 0;
            setTimeout(() => {
                scopeOverlay.style.display = 'none';
            }, 500);
        }
        this.camera.updateProjectionMatrix();

        // Reset velocity after collision to prevent sliding
        this.velocity.set(0, 0, 0);

        // Prevent player from falling below the ground
        if (this.mesh.position.y < 0.5) {
            this.mesh.position.y = 0.5;
        }


    }

}

export { Player };
