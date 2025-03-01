import * as THREE from 'three'
import Component from '../utils/Component'

export default class TransformComponent extends Component {

    constructor(id, pos, rot, scale) {
        this.id = crypto.randomUUID();

        this.position = pos;
        this.rotation = rot;
        this.scale = scale;
    }
}