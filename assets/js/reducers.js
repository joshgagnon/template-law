import { combineReducers } from 'redux';
import { UPDATE_VALUES, SET_FORM, RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE, HIDE_ERROR, OPEN_MODAL, CLOSE_MODAL, SET_ACTIVE_STATE } from './actions';
import validator from 'react-json-editor/lib/validate';
import FORMS from './schemas';

function hashedErrors(errors) {
  var result = {};
  var i, entry;
  for (i = 0; i < errors.length; ++i) {
    entry = errors[i];
    result[makeKey(entry.path)] = entry.errors;
  }
  return result;
}

function makeKey(path) {
  return path.join('_');
}

function validate(schema, values, ctx){
    return hashedErrors(validator(schema, values, ctx)) || {};
}

function calculate(form, values){
    if(FORMS[form].calculate){
        return {...values, ...FORM[form].calculate(values)}
    }
    return values;
}


function active(state = {form: 'Letter of Engagement', values: {}, errors: {}}, action) {
    let schema;
    switch(action.type){
        case SET_ACTIVE_STATE:
            schema = FORMS[action.data.form].schema;
            return {...action.data, values: calculate(action.data.form, action.values), errors: validate(schema, action.data, schema)};
        case UPDATE_VALUES:
            schema = FORMS[state.form].schema;
            return {...state, values: calculate(state.form, action.data), errors: validate(schema, action.data, schema)};
        case SET_FORM:
            schema = FORMS[action.data.form].schema;
            return {...state, values: calculate(action.data.form, state.values), form: action.data.form, errors: validate(schema, state.values, schema)};
    }
    return state;
}

function status(state = {}, action) {
    switch(action.type){
        case RENDER_REQUEST:
            return {...state, fetching: true};
        case RENDER_SUCCESS:
            return {...state, fetching: false};
        case RENDER_FAILURE:
            return {...state, error: true, fetching: false};
        case HIDE_ERROR:
            return {...state, error: false};
    }
    return state;
}

function modals(state = {}, action) {
    switch(action.type){
        case OPEN_MODAL:
            return {...state, [action.modal]: true};
        case CLOSE_MODAL:
            return {...state, [action.modal]: false};
    }
    return state;
}

const rootReducer = combineReducers({
    active,
    status,
    modals
});


export default rootReducer;