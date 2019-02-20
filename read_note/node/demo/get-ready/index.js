const ready = require('get-ready');

class Life {
	constructor() {
		ready.mixin(this);
	}
	start(fn) {
		this.ready = fn;
		this.ready(true);
	}
}

class Core {
	constructor() {
		this.lifecycle = new Life();
	}
	ready(fn) {
		return this.lifecycle.start(fn);
	}
}
class Agent extends Core {
	constructor() {
		super();
	}
}

class Master {
	constructor() {
		ready.mixin(this);
		this.ready(true);
		this.ready(() => {
			console.log('master ready');
		});
		this.callAgent();
	}
	callAgent() {
		const agent = new Agent();
		agent.ready(err => {
			console.log('agent ready');
		});
	}
}

new Master().ready(undefined);
