import { World } from './world/World.js';

function main() {
    const container = document.body;
    const world = new World(container);
    world.start();
}

main();
