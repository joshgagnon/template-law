import Handlebars from 'handlebars';
import moment from 'moment';

Handlebars.registerHelper('todaysDate', () => {
    return moment().format("Do MMMM YYYY")
});


Handlebars.registerHelper('estimatePrice', (type) => {
    return {
        'purchase': '$880',
        'sale': '$780',
        'refinance': '$680'
    }[type]
});


Handlebars.registerHelper('matterTypeString', (type) => {
    return {
        'purchase': 'purchase',
        'sale': 'sale',
        'refinance': 'refinance'
    }[type];
});

Handlebars.registerHelper('capitalize', (string='') => {
    return string.replace(/[a-z]/, c => c.toUpperCase());
});

Handlebars.registerHelper('multiple', (items=[], options) => {
    if(!items.length){
        return "UNKNOWN"
    }
    else if(items.length !== 1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('joinList', (items=[], options) => {
    if(!items.length){
        return "UNKNOWN"
    }
    else if(items.length === 1){
        return (items[0] || {})[options.hash.prop]
    }
    else{
        items = items.map(i => (i||{})[options.hash.prop]);
        return `${items.slice(0, items.length-1).join(', ')} and ${items[items.length-1]}`
    }
});

Handlebars.registerHelper('secondPersonPronoun', (items, options) => {
    if(options.data.root.isCompany){
        return options.data.root.companyNameShort;
    }
    else{
        return 'you';
    }
});

Handlebars.registerHelper('secondPersonAdjective', (items, options) => {
    if(options.data.root.isCompany){
        return `${options.data.root.companyNameShort}'s`;
    }
    else{
        return 'your';
    }
});