import * as THREE from 'three';
import MainViro from '../viros/MainViro';
import TransformComponent from '../components/TransformComponent';

export default class GameLoop {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private clock: THREE.Clock;
    private viro: MainViro;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        this.viro = new MainViro();
        const thing = new TransformComponent(new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0, 'XYZ'), new THREE.Vector3(0, 0, 0))
        this.viro.addComponent(thing);

        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private update() {
        const delta = this.clock.getDelta();
        // Placeholder for game update logic
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    public start() {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    }
}