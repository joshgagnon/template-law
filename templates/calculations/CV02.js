/** CV02.js */

export default function calculate(values){
    const keys = ['finance', 'lim', 'buildersReport', 'dueDiligence'];
    const count = keys.reduce((acc, k) => {
        return acc + (values.conditions && values.conditions[k] && values.conditions[k].include ? 1 : 0)
    }, 0)
    return {conditionCount: count};
}