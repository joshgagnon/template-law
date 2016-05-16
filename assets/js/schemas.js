import letterTemplateSchema from '../../templates/G01: Letter Template.json';
import letterOfEngagementSchema from '../../templates/G02: Letter of Engagement - General.json';
import fileClosingSchema from '../../templates/G03: File Closing Letter.json';
import letterOfEngagementConveyancingSchema from '../../templates/CV01: Letter of Engagement - Conveyancing.json';
import letterOfAdvice from '../../templates/CV02: Letter of Advice to Purchaser.json';
import CV02Calucate from '../../templates/calculations/CV02.js';
import settleUnderTakingsSchema from '../../templates/CV03: Settlement Undertakings Letter - Acting for Purchaser.json';
import settleUnderTakingsVendorSchema from '../../templates/CV04: Settlement Undertakings Letter - Acting for Vendor.json';
import mortgageDischargeSchema from '../../templates/CV05: Mortgage Discharge Request.json';
import vendorsSettlementSchema from '../../templates/CV06: Vendors Settlement Letter.json';
import letterToFinancierSchema from '../../templates/CV07: Letter to Financier Enclosing Originals.json';
import trustAccountStatementSchema from '../../templates/CV10: Trust Account Statement.json';
import CV10Calcuate from '../../templates/calculations/CV10.js';
import DR01Calculate from '../../templates/calculations/DR01.js';
import DR02Calculate from '../../templates/calculations/DR02.js';
import LI01Calculate from '../../templates/calculations/LI01.js';
import DR01Schema from '../../templates/DR01: Letter of Demand - Debtor.json';
import DR02Schema from '../../templates/DR02: Letter of Demand - Guarantor.json';
import LI01Schema from '../../templates/LI01: Statutory Demand.json';
import CT01Schema from '../../templates/CT01: Filing Letter.json';
import CT02Schema from '../../templates/CT02: Service Letter.json';
import merge from './deepmerge'


const FORMS = {
    'G01: Letter': {
        schema: letterTemplateSchema,
    },
    'G02: Letter of Engagement': {
        schema: merge(letterTemplateSchema, letterOfEngagementSchema)
    },
    'G03: File Closing Letter': {
        schema: merge(letterTemplateSchema, fileClosingSchema)
    },
    'CV01: Letter of Engagement - Conveyancing': {
        schema: merge(letterTemplateSchema, letterOfEngagementConveyancingSchema)
    },
    'CV02: Letter of Advice to Purchaser': {
        schema: merge(letterTemplateSchema, letterOfAdvice),
        calculate: CV02Calucate
    },
    'CV03: Settlement Undertakings Letter - Acting for Purchaser':{
        schema: merge(letterTemplateSchema, settleUnderTakingsSchema)
    },
    'CV04: Settlement Undertakings Letter - Acting for Vendor':{
        schema: merge(letterTemplateSchema, settleUnderTakingsVendorSchema)
    },
    'CV05: Mortgage Discharge Request':{
        schema: merge(letterTemplateSchema, mortgageDischargeSchema)
    },
    'CV06: Vendors Settlement Letter':{
        schema: merge(letterTemplateSchema, vendorsSettlementSchema)
    },
    'CV07: Letter to Financier Enclosing Originals':{
        schema: merge(letterTemplateSchema, letterToFinancierSchema)
    },
    'CV10: Trust Account Statement':{
        schema: merge(letterTemplateSchema, trustAccountStatementSchema),
        calculate: CV10Calcuate
    },
    'DR01: Letter of Demand - Debtor':{
        schema: merge(letterTemplateSchema, DR01Schema),
        calculate: DR01Calculate
    },
    'DR02: Letter of Demand - Guarantor':{
        schema: merge(letterTemplateSchema, DR02Schema),
        calculate: DR02Calculate
    },
    'LI01: Statutory Demand':{
        schema: merge(letterTemplateSchema, LI01Schema),
        calculate: LI01Calculate
    },
    'CT01: Filing Letter':{
        schema: merge(letterTemplateSchema, CT01Schema)
    },
    'CT02: Service Letter':{
        schema: merge(letterTemplateSchema, CT02Schema)
    }
};



// REMOVE ignored fields, for validation
(function removeIgnored(obj){
    Object.keys(obj).map(k => {
        if(typeof obj[k] === 'object'){
            if(obj[k].ignore){
                delete obj[k];
            }
            else{
                removeIgnored(obj[k]);
            }
        }
    });
})(FORMS);


// create super form


FORMS['Super Set'] = Object.keys(FORMS).reduce((acc, key) => {
    const code = key.split(':')[0];
    acc.schema = merge(acc.schema, FORMS[key].schema, (x, path) => {
        if(x && path[0] === 'properties'){
            x.includedIn = [...(x.includedIn || []), code]
            x.includedIn.sort();
            if(x.includedIn.length === Object.keys(FORMS).length -1){
             //   x.includedIn = ['All forms']
            }
        }
    });
    let calc = acc.calculate;
    acc.calculate = (values) => merge(calc(values), FORMS[key].calculate ? FORMS[key].calculate(values) : {});
    return acc;
}, {schema: {}, calculate: x => ({})})

// hack
delete FORMS['Super Set'].schema.properties.includedIn;

console.log(FORMS)

export default FORMS;