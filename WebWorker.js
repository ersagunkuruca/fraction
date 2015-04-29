importScripts("BigInteger.js", "Fraction.js");
onmessage = function (e) {
	var message = e.data;
	console.log(message);
	var typeOfObject = message[0];
	var functionToExecute = message[1];
	var objects = message[2];
	var ob = [];
	for (var i = objects.length - 1; i >= 0; i--) {
		ob[i] = new (self[typeOfObject])(0);

		for (prop in objects[i]) {
			console.log(prop);
			if (objects[i].hasOwnProperty(prop)){
				ob[i][prop] = objects[i][prop];
			}
		}
	};
	console.log(ob);

	postMessage(self[typeOfObject].prototype[functionToExecute].call(ob[0],ob[1]));
};