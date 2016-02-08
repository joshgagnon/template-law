/** DR01.js */

export default function calculate(values){
    let amount = 0;
    const breakdown = values.breakdown || {};
    if(breakdown.show === 'Yes'){
        amount += (breakdown.principalSum || {}).amount || 0;
        amount += (breakdown.interestAccrued || {}).amount || 0;
        amount += (breakdown.costsToCreditor || {}).amount || 0;
        amount += (breakdown.userDefined || []).reduce((acc, d) => {
            return acc + ((d || {}).amount || 0);
        }, 0);
    }
    return {breakdown: {calculatedAmount: amount}};
}