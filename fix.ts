function ApplyOptions(options: ExtendableOptions): Function {
    return (target) => class extends target {
        public constructor(_options) {
            super(options);
        }
    }
}

abstract class Extendable {
    public staticPropertyNames: { [key: string]: any };

    public instancePropertyNames: { [key: string]: any };

    public originals: Map<any, OriginalPropertyDescriptor>;

    public constructor(options: ExtendableOptions = {appliesTo: []}) {
        const staticPropertyNames = Object.getOwnPropertyNames(this.constructor)
            .filter((name) => !['length', 'prototype', 'name'].some((val) => val === name));

        const instancePropertyNames = Object.getOwnPropertyNames(this.constructor.prototype)
            .filter((name) => name !== 'constructor');

        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this.constructor)));
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this.constructor).prototype));

        this.staticPropertyNames = Object.assign({}, ...staticPropertyNames
            .map((name) => ({ [name]: Object.getOwnPropertyDescriptor(this.constructor, name) })));

        this.instancePropertyNames = Object.assign({}, ...instancePropertyNames
            .map((name) => ({ [name]: Object.getOwnPropertyDescriptor(this.constructor.prototype, name) })))

		this.originals = new Map(options.appliesTo.map(structure => [structure, {
			staticPropertyDescriptors: Object.assign({}, ...staticPropertyNames
				.map(name => ({ [name]: Object.getOwnPropertyDescriptor(structure, name) || { value: undefined } }))),
			instancePropertyDescriptors: Object.assign({}, ...instancePropertyNames
				.map(name => ({ [name]: Object.getOwnPropertyDescriptor(structure.prototype, name) || { value: undefined } })))
		}]));
    }

    public get appliesTo() {
        return [...this.originals.keys()];
    }

    public enable() {
        for (const structure of this.originals.keys()) {
            Object.defineProperties(structure, this.staticPropertyNames);
            Object.defineProperties(structure.prototype, this.instancePropertyNames);
        }
    }
}

interface OriginalPropertyDescriptor {
    staticPropertyDescriptors: any;
    instancePropertyDescriptors: any;
}

interface ExtendableOptions {
    appliesTo: any[]
}


class Foo {}

@ApplyOptions({
    appliesTo: [Foo]
})
class Test extends Extendable {
    public static test(): void {
        return;
    }

    public async list(): Promise<void> {
        return;
    }
}


const instance = new Test();
console.log(instance);

instance.enable();
console.log(Foo);
console.log(Foo.prototype);
