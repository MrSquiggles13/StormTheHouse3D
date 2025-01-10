import * as THREE from 'three';

class Skybox {
    constructor(scene) {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '/assets/skybox/px.png',
            '/assets/skybox/nx.png',
            '/assets/skybox/py.png',
            '/assets/skybox/ny.png',
            '/assets/skybox/pz.png',
            '/assets/skybox/nz.png',
        ]);
        scene.background = texture;
    }
}

export { Skybox };