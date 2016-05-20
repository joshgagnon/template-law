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


export default function calculate(values){
    var results = {matter: {}};
    results.purchaserNames = [];
    (values.clientsWithRoles || []).map(client => {
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

    })


    return results;
}