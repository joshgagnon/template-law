import { combineReducers } from 'redux';
import { UPDATE_VALUES, SET_FORM, RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE, HIDE_ERROR, OPEN_MODAL, CLOSE_MODAL, SET_ACTIVE_STATE, TOGGLE_COLUMNS } from './actions';
import validator from 'react-json-editor/lib/validate';
import FORMS from './schemas';
import merge from 'deepmerge'


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

function calculate(form, values = {}){
    if(FORMS[form] && FORMS[form].calculate){
        return FORMS[form].calculate(values)
    }
    return {};
}


function active(state = {form: 'Letter of Engagement', values: {}, errors: {}}, action) {
    let schema, calculated;

    switch(action.type){
        case SET_ACTIVE_STATE:
            calculated = calculate(action.data.form, action.data.output)
            schema = FORMS[action.data.form].schema;
            return {...action.data, values: merge(action.values, calculated),  output: merge(action.values, calculated), errors: validate(schema, action.data.output, schema)};
        case UPDATE_VALUES:
            calculated = calculate(state.form, action.data.output)
            schema = FORMS[state.form].schema;
            return {...state, values: merge(action.data.values, calculated), output: merge(action.data.output, calculated), errors: validate(schema, action.data.output, schema)};
        case SET_FORM:
            calculated = calculate(action.data.form, state.output)
            schema = FORMS[action.data.form].schema;
            const values = merge(state.values, calculate(action.data.form, state.values))
            return {...state, values: values, output: values, form: action.data.form, errors: validate(schema, state.output, schema)};
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

function view(state={}, action){
    switch(action.type){
        case TOGGLE_COLUMNS:
            return {...state, columns: action.state}
    }
    return state;
}


const rootReducer = combineReducers({
    active,
    status,
    modals,
    view
});


export default rootReducer;