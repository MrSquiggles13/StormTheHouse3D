import Component from "./Component";
import System from "./System";

export default class Viro {
    public entities: Map<string, string>;
    public components:{ [key: string]: Component[] };
    public systems: System[];

    constructor() {
        this.entities = new Map();
        this.components = {};
        this.systems = [];
    }

    createEntity(id: string, name: string, components: Component[]) {
        this.entities.set(id, name);
        for(const component of components) {
            this.addComponent(component);
        }
    }

    addComponent(component: Component) {
        if(!this.components[component.type]) {
            this.components[component.type] = [];
        }
        this.components[component.type].push(component);
    }

    addSystem(system: System) {
        this.systems.push(system);
    }

    update(delta: number) {
        for(const system of this.systems) {
            system.update(delta, this.components);
        }
    }
}