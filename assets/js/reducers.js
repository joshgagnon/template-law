import { combineReducers } from 'redux';
import { UPDATE_VALUES, SET_FORM, RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE, HIDE_ERROR } from './actions';

function active(state = {form: 'Letter of Engagement', values: {}}, action) {
    switch(action.type){
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

const rootReducer = combineReducers({
    active,
    status
});


export default rootReducer;