function calcMaxDivisor(a: number, b: number, d2 = 1): number {
    if ((1 & a) | (1 & b)) {
        // a, b is all not double
        if (a === b) {
            return a * d2;
        } else if (a > b) {
            return calcMaxDivisor(b, a - b, d2)
        } else {
            return calcMaxDivisor(a, b - a, d2)
        }
    } else {
        return calcMaxDivisor(a / 2, b / 2, d2 * 2)
    }
}

class Fraction {
    numerator: number = 0;
    denominator: number = 0;

    constructor(numerator: number, denominator: number) {
        this.numerator = numerator;
        this.denominator = denominator;
    }

    normal(): Fraction {
        // 求最小公约数
        const maxD = calcMaxDivisor(this.numerator, this.denominator);
        return new Fraction(this.numerator / maxD, this.denominator / maxD)
    }

    toString(): string {
        return `${this.numerator}/${this.denominator}`
    }

    mul(other: Fraction): Fraction {
        return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator)
    }
}

class Float8 {
    flag: number = 0;
    exp: [number, number, number, number,] = [0, 0, 0, 0];
    frac: [number, number, number] = [0, 0, 0]

    constructor(flag: number, exp: [number, number, number, number], frac: [number, number, number]) {
        this.flag = flag;
        this.exp = exp;
        this.frac = frac;
    }

    /**
     * exp is integer
     * @return {number}
     */
    get expDecimal(): number {
        let total = 0;
        for (let i = 0; i < this.exp.length; i++) {
            total += this.exp[i as 0 | 1 | 2 | 3] * (2 ** (this.exp.length - i))
        }
        return total;
    }

    /**
     * frac is fractional part
     * @return {number}
     */
    get fracDecimal(): number {
        let total = 0;
        for (let i = 0; i < this.frac.length; i++) {
            total += this.frac[i as 0 | 1 | 2] * (2 ** (-1 - i))
        }
        return total;
    }

    toNumber(): number {
        let M = this.fracDecimal;
        let E = this.expDecimal - ((2 ** 3) - 1);
        if (this.exp.every(e => e === 0)) {
            // no normalized numbers
            if (this.frac.every(f => f === 0)) {
                return 0
            }
            E = 1 - ((2 ** 3) - 1);
        } else {
            M += 1;
        }
        if (this.exp.every(e => e === 1)) {
            return NaN
        }
        return ((-1) ** this.flag) * M * (2 ** E);
    }

    toFraction(): string {
        let str = '';
        if (this.flag === 1) {
            str += '-'
        }

        let E = new Fraction(0, 0);
        const fMaxFractionD = 2 ** this.frac.length;
        let F = new Fraction(0, fMaxFractionD);
        for (let i = 0; i < this.frac.length; i++) {
            F = new Fraction(F.numerator + this.frac[i as 0 | 1 | 2] * fMaxFractionD / (2 << i), F.denominator)
        }

        if (this.exp.every(e => e === 0)) {
            // no normalized numbers
            if (this.frac.every(f => f === 0)) {
                str += '0'
                return str
            }
            E = new Fraction(1, 2 ** (((2 ** 3) - 1) - 1))
        } else {
            if (this.exp.every(e => e === 1)) {
                str = 'NaN'
                return str
            }
            const e = this.expDecimal - ((2 ** 3) - 1);
            if (e < 0) {
                E = new Fraction(1, 2 ** -e)
            } else {
                E = new Fraction(2 ** e, 1)
            }
            F = new Fraction(F.numerator + fMaxFractionD, F.denominator)
        }
        if(F.denominator === 8 && E.numerator >= E.denominator) {
            debugger
        }
        str += E.mul(F).toString()

        return str;
    }

    /**
     * @param {boolean} sign
     * @param {number} exp - decimal
     * @param {number} frac - decimal
     */
    static of(sign: boolean, exp: number, frac: number) {
        return new Float8(sign ? 1 : 0, [
                0b1000 & exp ? 1 : 0,
                0b0100 & exp ? 1 : 0,
                0b0010 & exp ? 1 : 0,
                0b0001 & exp ? 1 : 0,
            ],
            [
                frac & 0b100 ? 1 : 0,
                frac & 0b010 ? 1 : 0,
                frac & 0b001 ? 1 : 0,
            ])
    }
}

const nums: Float8[] = []

for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2 ** 4; j++) {
        for (let k = 0; k < 2 ** 3; k++) {
            nums.push(Float8.of(Boolean(i), j, k))
        }
    }
}

function delay(ms = 500) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms)
    })
}

let promiseLink = Promise.resolve();
nums.forEach(f => {
    promiseLink = promiseLink.then(() => delay())
        .then(() => console.log(f.toFraction()))
})
