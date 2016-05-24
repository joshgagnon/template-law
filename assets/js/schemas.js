import letterTemplateSchema from '../../templates/G01: Letter Template.json';
import letterOfEngagementSchema from '../../templates/G02: Letter of Engagement - General.json';
import fileClosingSchema from '../../templates/G03: File Closing Letter.json';
import letterOfEngagementConveyancingSchema from '../../templates/CV01: Letter of Engagement - Conveyancing.json';
import CV02Schema from '../../templates/CV02: Letter of Advice to Purchaser.json';
import CV02Calucate from '../../templates/calculations/CV02.js';
import CV03Schema from '../../templates/CV03: Settlement Undertakings Letter - Acting for Purchaser.json';
import CV04Schema from '../../templates/CV04: Settlement Undertakings Letter - Acting for Vendor.json';
import CV05Schema from '../../templates/CV05: Mortgage Discharge Request.json';
import CV06Schema from '../../templates/CV06: Vendors Settlement Letter.json';
import CV07Schema from '../../templates/CV07: Letter to Financier Enclosing Originals.json';
import CV08Schema from '../../templates/CV08: Fax Cover with Loan Docs.json';
import CV10Schema from '../../templates/CV10: Trust Account Statement.json';
import CV10Calcuate from '../../templates/calculations/CV10.js';
import DR01Calculate from '../../templates/calculations/DR01.js';
import DR02Calculate from '../../templates/calculations/DR02.js';
import LI01Calculate from '../../templates/calculations/LI01.js';
import DR01Schema from '../../templates/DR01: Letter of Demand - Debtor.json';
import DR02Schema from '../../templates/DR02: Letter of Demand - Guarantor.json';
import LI01Schema from '../../templates/LI01: Statutory Demand.json';
import CT01Schema from '../../templates/CT01: Filing Letter.json';
import CT02Schema from '../../templates/CT02: Service Letter.json';
import ConveyancingSuperset from '../../templates/Conveyancing Superset.json';
import Parties from '../../templates/parties.json';
import ConveyancingSupersetCalculate from '../../templates/calculations/Conveyancing Superset.js';
import merge from './deepmerge'
import ObjectUtils from 'react-json-editor/lib/objectUtils';


const FORMS = {
    'G01: Letter Template': {
        schema: letterTemplateSchema
    },
    'G02: Letter of Engagement': {
        schema: letterOfEngagementSchema
    },
    'G03: File Closing Letter': {
        schema: fileClosingSchema
    },
    'CV01: Letter of Engagement - Conveyancing': {
        schema: letterOfEngagementConveyancingSchema
    },
    'CV02: Letter of Advice to Purchaser': {
        schema: CV02Schema,
        calculate: CV02Calucate
    },
    'CV03: Settlement Undertakings Letter - Acting for Purchaser':{
        schema: CV03Schema
    },
    'CV04: Settlement Undertakings Letter - Acting for Vendor':{
        schema: CV04Schema
    },
    'CV05: Mortgage Discharge Request':{
        schema: CV05Schema
    },
    'CV06: Vendors Settlement Letter':{
        schema: CV06Schema
    },
    'CV07: Letter to Financier Enclosing Originals':{
        schema: CV07Schema
    },
    'CV08: Fax Cover with Loan Docs': {
        schema: CV08Schema
    },
    'CV10: Trust Account Statement':{
        schema: CV10Schema,
        calculate: CV10Calcuate
    },
    'DR01: Letter of Demand - Debtor':{
        schema: DR01Schema,
        calculate: DR01Calculate
    },
    'DR02: Letter of Demand - Guarantor':{
        schema: DR02Schema,
        calculate: DR02Calculate
    },
    'LI01: Statutory Demand':{
        schema: LI01Schema,
        calculate: LI01Calculate
    },
    'CT01: Filing Letter':{
        schema: CT01Schema
    },
    'CT02: Service Letter':{
        schema: CT01Schema
    },
    'Conveyancing Superset': {
        schema: ConveyancingSuperset,
        calculate: ConveyancingSupersetCalculate
    }
};

// apply extensions
Object.keys(FORMS).map(key => {
    if(FORMS[key].schema.extends){
        const extKeys = Array.isArray(FORMS[key].schema.extends) ? FORMS[key].schema.extends : [FORMS[key].schema.extends];
        extKeys.map(extKey => {
            FORMS[key].schema = merge(FORMS[extKey].schema, FORMS[key].schema, {
                replaceArray: true,
                sentinal: (x, path) => {
                    if(FORMS[key].schema.showIncluded && x && path[0] === 'properties' && path[path.length-1] !== 'properties' && path.length > 1){
                        x.includedIn = [...(x.includedIn || []), code]
                        x.includedIn.sort();
                    }
            }});
        })
    }
});
/*
function extract(root, path){
    const result = {};
    let acc = result;
    path.map(p => {
        acc[p] = ObjectUtils.without(merge({}, root[p]), 'oneOf', 'x-hints');
        if(root[p].properties) acc[p].properties = {};
        root = root[p].properties;
        acc = acc[p].properties;
    });
    return result[path[0]];
}



// split ordering
Object.keys(FORMS).map(key => {
    const ordering = (FORMS[key].schema['x-split-ordering'] || []).slice(0);
    ordering.reverse();
    ordering.map((entry, i) => {
        try{
            const path = entry.split('.');
            let name;
            if(path.length > 1){
                const aliasObject = extract(FORMS[key].schema.properties, path);
                name = '___alias_' + i;
                FORMS[key].schema.properties[name] = aliasObject;
            }
            else{
                name = path[0];
            }
            const index = FORMS[key].schema['x-ordering'].indexOf(name);
            if(index > -1){
                FORMS[key].schema['x-ordering'].splice(index, 1);
            }
            FORMS[key].schema['x-split-aliases'] = FORMS[key].schema['x-split-aliases'] || {};
            FORMS[key].schema['x-split-aliases'][name] = path[0];
            FORMS[key].schema['x-ordering'].unshift(name)
        }catch(e){}
       // TODO, ignore original
    });

});

*/

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


console.log(FORMS)


export default FORMS;
export const PARTIES = Parties ;