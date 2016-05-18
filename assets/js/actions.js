import fetch from 'isomorphic-fetch';


export const UPDATE_VALUES = 'UPDATE_VALUES';
export const RENDER_REQUEST = 'RENDER_REQUEST';
export const RENDER_SUCCESS = 'RENDER_SUCCESS';
export const RENDER_FAILURE = 'RENDER_FAILURE';

export const PREVIEW_REQUEST = 'PREVIEW_REQUEST';
export const PREVIEW_SUCCESS = 'PREVIEW_SUCCESS';
export const PREVIEW_FAILURE = 'PREVIEW_FAILURE';

export const SAVE_REQUEST = 'SAVE_REQUEST';
export const SAVE_SUCCESS = 'SAVE_SUCCESS';
export const SAVE_FAILURE = 'SAVE_FAILURE';

export const LOAD_REQUEST = 'LOAD_REQUEST';
export const LOAD_SUCCESS = 'LOAD_SUCCESS';
export const LOAD_FAILURE = 'LOAD_FAILURE';

export const HIDE_ERROR = 'HIDE_ERROR';
export const SET_FORM = 'SET_FORM';
export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const SET_ACTIVE_STATE= 'SET_ACTIVE_STATE';
export const SET_PAGE_VIEW = 'SET_FORM_VIEW';
export const SET_FORM_VIEW = 'SET_PAGE_VIEW';
export const SET_PREVIEW = 'SET_PREVIEW';


export const SELECT_TEMPLATE = 'SELECT_TEMPLATE';

const json_headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export function selectTemplate(data){
    return {
        type: SELECT_TEMPLATE, data
    }
}

export function updateValues(data){
    return {
        type: UPDATE_VALUES, data
    }
}

export function setFormView(view){
    return {
        type: SET_FORM_VIEW, view
    }
}

export function setPageView(view){
    return {
        type: SET_PAGE_VIEW, view
    }
}
export function setPreview(preview){
    return {
        type: SET_PREVIEW, preview
    }
}


export function setForm(data){
    return {
        type: SET_FORM, data
    }
}

export function hideError(){
    return {
        type: HIDE_ERROR
    }
}

export function openModal(modal){
    return {
        type: OPEN_MODAL, modal
    }
}

export function closeModal(modal){
    return {
        type: CLOSE_MODAL, modal
    }
}

export function setActiveState(data){
    return {
        type: SET_ACTIVE_STATE, data
    }
}

export function save(data) {
    return {
        types: [SAVE_REQUEST, SAVE_SUCCESS, SAVE_FAILURE],
        callAPI: () => fetch('/save', {
            method: 'POST',
            shouldCallAPI: (state) => { !state.save.fetching },
            headers: json_headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'
        })
    };
}

export function load() {
    return {
        types: [LOAD_REQUEST, LOAD_SUCCESS, LOAD_FAILURE],
        callAPI: () => fetch('/load', {
            method: 'GET',
            shouldCallAPI: (state) => { !state.savedStates.fetching },
            headers: json_headers,
            credentials: 'same-origin'
        })
    };
}

export function renderDocument(data) {
    return {
        types: [RENDER_REQUEST, RENDER_SUCCESS, RENDER_FAILURE],
        callAPI: () => fetch('/render', {
            method: 'POST',
            shouldCallAPI: (state) => { !state.savedStates.fetching },
            headers: json_headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'
        })
    };
}

export function renderPreview(data) {
    return {
        types: [PREVIEW_REQUEST, PREVIEW_SUCCESS, PREVIEW_FAILURE],
        callAPI: () => fetch('/render', {
            method: 'POST',
            shouldCallAPI: (state) => { !state.preview.fetching && !state.preview.error },
            headers: json_headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'
        })
    };
}