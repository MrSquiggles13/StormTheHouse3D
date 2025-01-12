import {Group} from '@tweenjs/tween.js'
import Entity from '../objects/Entity';

export default class AnimationHandler extends Entity {
    constructor() {
        super()
        this.animations = new Group();
    }

    addAnimation(animation) {
        this.animations.add(animation);
    }

    update(deltaTime) {
        this.animations.update(deltaTime);
    }
}