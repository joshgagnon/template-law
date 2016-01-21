import Handlebars from 'handlebars';
import moment from 'moment';

Handlebars.registerHelper('todaysDate', () => {
    return moment().format("DD MMMM YYYY")
});

Handlebars.registerHelper('timeOfDay', () => {
    const split_afternoon = 12;
    const split_evening = 17;
    const currentHour = parseInt(moment().format("HH"));
    if(currentHour >= split_afternoon && currentHour <= split_evening) {
        return "afternoon";
    } else if(currentHour >= split_evening) {
        return "evening";
    } else {
        return "morning";
    }
});



Handlebars.registerHelper('matterTypeString', (type) => {
    return {
        'purchase': 'purchase',
        'sale': 'sale',
        'refinance': 'refinance'
    }[type] || 'UNKNOWN';
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

Handlebars.registerHelper('mapper', function(...keys){
    return keys.slice(0, keys.length-1).reduce((context, k) => {
        return context ? context[k] : null;
    }, this.mappings) || 'UNKNOWN';
});

Handlebars.registerHelper('joinAnd', (items=[], options) => {
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


Handlebars.registerHelper('ifCompany', function(options){
    if(options.data.root.recipient && options.data.root.recipient.recipientType === 'company'){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})
