/** CV02.js */

export default function calculate(values){
    const keys = ['finance', 'lim', 'buildersReport', 'dueDiligence'];
    const strings = {'finance': 'finance', 'lim': 'LIM report', 'buildersReport': "builder's report", 'dueDiligence': "due diligence" }
    const list = keys.reduce((acc, k) => {
        const include = (values.conditions && values.conditions[k] && values.conditions[k].include ? 1 : 0);
        if(include){
            acc.push(strings[k])
        }
        return acc;
    }, [])
    return {conditionCount: list.length, conditionList: list};
}