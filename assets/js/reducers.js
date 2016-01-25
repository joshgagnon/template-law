import { combineReducers } from 'redux';
import { UPDATE_VALUES, SET_FORM, RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE, HIDE_ERROR, OPEN_MODAL, CLOSE_MODAL, SET_ACTIVE_STATE } from './actions';

function active(state = {form: 'Letter of Engagement', values: {}}, action) {
    switch(action.type){
        case SET_ACTIVE_STATE:
            return action.data;
        case UPDATE_VALUES:
            return {...state, values: {...action.data}};
        case SET_FORM:
            return {...state, form: action.data.form}
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