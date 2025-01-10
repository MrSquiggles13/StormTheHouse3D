import * as THREE from 'three';
import { Enemy } from './objects/Enemy.js';
import { Player } from './objects/Player.js';
import { Ground } from './objects/Ground.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Watchtower } from './objects/Watchtower.js';
import { Skybox } from './objects/Skybox.js';
import { Wall } from './objects/Wall.js';
import { EnemyHandler } from './utilities/EnemyHandler.js';
import "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js";

class World {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        this.activeCamera = this.camera;

        this.freeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.freeCamera.position.set(10, 10, 10);
        this.freeCamera.lookAt(0, 0, 0);

        this.freeCameraControls = new OrbitControls(this.freeCamera, this.renderer.domElement);
        this.freeCameraControls.enableDamping = true;
        this.freeCameraControls.dampingFactor = 0.05;
        this.freeCameraControls.screenSpacePanning = false;

        // Resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Add lights
        const light = new THREE.AmbientLight(0x9f9f9f, 0.5);
        this.scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        this.skybox = new Skybox(this.scene);

        // Initialize player and enemies
        this.player = new Player(this.scene, this.camera);

        // Add ground
        this.ground = new Ground();
        this.scene.add(this.ground.mesh);

        this.watchtower = new Watchtower(this.scene);
        this.watchtower.towerGroup.position.z = (this.ground.mesh.length / 2) - 10;
        this.scene.add(this.watchtower.towerGroup);

        this.player.mesh.position.y = this.watchtower.platformBox.max.y + this.player.mesh.scale.y + 0.2;
        this.player.mesh.position.z = this.watchtower.towerGroup.position.z;

        this.wall = new Wall(this.scene);
        this.wall.mesh.position.z = (this.ground.mesh.length / 2) - 30;
        this.wall.mesh.position.y = 1.5
        this.scene.add(this.wall.mesh);

        this.enemySpawner = new EnemyHandler(this.scene, this.wall);

        this.addEventListeners();

    }

    onPointerLockChange() {
        if (document.pointerLockElement === document.body) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    addEventListeners() {
        // Mouse movement for camera rotation
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Pointer Lock for FPS style mouse control
        window.addEventListener('click', () => {
            if (this.activeCamera === this.freeCamera) return;
            document.body.requestPointerLock();
        });

        window.addEventListener('pointerlockchange', this.onPointerLockChange);

        // Keyboard movement
        // window.addEventListener('keydown', (e) => );
        window.addEventListener('keyup', (e) => this.player.handleKeyup(e));

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyC') {
                this.activeCamera = (this.activeCamera === this.camera) ? this.freeCamera : this.camera;
            } else {
                if (this.activeCamera === this.freeCamera) return;
                this.player.handleKeydown(e)
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (this.activeCamera === this.freeCamera) return;
            this.player.handleMouseDown(e);
        })

        window.addEventListener('mouseup', (e) => {
            if (this.activeCamera === this.freeCamera) return;
            this.player.handleMouseUp(e);
        })


        // Set up the scroll event listener
        window.addEventListener('wheel', (e) => {
            if (this.activeCamera === this.freeCamera) return;            
            this.player.smoothZoom(e.deltaY)
        });

    }

    update() {
        const delta = this.clock.getDelta();

        if (this.activeCamera === this.camera) {
            this.player.update(delta, this.watchtower);
        } else {
            this.freeCameraControls.update();
        }

        const currentTime = performance.now() / 1000;  // Current time in seconds

        this.enemySpawner.update(delta, currentTime);

        TWEEN.update()
    
    }

    onMouseMove(event) {
        if (this.activeCamera === this.freeCamera) return;
        this.player.onMouseMove(event);
    }

    render() {
        this.renderer.render(this.scene, this.activeCamera);
    }

    start() {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    }
}

export { World };
