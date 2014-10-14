// distance between two vectors
function distance(vec1, vec2) {
	return Math.sqrt((Math.pow((vec1[0] - vec2[0]), 2) + Math.pow((vec1[1] - vec2[1]), 2)));
}

// difference between two vectors
function difference(vec1, vec2) {
	var dx = vec2[0] - vec1[0];
	var dy = vec2[1] - vec1[1];
	return [dx, dy];
}
// unit vector from two vectors
function unit_vector(vec1, vec2) {
	var diff = difference(vec1, vec2);
	var length = distance(vec1, vec2);
	return [diff[0]/length, diff[1]/length]; 
}



function vertex(pos, vel, mass, force) {
	this.pos = pos;
	this.vel = vel;
	this.mass = mass;
	this.force = force;
	
	this.apply_force = apply_force;
	this.solve_vel = solve_vel;
	this.solve_pos = solve_pos;
}

function apply_force(force) { 
	this.force[0] += force[0];
	this.force[1] += force[1];
}

function solve_vel() {
	this.vel[0] += this.force[0] / this.mass;
	this.vel[1] += this.force[1] / this.mass;
	this.force = [0, 0];
}

function solve_pos(elapsed) {
	this.pos[0] += this.vel[0] * elapsed;
	this.pos[1] += this.vel[1] * elapsed;
	
	// floor collision
	
	if (this.pos[1] < -1) { 
		this.pos[1] = -1;
		var normal_force = Math.pow(Math.abs(this.pos[1] - 1), 1) * 0.0005;
		this.apply_force([0.0, normal_force]);
		this.vel[0] = 0.0;
	}
	
}

	
function blob(number_of_vertexes, mass, radius) {
	this.center = [0, 0];
	this.color = [1.0, 1.0, 1.0, 1.0];
	this.vertex = [];
	this.draw = 1;
	this.number_of_vertexes = number_of_vertexes;
	this.mass = mass;
	this.radius = radius;
	var step = (Math.PI/number_of_vertexes)*2;
	for (var i = 0; i < number_of_vertexes; i++) {
		var angle = step * i;
		var pos = [Math.cos(angle) + 1, Math.sin(angle) + 1];
		var vel = [0, 0];
		var mass = this.mass / this.number_of_vertexes;
		var force = [0, 0];
		this.vertex[i] = new vertex(pos, vel, mass, force);
	}
	
	this.calculate_center = calculate_center;
	this.update_vertexes = update_vertexes;
	this.solve_vertex_forces = solve_vertex_forces;
	this.update = update;
}

function calculate_center() {
	this.center = [0, 0]
	var sum_x = 0;
	var sum_y = 0;
	
	for (var i=0; i < this.number_of_vertexes; i++) {
		sum_x += this.vertex[i].pos[0];
		sum_y += this.vertex[i].pos[1];
	}
	
	this.center[0] = sum_x / this.number_of_vertexes;
	this.center[1] = sum_y / this.number_of_vertexes;
}

function update_vertexes(elapsed) {
	for (var i = 0; i < this.number_of_vertexes; i++) {
		this.vertex[i].solve_vel();
		this.vertex[i].solve_pos(elapsed);
		
	}
}

function solve_vertex_forces() { 
	var dampening = 0.1; // dampening constant
	var spring = 0.001; // spring constant
	var rest = (2 * Math.sin(Math.PI)) / this.number_of_vertexes;
	

	//console.log(this.vertex);
	for (var i = 0; i < this.number_of_vertexes; i++) {
		var d_pos = difference(this.vertex[i].pos, this.vertex[(i + 1) % this.number_of_vertexes].pos);
		var d_vel = difference(this.vertex[i].vel, this.vertex[(i + 1) % this.number_of_vertexes].vel);
		var pos_mag = distance(this.vertex[i].pos, this.vertex[(i + 1) % this.number_of_vertexes].pos);
		var dotproduct = (d_vel[0] * d_pos[0]) + (d_vel[1] * d_pos[1]);
		var ks = spring * (pos_mag - rest);
		var kd = dampening * (dotproduct / pos_mag);
		var c = (-(ks + kd)) / pos_mag;
		var result1 = [d_pos[0] * c, d_pos[1] * c];
		var result2 = [-result1[0], -result1[1]];
		this.vertex[i].apply_force(result2);
		this.vertex[(i + 1) % this.number_of_vertexes].apply_force(result1);
	}
	
	var dampening = 0.1; // dampening constant
	var spring = 0.001; // spring constant
	var rest = 2 * this.radius;
	
	for (var i = 0; i < this.number_of_vertexes; i++) {
		var d_pos = difference(this.vertex[i].pos, this.vertex[(i + (this.number_of_vertexes/2)) % this.number_of_vertexes].pos);
		var d_vel = difference(this.vertex[i].vel, this.vertex[(i + (this.number_of_vertexes/2)) % this.number_of_vertexes].vel);
		var pos_mag = distance(this.vertex[i].pos, this.vertex[(i + (this.number_of_vertexes/2)) % this.number_of_vertexes].pos);
		var dotproduct = (d_vel[0] * d_pos[0]) + (d_vel[1] * d_pos[1]);
		var ks = spring * (pos_mag - rest);
		var kd = dampening * (dotproduct / pos_mag);
		var c = (-(ks + kd)) / pos_mag;
		var result1 = [d_pos[0] * c, d_pos[1] * c];
		var result2 = [-result1[0], -result1[1]];
		this.vertex[i].apply_force(result2);
		//this.vertex[(i + 4) % 8].apply_force(result1);
	}
	
	for (var i = 0; i < this.number_of_vertexes; i++) {
		this.vertex[i].apply_force([0.0, -0.0001]);
	}
	
}

function update(elapsed) {
	this.calculate_center();
	this.update_vertexes(elapsed);
	this.solve_vertex_forces();
}
