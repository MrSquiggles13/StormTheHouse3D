import System from "../utils/System";
import Component from "../utils/Component";
import TransformComponent from "../components/TransformComponent";


export default class DisplacementSystem extends System {

    constructor() {
        super(["transform", "mesh", "physics"]);
    }

    moveEntity(id, displacement) {
        this.queue.push({id, displacement});
    }

    update(delta, components) { 
        
        for(const q in this.queue){
            const {id, displacement} = this.queue[q];
            const transform = components["transform"].find((c) => c.id === id);
            const mesh = components["mesh"].find((c) => c.id === id);
            const physics = components["physics"].find((c) => c.id === id);

            if(transform && mesh && physics) {
                transform.position.x += displacement;
                mesh.position.x += displacement;
                physics.position.x += displacement;
            }
        }

    }

}