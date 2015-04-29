function FractionData (data, base) {
	if (typeof data === 'object') {
		if (!(data instanceof Fraction)) {
			this.data = data.data;
			this.usedData = data.usedData;
			return;
		}
	}
	this.data = new Fraction(data, 1, base);
	this.dataControl = new Fraction({numerator:this.data.numerator.clone()._shiftLeft().add(1),denominator:this.data.denominator.clone()._shiftLeft()},base);
	this.usedData = [];
	return;
};
FractionData.prototype.getData = function (base) {
	var f = this.data.numerator.multiply(base).divide(this.data.denominator);
	var control = this.dataControl.numerator.multiply(base).divide(this.dataControl.denominator);
	if (control[0].EQ(f[0])) {
		this.data = new Fraction({numerator:f[1], denominator:this.data.denominator.clone()});
		this.dataControl = new Fraction({numerator:control[1], denominator: this.dataControl.denominator.clone()});
		this.usedData.push([f[0], base]);
		return f[0];
	}
	return false;
};

FractionData.createRandomData = function(bits) {
	var numnumber = [];
	var dennumber = [1];
	bits >>>= 5;
	for (var i = 0; i < bits; i++) {
		numnumber.unshift(Math.floor(Math.random()*4294967296) | 0);
		dennumber.unshift(0);
	}
	return new FractionData(new Fraction(new BigInteger({number:numnumber, sign:1}),new BigInteger({number:dennumber, sign:1})));
};