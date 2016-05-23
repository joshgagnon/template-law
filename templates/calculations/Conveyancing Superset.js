/** Conveyancing Superset.js */


function getFirstName(recipient){
    if(recipient.recipientType === 'individuals' && recipient.individuals.length){
        const individual = recipient.individuals[0];
        return individual.firstName + ' ' + individual.lastName;
    }
    if(recipient.recipientType === 'company'){
        return recipient.companyName;
    }
}

function splitAliases(values, schema){
    var aliases = (schema['x-split-aliases'] || {})
    return Object.keys(aliases).reduce((acc, x) => {
        acc[aliases[x]] = values[x];
        return acc;
    }, {})
}

function getIn(obj, path){
    for(let i=0;i<path.length && obj;i++){
        obj = obj[path[i]];
    }
    return obj;
}

function setIn(obj, src, path){
    for(let i=0;i<path.length -1 && obj;i++){
        if(!obj[path[i]]){
            obj[path[i]] = Number.isInteger(path[i]) ? [] : {}
        }
        obj = obj[path[i]];
    }
    obj[path[path.length-1]] = src;
}


export default function calculate(values, schema, merge){
    let results = {matter: {}};

    results.matter = {conveyancing: {}, };

    results.purchaserNames = [];
    (values.clientsWithRoles || []).map(client => {
        const roles = client.roles || {};


        if(client){
            results.recipient = client;
             values.client = client;
        }
        if(client.isNewClient){
            values.isNewClient = client.isNewClient;
        }


        if(roles.purchaser){
            results.matter.conveyancing = {matterType: 'purchase' }
            if(client.recipientType === 'individuals'){
                (client.individuals || []).map(individual => {
                    results.purchaserNames.push(individual.firstName + ' ' + individual.lastName)
                });
            }
            if(client.recipientType === 'company'){
                results.purchaserNames.push(client.companyName);
            }
        }

         if(roles.vendor){
            results.matter.conveyancing = {matterType: 'sale' }
            results.vendorNames = [];
            if(client.recipientType === 'individuals'){
                (client.individuals || []).map(individual => {
                    results.vendorNames.push(individual.firstName + ' ' + individual.lastName)
                });
            }
            if(client.recipientType === 'company'){
                results.vendorNames.push(client.companyName);
            }
        }

        if(roles.mortgagor){
            results.matter.conveyancing = {matterType: 'refinance' };
        }
        if(roles.borrower){
            results.matter.conveyancing = {matterType: 'refinance' };
        }
        if(roles.guarantor){
            results.guarantor = client;
        }

    });

    (values.otherPartiesWithRoles || []).map(client => {
        const roles = client.roles || {};
        if(roles.purchaser){
            if(client.recipientType === 'individuals'){
                (client.individuals || []).map(individual => {
                    results.purchaserNames.push(individual.firstName + ' ' + individual.lastName)
                });
            }
            if(client.recipientType === 'company'){
                results.purchaserNames.push(client.companyName);
            }
        }

        if(roles.vendor){
            results.vendorNames = [];
            if(client.recipientType === 'individuals'){
                (client.individuals || []).map(individual => {
                    results.vendorNames.push(individual.firstName + ' ' + individual.lastName)
                });
            }
            if(client.recipientType === 'company'){
                results.vendorNames.push(client.companyName);
            }
        }

        if(roles.lender){
            results.conditions = {finance: {particulars: getFirstName(client)}}
        }

        if(roles.existingMortgagee){
            results.existingMortgagee = client;
        }

        if(roles.newMortgagee){
            results.newMortgagee = client;
        }

        if(roles.realEstateAgent){
            results.payableToRecipient = getFirstName(client);
        }

        if(roles.solicitor){
            results.counterPartySolicitor = client;
        }

    });

    if(values.settlementDate && !((values.matter||{}).loanAdvance||{}).date){
        results.matter = results.matter || {};
        results.matter.loanAdvance = {date: values.settlementDate};
    }
    //schema translates

    const translates = schema['x-translate'] || {};
    Object.keys(translates).map(source => {
        setIn(results, getIn(values, source.split('.')), translates[source].split('.'));
    })
    return results;
}