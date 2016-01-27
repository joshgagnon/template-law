import letterTemplateSchema from '../../templates/Letter Template.json';
import letterOfEngagementSchema from '../../templates/Letter of Engagement (General).json'
import fileClosingSchema from '../../templates/File Closing Letter.json'
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