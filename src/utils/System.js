import Component from "./Component"

export default class System {
    public componentReferences: string[]
    public queue: any[] = []

    constructor(componentReferences: string[]) {
        this.componentReferences = componentReferences
    }

    addComponentReference(componentReference: string) {
        this.componentReferences.push(componentReference)
    }

    update(delta: number, components: { [key: string]: Component[] }) {

    }
}