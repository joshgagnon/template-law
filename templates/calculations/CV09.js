import moment from 'moment';
/** CV09.js */

export default function calculate(values){

    function annumFees(settlementDate, data){
        let days = 0, sumOfRates = 0;
        if(settlementDate && data){
            const annumRate = data.annumRate,
                startDateRaw = data.startOfYear;
            if(annumRate && startDateRaw){
                const settleDate = moment(settlementDate, "D MMMM YYYY");
                let startDate = moment(startDateRaw, "D MMMM YYYY");
                if(startDate.isBefore(settleDate)){
                    days = parseInt(moment.duration(settleDate.diff(startDate)).asDays(), 10);
                    const daysInYear = moment.duration(startDate.clone().add('1', 'year').diff(startDate)).asDays();
                    sumOfRates = (annumRate / daysInYear) * days;
                }
            }
        }

        return {days: days, amount: sumOfRates};
    }

    const ratesObj = (values.settlementStatement && values.settlementStatement.rates) || {};
    const leviesObj = (values.settlementStatement && values.settlementStatement.levies) || {};
    const rates = annumFees(values.settlementDate, ratesObj);
    const levies = annumFees(values.settlementDate, leviesObj);
    let debits = values.purchaseAmount || 0;
    let credits = values.depositAmount || 0;

    if(ratesObj.instalmentsPaid && !ratesObj.instalmentsPaid.paid){
        credits += rates.amount;
        debits += ratesObj.instalmentsPaid.totalAmountInstalments || 0;
    }
    else if(ratesObj.instalmentsPaid && ratesObj.instalmentsPaid.paid){
        debits += rates.amount || 0;
    }

    if(leviesObj.include){
        if(leviesObj.instalmentsPaid && !leviesObj.instalmentsPaid.paid){
            credits += levies.amount;
            debits += leviesObj.instalmentsPaid.totalAmountInstalments || 0;
        }
        else if(leviesObj.instalmentsPaid && leviesObj.instalmentsPaid.paid){
            debits += levies.amount || 0;
        }
    }




    return {settlementStatement: {
        rates: rates,
        levies: levies,
        totalDebits: debits,
        totalCredits: credits,
        totalAmount: debits - credits
    }};
}