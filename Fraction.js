function Fraction(numerator, denominator, base, positive) {
    base = base || 10;
    denominator = denominator || new BigInteger(1);
    var point1 = 0;
    var point2 = 0;

    if (!(numerator instanceof BigInteger)) {
        if ((typeof numerator === 'object') && numerator.numerator && numerator.denominator) {
            this.numerator = new BigInteger(numerator.numerator);
            this.denominator = new BigInteger(numerator.denominator);
            this.normalized = !!denominator;
            this.normalize();
            return;
        }
        numerator = numerator.toString();  
        point1 = Math.max(Array.prototype.slice.call(numerator).reverse().indexOf("."), 0); 
        numerator = new BigInteger(numerator.replace(".", ""), base, positive); 
    }
    if (!(denominator instanceof BigInteger)){
        denominator = denominator.toString();
        point2 = Math.max(Array.prototype.slice.call(denominator).reverse().indexOf("."), 0);
        denominator = new BigInteger(denominator.replace(".", ""), base, true);
    }
    this.numerator = numerator;
    this.denominator = denominator;
    this.normalized = false;
    var diff = point1 - point2;
    for ( ; diff > 0; diff--) {
        this.denominator._multiply(base);
    }
    for ( ; diff < 0; diff++) {
        this.numerator._multiply(base);
    }
    this.normalize();
}
Fraction.prototype.normalize = function () {
    if (!this.normalized) {
        this.norm();
    }
}
Fraction.prototype.norm = function () {
    if (this.denominator.isNegative()) {
        this.denominator._negate();
        this.numerator._negate();
    }
    if (this.numerator.isZero()) {
        this.denominator = new BigInteger(1);
        this.normalized = true;
        return;
    }
    if (this.denominator.isZero()) {
        throw new Exception('Denominator cannot be zero');
    }
    var that = this;
    var sign = this.numerator.sign;

    
    return; // remove this line to enable normalization 

    if (!this.denominator.EQ(1) && !this.numerator.EQ(1)) {
        this.numerator.abs().asyncGCD(this.denominator, function (GCD) {
            if (!GCD.EQ(1)) {
                that.denominator._div(GCD);
                that.numerator._abs()._div(GCD).sign = sign;
            }
            that.normalized = true;
        });
    } else {
        this.normalized = true;
    }
};
Fraction.prototype.toString = function (base) {
    return this.numerator.toString(base)+"/"+this.denominator.toString(base);
};
Fraction.prototype.clone = function () {
    return new Fraction(this.numerator, this.denominator);
};
Fraction.prototype.negate = function () {
    var temp = {numerator:this.numerator.negate(),denominator:this.denominator.clone()};
    return new Fraction(temp, this.normalized);
};
Fraction.prototype.inverse = function () {
    return new Fraction({numerator: this.denominator, denominator: this.numerator}, this.normalized);
};
Fraction.prototype.abs = function () {
    return new Fraction({numerator: this.numerator.abs(), denominator: this.denominator.abs()}, this.normalized);
};
Fraction.prototype.isNegative = function () {
    return this.numerator.isNegative();
};
Fraction.prototype.isPositive = function () {
    return this.numerator.isPositive();
};
Fraction.prototype.isZero = function () {
    return this.numerator.isZero();
};
Fraction.prototype.floor = function  () {
    return this.numerator.div(this.denominator);
};
(function () {
    var obj = {};
    obj.add = function (other) {
        var temp = {};
        temp.numerator = this.numerator.multiply(other.denominator).add(other.numerator.multiply(this.denominator));
        temp.denominator = this.denominator.multiply(other.denominator);
        return new Fraction(temp);
    };
    obj.subtract = function (other) {
        return this.add(other.negate());
    };
    obj.multiply = function (other) {
        return new Fraction({numerator: this.numerator.multiply(other.numerator),
                denominator: this.denominator.multiply(other.denominator)});
    };
    obj.divide = function (other) {
        return this.multiply(other.inverse());
    };
    obj.GT = function (other) {
        return this.numerator.multiply(other.denominator).GT(other.numerator.multiply(this.denominator));
    };
    obj.LT = function (other) {
        return other.GT(this);
    };
    obj.GTE = function (other) {
        return !this.LT(other);
    };
    obj.LTE = function (other) {
        return !this.GT(other);
    };
    obj.EQ = function (other) {
        if (this.normalized && other.normalized) {
            return this.numerator.EQ(other.numerator) && this.denominator.EQ(other.denominator);
        } 
        return this.numerator.multiply(other.denominator).EQ(this.denominator.multiply(other.numerator));
    };
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            (function (key) {
                Fraction.prototype[key] = function (numerator, denominator, base, positive) {
                    if (!(numerator instanceof Fraction)) {
                        numerator = new Fraction(numerator, denominator, base, positive);
                    }
                    return obj[key].call(this, numerator);
                };
            })(key);
        }
    }
})();