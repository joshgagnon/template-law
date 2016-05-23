import { combineReducers } from 'redux';
import { UPDATE_VALUES, MERGE_VALUES, SET_FORM, RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE,
    PREVIEW_REQUEST, PREVIEW_SUCCESS, PREVIEW_FAILURE,
    HIDE_ERROR, OPEN_MODAL, CLOSE_MODAL, SET_ACTIVE_STATE, SET_PAGE_VIEW, SET_FORM_VIEW, SET_PREVIEW,
    LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE,
    SAVE_REQUEST, SAVE_SUCCESS, SAVE_FAILURE,
    SELECT_TEMPLATE
    } from './actions';
import validator from 'react-json-editor/lib/validate';
import FORMS from './schemas';
import merge from 'deepmerge'
import { routerReducer } from 'react-router-redux'

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
        return FORMS[form].calculate(values, FORMS[form].schema, merge)
    }
    return {};
}


function active(state = {form: 'Letter of Engagement', values: {}, errors: {}}, action) {
    let schema, calculated, values, output;
    switch(action.type){
        case SET_ACTIVE_STATE:
            calculated = calculate(action.data.form, action.data.output)
            schema = FORMS[action.data.form].schema;
            return {...action.data, values: merge(action.data.values|| {}, calculated),  output: merge(action.data.output|| {}, calculated), errors: validate(schema, action.data.output, schema)};
        case UPDATE_VALUES:
            calculated = calculate(state.form, action.data.output)
            schema = FORMS[state.form].schema;
            return {...state, values: merge(action.data.values|| {}, calculated), output: merge(action.data.output|| {}, calculated), errors: validate(schema, action.data.output, schema)};
        case SET_FORM:
            calculated = calculate(action.data.form, state.output)
            schema = FORMS[action.data.form].schema;
            values = merge(state.values|| {}, calculate(action.data.output, state.output))
            return {...state, values: values, output: merge(state.output || {}, calculated), form: action.data.form, errors: validate(schema, state.output, schema)};
        case MERGE_VALUES:
            values = merge(state.values, action.data.values);
            output = merge(state.output, action.data.output);
            calculated = calculate(state.form, state.output);
            schema = FORMS[state.form].schema;
            return {...state, values: merge(values, calculated), output: merge(output, calculated),  errors: validate(schema, output, schema)};

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

function savedStates(state = {}, action) {
    switch(action.type){
        case SAVE_REQUEST:
        case LOAD_REQUEST:
            return {...state, fetching: true};
        case SAVE_SUCCESS:
            return {...state, fetching: false};
        case LOAD_SUCCESS:
            return {...state, fetching: false, data: action.response};
        case LOAD_FAILURE:
        case SAVE_FAILURE:
            return {...state, error: true, fetching: false};
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

function pageView(state={}, action){
    switch(action.type){
        case SET_PAGE_VIEW:
            return {...state, mode: action.view}
    }
    return state;
}

function formView(state={}, action){
    switch(action.type){
        case SET_FORM_VIEW:
            return {...state, mode: action.view}
    }
    return state;
}

function preview(state={}, action){
    switch(action.type){
        case SET_PREVIEW:
            return {...state, preview: action.preview}
        case PREVIEW_REQUEST:
            return {...state, fetching: true, current: true};
        case PREVIEW_SUCCESS:
            return {...state, fetching: false};
        case PREVIEW_FAILURE:
            return {...state, error: true, fetching: false};
        case SET_FORM:
        case UPDATE_VALUES:
            return {...state, error: false, current: false};
    }
    return state;
}

function templates(state={}, action){
    switch(action.type){
        case SELECT_TEMPLATE:
            return {...state, ...action.data}
    }
    return state;
}

const rootReducer = combineReducers({
    active,
    status,
    modals,
    pageView,
    formView,
    preview,
    savedStates,
    templates,
    routing: routerReducer
});


export default rootReducer;