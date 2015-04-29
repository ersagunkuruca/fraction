
function BigInteger(number, base, positive) {
    if (typeof number === 'number') {
        this.number = [Math.round(Math.abs(number))];
        this.sign = Math.sign(number);
        return;
    } else if (typeof number === 'object') {
        this.number = [];
        for (var i = 0; i < number.number.length; i++) {
            this.number[i] = number.number[i];
        }
        this.sign = number.sign;
        return;
    }
    base = base || 10;
    number = number || 0;
    number = number.toString();
    var isPositive = (base === 64) ? (typeof positive == "undefined" ? true : positive) : !/^\-/.test(number);
    if (base !== 64) {
        number = number.replace(/^\s*(\-||\+)/, "");
    }
    this.sign = isPositive ? 1 : -1;
    this.number = [0];
    for (var i = 0; i < number.length; i++) {
        for (var j = 0; j < this.number.length; j++) {
            this.number[j] = BigInteger.uns(this.number[j]);
            this.number[j] *= base;
        }
        this.number[0] += BigInteger.digitValue(number.charAt(i), (base == 64));
        BigInteger.normalize(this.number);
    }
    if(this.number.length === 1 && this.number[0] === 0) {
        this.sign = 0;
    }
}

BigInteger.prototype._negate = function () {
    this.sign *= -1;
    return this;
};
BigInteger.prototype.negate = function () {
    return this.clone()._negate();
};
BigInteger.prototype.clone = function () {
    var temp = new BigInteger(0);
    for (var i = 0; i < this.number.length; i++) {
        temp.number[i] = this.number[i];
    }
    temp.sign = this.sign;
    return temp;
};
BigInteger.prototype.toString = function (base) {
    base = base || 10;
    var lookUp = ((base === 64) ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" : "0123456789abcdefghijklmnopqrstuvwxyz");
    var resultString = "";
    var result = this.abs();
    while (true) {
        var a = result._divide(base);
        resultString = lookUp.charAt(a.number[0]) + resultString;
        if (result.isZero()) {
            break;
        }
    }
    resultString = this.isNegative() ? "-" + resultString : resultString;
    return resultString;
};
//BigInteger.prototype.valueOf = BigInteger.prototype.toString;
BigInteger.normalize = function (number) {
    var carry = 0;
    for (var j = 0; j < number.length || carry !== 0; j++) {
        var temp = (j < number.length ? number[j] : 0);
        temp = BigInteger.uns(temp) + carry;
        carry = Math.floor(temp / 4294967296);
        number[j] = temp | 0;
    }
    for (var i = number.length - 1; i >= 0; i--) {
        if (number[i] === 0) {
            number.pop();
        } else {
            break;
        }
    };
    if (!number.length) {
        number.push(0);
    }
};
BigInteger.digitValue = function (a, base64) {
    if (!base64) {
        return "0123456789abcdefghijklmnopqrstuvwxyz".indexOf(a.toLowerCase());
    } else {
        if (a === "+") {
            return 63;
        } else if (a === "/") {
            return 62;
        } else {
            return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(a);
        }
        return 0;
    }
};
BigInteger.prototype.normalize = function () {
    BigInteger.normalize(this.number);
    if (this.number.length === 1 && this.number[0] === 0) {
        this.sign = 0;
    }
};
BigInteger.prototype.isZero = function () {
    return this.sign === 0;
};
BigInteger.prototype.isPositive = function () {
    return this.sign === 1;
};
BigInteger.prototype.isNegative = function () {
    return this.sign === -1;
};
BigInteger.prototype._abs = function() {
    if (this.isNegative()) {
        return this._negate();
    }
    return this;
};
BigInteger.prototype.abs = function () {
    return this.clone()._abs();
};
BigInteger.uns = function (n) {
    return n < 0 ? n + 4294967296 : n;
};
BigInteger.prototype._shiftRight = function (other) {
    other = (other === undefined) ? 1 : other;
    if (other < 0) {
        return this._shiftLeft(-other);
    }
    if (!other) {
        return this;
    }
    var bigShift = other >>> 5; // floor(other / 32)
    for (var i = 0; i < bigShift; i++) {
        this.number.shift();
    }
    other &= 31; // %= 32
    if (other) {
        var carry = 0;
        for (var j = this.number.length - 1; j >= 0; j--) {
            var temp = BigInteger.uns(this.number[j]);
            temp >>>= other;
            temp += carry << (32 - other);
            carry = this.number[j] & ((1 << other)-1);
            this.number[j] = temp;
        }
    }
    this.normalize();
    return this;
};
BigInteger.prototype._shiftLeft = function (other) {
    other = (other === undefined) ? 1 : other;
    if (other < 0) {
        return this._shiftRight(-other);
    }
    if (!other) {
        return this;
    }
    var bigShift = other >>> 5; // floor(other / 32)
    other &= 31; // %= 32
    if (other) {
        for (var j = 0; j < this.number.length; j++) {
            this.number[j] = BigInteger.uns(this.number[j]);
            this.number[j] = this.number[j] * (1 << other);
        }
        this.normalize();
    }
    for (var i = 0; i < bigShift; i++) {
        this.number.unshift(0);
    }
    return this;
};
BigInteger.prototype._addOne = function () {
    this.sign = this.isZero() ? 1 : this.sign;
    this.number[0]++;
    if (!this.number[0]) {
        this.number[0] = 4294967296;
    }
    this.normalize();
    return this;
};
(function () {
    var obj = {};
    obj._add = function (other) {
        if (this.isZero()) {
            var that = other.clone();
            this.number = that.number;
            this.sign = other.sign;
            return this;
        }
        if (other.isZero()) {
            return this;
        }
        if (this.sign !== other.sign) {
            if (other.absGT(this)) {
                var tmp = this.clone();
                var that = other.clone();
                this.sign = that.sign;
                this.number = that.number;
                return this._add(tmp);
            }
        }
        var a = this.number;
        var b = other.number;

        var carry = 0;
        for (var i = 0; i < a.length || i < b.length || carry !== 0; i++) {
            var temp1 = (a.length > i ? a[i] : 0);
            var temp2 = (b.length > i ? b[i] : 0);
            temp1 = BigInteger.uns(temp1);
            temp2 = BigInteger.uns(temp2);
            a[i] = temp1 + temp2 * this.sign * other.sign + carry;
            carry = Math.floor((a[i]) / 4294967296);
            a[i] = a[i] | 0;
        }
        this.normalize();
        return this;
    };
    obj.add = function (other) {
        return this.clone()._add(other);
    };
    obj._subtract = function (other) {
        this._add(other._negate());
        other._negate();
        return this;
    };
    obj.subtract = function (other) {
        return this.clone().add(other.negate());
    };
    obj._multiply = function (other) {
        /*if (other.absGT(this)) {
            return other.multiply(this);
        }*/

        
        if (this.isZero() || other.isZero()) {
            this.number = [0];
            this.sign = 0;
            return this;
        }
        var that = this.clone();
        this.sign = 0;
        this.number = [0];
        for (var i = other.number.length - 1; i >= 0; i--) {
            var temp = other.number[i];
            for (var j = 0; j < 32; j++) {
                this._shiftLeft(1);
                if (temp & -2147483648) {
                    this._add(that);
                }
                temp = (temp << 1) | 0;
            }
        };
        this.sign = this.sign * other.sign;
        return this;
    };
    obj.multiply = function (other) {
        return this.clone()._multiply(other);
    };

    obj._divide = function (other) {
        if (other.isZero()) {
            return;
        }
        if (this.LT(other)) {
            var temp = this.clone();
            this.number = [0];
            this.sign = 0;
            return temp;
        }
        var remainder = this.clone();
        var shiftAmount = ((this.number.length - other.number.length + 1)*32);
        this.number = [0];
        this.sign = 0;
        
        other._shiftLeft(shiftAmount);
        for (var i = 0; i < shiftAmount; i++) {
            other._shiftRight(1);
            this._shiftLeft(1);
            if (remainder.GTE(other)) {
                this._add(1);
                remainder._subtract(other);
            }
        }
        return remainder;
    };
    obj.divide = function (other) {
        var temp = this.clone();
        var mod = temp._divide(other);
        return [temp, mod];
    };
    obj._mod = function (other) {
        var temp = this._divide(other);
        this.sign = temp.sign;
        this.number = temp.number;
        return this;
    };
    obj.mod = function (other) {
        return this.clone()._mod(other);
    };
    obj._div = function (other) {
        this._divide(other);
        return this;
    };
    obj.div = function (other) {
        return this.clone()._div(other);
    };
    obj.EQ = function (other) {
        if (this.sign !== other.sign || this.number.length !== other.number.length) {
            return false;
        }
        for (var i = 0; i < this.number.length; i++) {
            if (this.number[i] !== other.number[i]) {
                return false;
            }
        }
        return true;
    };
    obj.absGT = function (other) {
        if (this.number.length > other.number.length){
            return true;
        } else if (this.number.length < other.number.length) {
            return false;
        } else {
            for (var i = this.number.length - 1; i >= 0; i--) {
                var temp1 = BigInteger.uns(this.number[i]);
                var temp2 = BigInteger.uns(other.number[i]);
                if (temp1 > temp2) {
                    return true;
                } else if (temp1 < temp2) {
                    return false;
                }
            };
            return false;
        }
    };
    obj.GT = function (other) {
        if (this.sign > other.sign) {
            return true;
        } else if (this.sign < other.sign) {
            return false;
        } else {
            return this.absGT(other) === this.isPositive();
        }
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
    obj._GCD = function (other) {
        while (true) {
            if (this.LT(other)) {
                var tmpn = this.number;
                var tmps = this.sign;
                this.number = other.number;
                other.number = tmpn;
                this.sign = other.sign;
                other.sign = tmps;
            }
            if (other.isZero()) {
                return this;
            }
            if (this.number[0] % 2 === 0) {
                this._shiftRight(1);
                if (other.number[0] % 2 === 0) {
                    other._shiftRight(1);
                    return this._GCD(other)._shiftLeft(1);
                }
            } else if (other.number[0] % 2 === 0) {
                other._shiftRight(1);
            } else {
                this._mod(other);
            }
        }
    };
    /*obj._GCD = function (other) {
        while(true){
            if (this.LT(other)) {
                var temp = this.number;
                this.number = other.number;
                other.number = temp;
            }
            if (other.isZero()) {
                return this;
            }
            var temp = this.number;
            this.number = other.number;
            other.number = temp;
            other._mod(this);
        }
    };*/
    obj.GCD = function (other) {
        if (this.isNegative() || other.isNegative()) {
            return this.abs().GCD(other.abs());
        }
        if (this.LT(other)) {
            return other.GCD(this);
        }
        if (other.isZero()) {
            return this.clone();
        }
        return other.GCD(this.mod(other));
    };
    obj.GCD = function (other) {
        return this.abs()._GCD(other.abs());
    };

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            (function (key) {
                BigInteger.prototype[key] = function (number, base, positive) {
                    if (!(number instanceof BigInteger)) {
                        number = new BigInteger(number, base, positive);
                    }
                    return obj[key].call(this, number);
                };
            })(key);
        }
    }
})();
BigInteger.prototype.asyncGCD = function (other, callback) {
    var GCDWorker = new Worker("WebWorker.js");
    var c = callback;
    console.log(c);
    GCDWorker.onmessage = function (e) {
        var i = new BigInteger(0);
        i.number = e.data.number;
        i.sign = e.data.sign;
        c(i);
    };
    GCDWorker.postMessage(["BigInteger", "GCD", [this, other]]);
};

