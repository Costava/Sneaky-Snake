function Timestepper() {}

// delta time. Time between steps in milliseconds
Timestepper.prototype.dt = 500;

// Maximum number of steps allowed per call
Timestepper.prototype.maxSteps = 1;

// currentTime
// newTime

// time accumulated
Timestepper.prototype.time = 0;

// notStarted, running, paused
Timestepper.prototype.state = 'notStarted';

/**
 * Clear accumulated time
 */
Timestepper.prototype.clear = function() {
	this.time = 0;

	this.currentTime = new Date().getTime();
}

//callbacks
Timestepper.prototype.stepCallback = function() {
	console.log("Timestepper stepped.");
};

Timestepper.prototype.accumulate = function() {
	if (this.state != 'notStarted') {
		var newTime = new Date().getTime();
		var frameTime = newTime - this.currentTime;

		this.currentTime = newTime;//not needed, but marks time of pause

		this.time += frameTime;
	}
	else {
		console.log("Timestepper cannot accumulate. Timestepper never started.");
	}
};

//Start
Timestepper.prototype.Start = function() {
	if (this.state === 'notStarted' || this.state === 'paused') {
		this.currentTime = new Date().getTime();

		this.state = 'running';

		with (this) {
			setTimeout(function() {Update();}, 0);
		}
	}
	else {
		// TODO: .warn? .error?
		console.log("Timestepper already running. state:", this.state);
	}
};

//Pause
Timestepper.prototype.Pause = function() {
	if (this.state === 'running') {
		this.accumulate();

		this.state = 'paused';
	}
	else {
		// TODO: .warn? .error?
		console.log("Timestepper will not pause because not currently running. state:", this.state);
	}
};

//Update
Timestepper.prototype.Update = function() {
	if (this.state === 'running') {
		this.accumulate();

		var steps = 0;

		while (steps < this.maxSteps && this.time >= this.dt) {
			this.time -= this.dt;
			steps += 1;

			this.stepCallback();
		}

		if (this.state === 'running') {
			with (this) {
				setTimeout(function() {Update();}, 0);
			}
		}
	}
	else {
		console.log("Timestepper will not call update again. state:", this.state);
	}
};



module.exports = Timestepper;
