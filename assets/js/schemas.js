import letterTemplateSchema from '../../templates/G01: Letter Template.json';
import letterOfEngagementSchema from '../../templates/G02: Letter of Engagement - General.json';
import fileClosingSchema from '../../templates/G03: File Closing Letter.json';
import letterOfEngagementConveyancingSchema from '../../templates/CV01: Letter of Engagement - Conveyancing.json';
import settleUnderTakingsSchema from '../../templates/CV03: Settlement Undertakings Letter - Acting for Purchaser.json';
import merge from 'deepmerge'


const FORMS = {
    'G01: Letter': {
        schema: letterTemplateSchema
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
    'CV03: Settlement Undertakings Letter - Acting for Purchaser':{
        schema: merge(letterTemplateSchema, settleUnderTakingsSchema)
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

export default FORMS;