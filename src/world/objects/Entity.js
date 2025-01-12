import { EventEmitter } from 'events'

export default class Entity {
    static ee = new EventEmitter();

    constructor() {
        this.children = [];
        // this.position = new THREE.Vector3();
        // this.rotation = new THREE.Euler();
        // this.scale = new THREE.Vector3(1, 1, 1);
    }

    on(event, callback) {
        Entity.ee.on(event, callback);
    }

    emit(event, ...args) {
        Entity.ee.emit(event, ...args);
    }
}