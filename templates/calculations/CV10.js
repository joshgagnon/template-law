/** CV10.js */

export default function calculate(values){
    let credits = 0, debits = 0;
    if(values.matter){
        if(values.matter.matterType === 'purchase'){
            credits += values.matter.loanAdvance.credit || 0;
            credits += (values.matters.clients || []).reduce((acc, client) => {
                return acc + (client.kiwiSaverWithdrawal.credit || 0) + (kiwiSaverHomeStart.credit || 0)
            }, 0);
            debits += values.balancePurchasePrice.debits || 0;
        }
        else if(values.matter.matterType === 'sale'){
            if(values.matter.balancePurchasePrice) credits += values.matter.balancePurchasePrice.credit || 0;
            if(values.matter.deposit) credits += values.matter.deposit.credit || 0;
            if(values.repaymentOfIndebtedness) debits += values.matter.repaymentOfIndebtedness.debit || 0;
        }
        else{
            credits += values.matter.loanAdvance.credit || 0;
            if(values.matter.repaymentOfIndebtedness) debits += values.matter.repaymentOfIndebtedness.debit || 0;
        }
        if(values.paidByTrust && values.paidByTrust.paidByTrust == "Yes"){
            debits += values.paidByTrust.debit;
        }
        debits += (values.debits || []).reduce((acc, debit) => {
            return acc + (debit.debit || 0);
        }, 0);
        credits += (values.credits || []).reduce((acc, credit) => {
            return acc + (credit.credit || 0);
        }, 0);
    }
    return {...values, totalDebits: debits, totalCredits: credits};
}