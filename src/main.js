import GameLoop from "./utils/GameLoop";

function main() {
    const container = document.body;
    const gameLoop = new GameLoop(container);
    gameLoop.start();
}

main();
