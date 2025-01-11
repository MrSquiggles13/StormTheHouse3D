import * as THREE from 'three';
import Enemy from '../objects/Enemy.js';

export default class EnemyHandler {
    constructor(wall) {
        this.enemies = [];
        this.enemyCount = 5; // Initial number of enemies for the first wave
        this.waveTimeLimit = 180; // 3 minutes in seconds
        this.timeSinceLastWave = 0; // Timer for wave spawn
        this.spawnDelayMin = 1; // Minimum delay between spawns (in seconds)
        this.spawnDelayMax = 5; // Maximum delay between spawns (in seconds)
        this.wall = wall;
        this.enemiesSpawnedThisWave = 0;
        this.isSpawningWave = true;

        this.spawnWave()
    }

    // Function to spawn enemies with staggered timing
    spawnEnemies(enemiesToSpawn) {
        this.enemiesSpawnedThisWave = 0;

        for (let i = 0; i < enemiesToSpawn; i++) {
            // Random delay between 1 and 5 seconds
            const delay = Math.random() * (this.spawnDelayMax - this.spawnDelayMin) + this.spawnDelayMin;
            
            // Spawn each enemy after the random delay
            setTimeout(() => {
                this.spawnEnemy();
                this.enemiesSpawnedThisWave++; // Increment the spawned count
                
                // Once all enemies are spawned, mark the wave as finished

                if (this.enemiesSpawnedThisWave === enemiesToSpawn) {
                    this.isSpawningWave = false; // Allow next wave to start
                }

            }, delay * 1000); // setTimeout is in milliseconds, so multiply delay by 1000
        }
    }

    // Function to spawn a single enemy at a random position
    spawnEnemy() {
        const x = Math.random() * 20 - 10; // Fixed X position (could be adjusted as per your game design)
        const z = -20; // Random Z between -10 and 10
        const y = 1.5; // Ensure it's not below ground level
        
        // Ensure no overlap
        const spawnPosition = new THREE.Vector3(x, y, z);

        const enemy = new Enemy(spawnPosition);
        this.enemies.push(enemy);
    }

    // Update function for spawning waves
    update(delta, currentTime) {
        this.timeSinceLastWave += delta;

        if (!this.isSpawningWave && (this.timeSinceLastWave > this.waveTimeLimit || this.enemies.length === 0)) {
            this.spawnWave();
            this.timeSinceLastWave = 0; // Reset timer
        }

        this.enemies.forEach((enemy, index) => {
            enemy.move();
    
            // Stop and start dealing damage when the enemy reaches the wall
            enemy.stopAtWall(this.wall);

            // Deal damage if the enemy has reached the wall
            if (enemy.hasReachedWall) {
                enemy.dealDamageToWall(this.wall, currentTime);  // Deal damage every 2 seconds
            }

            if (enemy.health <= 0) {
                this.scene.remove(enemy.mesh); // signal mesh destroyed
                this.enemies.splice(index, 1);
            }
    
        });
    }

    // Function to spawn a new wave (increase enemy count each time)
    spawnWave() {
        this.isSpawningWave = true;

        this.spawnEnemies(this.enemyCount);
        this.enemyCount += 1; // Add one more enemy for the next wave
    }
}