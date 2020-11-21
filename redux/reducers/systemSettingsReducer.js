import {
    FETCH_SYSTEM_SETTING_SUCCESS, FETCH_SYSTEM_SETTING_FAILURE
} from 'redux/actions/systemSettingsActions';
const initialState = {
    systemSettings: [],
    loading: true,
    error: null
};
export default function systemSettingsData(state = initialState, action) {
    switch (action.type) {
        case FETCH_SYSTEM_SETTING_SUCCESS:
            return {
                ...state,
                loading: false,
                systemSettings: action.payload
            }
        case FETCH_SYSTEM_SETTING_FAILURE:
            return {
                ...state,
                loading: false,
                systemSettings: [],
                error: true
            }
        default:
            // ALWAYS have a default case in a reducer
            return state;
    }
}