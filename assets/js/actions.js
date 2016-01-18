import fetch from 'isomorphic-fetch';


export const UPDATE_VALUES = 'UPDATE_VALUES';
export const RENDER_REQUEST = 'RENDER_REQUEST';
export const RENDER_SUCCESS = 'RENDER_SUCCESS';
export const RENDER_FAILURE = 'RENDER_FAILURE';
export const SET_FORM = 'SET_FORM';


const json_headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export function updateValues(data){
    return {
        type: UPDATE_VALUES, data
    }
}

export function setForm(data){
    return {
        type: SET_FORM, data
    }
}


export function renderDocument(data) {
    return {
        types: [RENDER_REQUEST , RENDER_SUCCESS, RENDER_FAILURE],
        callAPI: () => fetch('/render', {
            method: 'POST',
            headers: json_headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'

        }),
    };
}
